import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  ALL_ACHIEVEMENTS,
  calculateStreak,
  getUnlockedAchievements,
  calculateSessionVolume,
  getTonnageComparison,
  calculateXp,
  getLevelTitle,
} from "@/lib/gamification";

const workoutSessionSchema = z.object({
  durationMs: z.number().int().min(0, "A duração não pode ser negativa"),
  satisfaction: z.number().int().min(1).max(10, "Esforço geral deve ser entre 1 e 10"),
  photoUrl: z.string().min(1, "A foto comprobatória do treino é obrigatória"),
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

    const { durationMs, satisfaction, photoUrl, logs } = validation.data;

    // Buscar as fichas de treino propostas
    const studentPlans = await prisma.workoutPlan.findMany({
      where: { studentId: studentProfile.id },
      include: { exercises: true },
    });

    // --- CÁLCULO DE CONQUISTAS E PRS ANTES DE SALVAR ---
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

    const unlockedBefore = getUnlockedAchievements(
      totalSessionsBefore,
      prsCountBefore,
      streakBefore,
      measurementsCount
    );

    // Identificar nomes dos exercícios e PRs anteriores
    const exerciseIds = Array.from(new Set(logs.map((l) => l.exerciseId)));
    const exercisesInfo = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true, name: true },
    });
    const exerciseNameMap = new Map(exercisesInfo.map((e) => [e.id, e.name]));

    const previousLogs = await prisma.exerciseLog.findMany({
      where: {
        studentId: studentProfile.id,
        exerciseId: { in: exerciseIds },
      },
      select: { exerciseId: true, weightUsed: true },
    });

    const previousMaxMap = new Map<string, number>();
    for (const pl of previousLogs) {
      const curr = previousMaxMap.get(pl.exerciseId) || 0;
      if (pl.weightUsed > curr) {
        previousMaxMap.set(pl.exerciseId, pl.weightUsed);
      }
    }

    // Detectar novos recordes (PRs) nesta sessão
    const currentMaxMap = new Map<string, number>();
    for (const l of logs) {
      const curr = currentMaxMap.get(l.exerciseId) || 0;
      if (l.weightUsed > curr) {
        currentMaxMap.set(l.exerciseId, l.weightUsed);
      }
    }

    const prsBeaten: { exerciseName: string; weight: number; previousWeight: number }[] = [];
    currentMaxMap.forEach((newMax, exId) => {
      const oldMax = previousMaxMap.get(exId) || 0;
      if (newMax > oldMax && newMax > 0) {
        prsBeaten.push({
          exerciseName: exerciseNameMap.get(exId) || "Exercício",
          weight: newMax,
          previousWeight: oldMax,
        });
      }
    });

    // Calcular volume de carga da sessão (Tonelagem)
    const sessionVolumeKg = calculateSessionVolume(logs);
    const tonnageComparison = getTonnageComparison(sessionVolumeKg);

    // Salvar no banco via transação atômica
    const result = await prisma.$transaction(async (tx) => {
      const workoutSession = await tx.workoutSession.create({
        data: {
          studentId: studentProfile.id,
          durationMs,
          satisfaction,
          completed: true,
          photoUrl,
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

    // --- CÁLCULO DE CONQUISTAS E XP DEPOIS DE SALVAR ---
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

    const unlockedAfter = getUnlockedAchievements(
      totalSessionsAfter,
      prsCountAfter,
      streakAfter,
      measurementsCount
    );

    // Conquistas recém-desbloqueadas
    const newlyUnlockedIds = unlockedAfter.filter((id) => !unlockedBefore.includes(id));
    const newlyUnlocked = ALL_ACHIEVEMENTS.filter((ach) => newlyUnlockedIds.includes(ach.id));

    // Cálculo do XP ganho
    const achievementsXp = newlyUnlocked.reduce((acc, ach) => acc + ach.xpReward, 0);
    const prsXp = prsBeaten.length * 150;
    const sessionXp = 300;
    const totalXpEarned = sessionXp + prsXp + achievementsXp;

    const { totalXp, level } = calculateXp(totalSessionsAfter, prsCountAfter, measurementsCount);
    const levelTitle = getLevelTitle(level);

    return NextResponse.json(
      {
        session: result,
        volumeKg: sessionVolumeKg,
        tonnageComparison,
        prsBeaten,
        xpEarned: totalXpEarned,
        totalXp,
        level,
        levelTitle,
        newAchievements: newlyUnlocked,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERRO AO SALVAR SESSÃO DE TREINO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao salvar sua sessão de treino." },
      { status: 500 }
    );
  }
}

