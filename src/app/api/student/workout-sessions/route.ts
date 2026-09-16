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

    const exerciseIds = Array.from(new Set(logs.map((l: { exerciseId: string }) => l.exerciseId)));

    // --- CÁLCULO DE CONQUISTAS E PRS (CONSULTAS PARALELIZADAS) ---
    const [
      studentPlans,
      sessionsBefore,
      prAggregationsBefore,
      measurementsCount,
      exercisesInfo,
      previousLogs,
    ] = await Promise.all([
      // 1. Fichas de treino do aluno (campos necessários para streak)
      prisma.workoutPlan.findMany({
        where: { studentId: studentProfile.id },
        include: { exercises: { select: { exerciseId: true } } },
      }),
      // 2. Histórico de sessões (seleção leve de campos para o streak)
      prisma.workoutSession.findMany({
        where: { studentId: studentProfile.id },
        select: {
          id: true,
          date: true,
          logs: { select: { exerciseId: true } },
        },
        orderBy: { date: "desc" },
      }),
      // 3. Agrupamento por exercício para contagem de PRs
      prisma.exerciseLog.groupBy({
        by: ["exerciseId"],
        where: { studentId: studentProfile.id },
      }),
      // 4. Quantidade de medições corporais
      prisma.bodyMeasurement.count({
        where: { studentId: studentProfile.id },
      }),
      // 5. Nomes dos exercícios da sessão atual
      prisma.exercise.findMany({
        where: { id: { in: exerciseIds } },
        select: { id: true, name: true },
      }),
      // 6. Cargas anteriores dos exercícios presentes nesta sessão
      prisma.exerciseLog.findMany({
        where: {
          studentId: studentProfile.id,
          exerciseId: { in: exerciseIds },
        },
        select: { exerciseId: true, weightUsed: true },
      }),
    ]);

    const totalSessionsBefore = sessionsBefore.length;
    const prsCountBefore = prAggregationsBefore.length;
    const streakBefore = calculateStreak(sessionsBefore, studentPlans);

    const unlockedBefore = getUnlockedAchievements(
      totalSessionsBefore,
      prsCountBefore,
      streakBefore,
      measurementsCount
    );

    const exerciseNameMap = new Map<string, string>(exercisesInfo.map((e: { id: string; name: string }) => [e.id, e.name]));

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
    currentMaxMap.forEach((newMax: number, exId: string) => {
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
      const logsPayload = logs.map((log: { exerciseId: string; setNumber: number; weightUsed: number; repsPerformed: number; rpe?: number | null; failed: boolean }) => ({
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

    // --- CÁLCULO DE CONQUISTAS E XP DEPOIS DE SALVAR (OTIMIZADO EM MEMÓRIA - ZERO QUERIES EXTRAS) ---
    const totalSessionsAfter = totalSessionsBefore + 1;

    // Identifica se algum exercício do treino é novo para o aluno (expandindo a contagem de PRs)
    const existingExerciseIds = new Set<string>(prAggregationsBefore.map((p: { exerciseId: string }) => p.exerciseId));
    const newDistinctExercisesLogged = new Set<string>(
      logs.map((l: { exerciseId: string }) => l.exerciseId).filter((id: string) => !existingExerciseIds.has(id))
    );
    const prsCountAfter = prsCountBefore + newDistinctExercisesLogged.size;

    // Atualiza a lista de sessões em memória com a sessão recém-criada para o cálculo do Streak
    const sessionLogsSimplified = logs.map((l: { exerciseId: string }) => ({ exerciseId: l.exerciseId }));
    const sessionsAfter = [
      { date: result.date, logs: sessionLogsSimplified },
      ...sessionsBefore,
    ];
    const streakAfter = calculateStreak(sessionsAfter, studentPlans);

    const unlockedAfter = getUnlockedAchievements(
      totalSessionsAfter,
      prsCountAfter,
      streakAfter,
      measurementsCount
    );

    // Conquistas recém-desbloqueadas
    const newlyUnlockedIds = unlockedAfter.filter((id: string) => !unlockedBefore.includes(id));
    const newlyUnlocked = ALL_ACHIEVEMENTS.filter((ach) => newlyUnlockedIds.includes(ach.id));

    // Cálculo do XP ganho
    const achievementsXp = newlyUnlocked.reduce((acc: number, ach) => acc + ach.xpReward, 0);
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

