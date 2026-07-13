import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const workoutSessionSchema = z.object({
  durationMs: z.number().int().min(0, "A duração não pode ser negativa"),
  satisfaction: z.number().int().min(1).max(10, "Esforço geral deve ser entre 1 e 10"),
  logs: z.array(
    z.object({
      exerciseId: z.string().min(1),
      setNumber: z.number().int().min(1),
      weightUsed: z.number().min(0),
      repsPerformed: z.number().int().min(0),
      rpe: z.number().int().min(1).max(10).optional().nullable(),
      failed: z.boolean().default(false),
    })
  ).min(1, "O treino deve conter pelo menos 1 série executada"),
});

// POST: Registrar a conclusão de uma sessão de treino pelo aluno
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas alunos podem salvar sessões de treino." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = workoutSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }



    // Buscar perfil do aluno correspondente
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Perfil de aluno não encontrado." },
        { status: 404 }
      );
    }

    const { durationMs, satisfaction, logs } = validation.data;

    // Buscar as fichas de treino propostas
    const studentPlans = await prisma.workoutPlan.findMany({
      where: { studentId: studentProfile.id },
      include: { exercises: true }
    });

    // --- CÁLCULO DE CONQUISTAS ANTES DE SALVAR ---
    const sessionsBefore = await prisma.workoutSession.findMany({
      where: { studentId: studentProfile.id },
      include: { logs: true },
      orderBy: { date: "desc" },
    });
    
    const prAggregationsBefore = await prisma.exerciseLog.groupBy({
      by: ["exerciseId"],
      where: { studentId: studentProfile.id },
    });
    
    const measurementsCount = await prisma.bodyMeasurement.count({
      where: { studentId: studentProfile.id },
    });

    const totalSessionsBefore = sessionsBefore.length;
    const prsCountBefore = prAggregationsBefore.length;
    const streakBefore = calculateStreak(sessionsBefore, studentPlans);

    const unlockedBefore = getUnlockedAchievements(totalSessionsBefore, prsCountBefore, streakBefore, measurementsCount);

    // Salvar no banco via transação atômica
    const result = await prisma.$transaction(async (tx) => {
      const workoutSession = await tx.workoutSession.create({
        data: {
          studentId: studentProfile.id,
          durationMs,
          satisfaction,
          completed: true,
        },
      });

      // Mapear logs
      const logsPayload = logs.map((log) => ({
        studentId: studentProfile.id,
        sessionId: workoutSession.id,
        exerciseId: log.exerciseId,
        setNumber: log.setNumber,
        weightUsed: log.weightUsed,
        repsPerformed: log.repsPerformed,
        rpe: log.rpe || null,
        failed: log.failed,
      }));

      await tx.exerciseLog.createMany({
        data: logsPayload,
      });

      return workoutSession;
    });

    // --- CÁLCULO DE CONQUISTAS DEPOIS DE SALVAR ---
    const sessionsAfter = await prisma.workoutSession.findMany({
      where: { studentId: studentProfile.id },
      include: { logs: true },
      orderBy: { date: "desc" },
    });
    
    const prAggregationsAfter = await prisma.exerciseLog.groupBy({
      by: ["exerciseId"],
      where: { studentId: studentProfile.id },
    });

    const totalSessionsAfter = sessionsAfter.length;
    const prsCountAfter = prAggregationsAfter.length;
    const streakAfter = calculateStreak(sessionsAfter, studentPlans);

    const unlockedAfter = getUnlockedAchievements(totalSessionsAfter, prsCountAfter, streakAfter, measurementsCount);

    // Conquistas recém-desbloqueadas
    const newlyUnlockedIds = unlockedAfter.filter((id) => !unlockedBefore.includes(id));
    const newlyUnlocked = ALL_ACHIEVEMENTS.filter((ach) => newlyUnlockedIds.includes(ach.id));

    return NextResponse.json({
      session: result,
      newAchievements: newlyUnlocked,
    }, { status: 201 });
  } catch (error) {
    console.error("ERRO AO SALVAR SESSÃO DE TREINO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao salvar sua sessão de treino." },
      { status: 500 }
    );
  }
}

// --- FUNÇÕES DE GAMIFICAÇÃO (módulo centralizado) ---
import {
  ALL_ACHIEVEMENTS,
  calculateStreak,
  getUnlockedAchievements,
} from "@/lib/gamification";

