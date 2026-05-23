import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { id: studentId } = await params;

    // Buscar perfil do personal trainer logado
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainerProfile) {
      return NextResponse.json(
        { error: "Perfil de treinador não encontrado." },
        { status: 404 }
      );
    }

    // Validar se o aluno pertence ao personal
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    if (student.trainerId !== trainerProfile.id) {
      return NextResponse.json(
        { error: "Acesso negado." },
        { status: 403 }
      );
    }

    // 1. Histórico de Sessões Recentes
    const sessions = await prisma.workoutSession.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 10,
    });

    // 2. Buscar plano de treino ativo do aluno para comparar metas
    const activePlans = await prisma.workoutPlan.findMany({
      where: { studentId },
      include: {
        exercises: {
          orderBy: {
            order: "asc",
          },
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const activePlan = activePlans[0] || null;

    // 3. Buscar histórico de cargas agrupado por exercício
    const logs = await prisma.exerciseLog.findMany({
      where: { studentId },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            muscleGroup: true,
          },
        },
        session: {
          select: {
            date: true,
          },
        },
      },
      orderBy: {
        session: {
          date: "asc",
        },
      },
    });

    // Agrupar os logs por exercício para construir o histórico de evolução
    const exerciseHistoryMap: Record<string, {
      exerciseId: string;
      name: string;
      muscleGroup: string;
      history: { date: Date; maxWeight: number; repsAtMaxWeight: number }[];
    }> = {};

    logs.forEach((log) => {
      const exerciseId = log.exerciseId;
      if (!exerciseHistoryMap[exerciseId]) {
        exerciseHistoryMap[exerciseId] = {
          exerciseId,
          name: log.exercise.name,
          muscleGroup: log.exercise.muscleGroup,
          history: [],
        };
      }

      const dateStr = log.session.date.toDateString();
      const existingEntry = exerciseHistoryMap[exerciseId].history.find(
        (h) => h.date.toDateString() === dateStr
      );

      if (existingEntry) {
        // Se já existe registro desse exercício nessa data, mantém a maior carga
        if (log.weightUsed > existingEntry.maxWeight) {
          existingEntry.maxWeight = log.weightUsed;
          existingEntry.repsAtMaxWeight = log.repsPerformed;
        }
      } else {
        exerciseHistoryMap[exerciseId].history.push({
          date: log.session.date,
          maxWeight: log.weightUsed,
          repsAtMaxWeight: log.repsPerformed,
        });
      }
    });

    const exerciseProgress = Object.values(exerciseHistoryMap);

    // 4. Algoritmo de Progressão Inteligente de Cargas
    const progressionSuggestions: {
      exerciseId: string;
      exerciseName: string;
      currentWeight: number;
      suggestedWeight: number;
      reason: string;
    }[] = [];

    if (activePlan) {
      activePlan.exercises.forEach((planExercise) => {
        const exId = planExercise.exerciseId;
        const historyData = exerciseHistoryMap[exId]?.history || [];

        // Precisamos de pelo menos 2 sessões registradas para avaliar progressão
        if (historyData.length >= 2) {
          // Pegar os 2 treinos mais recentes
          const recentSessions = [...historyData]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 2);

          const t1 = recentSessions[0];
          const t2 = recentSessions[1];

          // Extrair o topo das repetições prescritas (ex: "8-10" -> topo 10)
          const repsPrescribed = planExercise.reps;
          const matches = repsPrescribed.match(/\d+/g);
          const targetReps = matches
            ? Math.max(...matches.map(Number))
            : 10; // default 10 reps se falhar a conversão

          // Se nas últimas 2 sessões a carga foi a mesma e o aluno bateu ou superou as reps recomendadas
          if (
            t1.maxWeight === t2.maxWeight &&
            t1.repsAtMaxWeight >= targetReps &&
            t2.repsAtMaxWeight >= targetReps
          ) {
            const currentWeight = t1.maxWeight;
            // Sugere aumento de 2kg a 5kg dependendo do exercício
            // Exercícios de perna/costas toleram mais carga (ex: 5kg), braços/ombros toleram menos (ex: 2kg)
            const isLowerBody = ["Pernas", "Costas"].includes(planExercise.exercise.muscleGroup);
            const increment = isLowerBody ? 5 : 2;

            progressionSuggestions.push({
              exerciseId: exId,
              exerciseName: planExercise.exercise.name,
              currentWeight,
              suggestedWeight: currentWeight + increment,
              reason: `Meta de ${targetReps} reps atingida com ${currentWeight}kg nos últimos 2 treinos.`,
            });
          }
        }
      });
    }

    return NextResponse.json({
      studentName: student.user.name,
      studentEmail: student.user.email,
      totalSessionsCount: sessions.length,
      recentSessions: sessions.map((s) => ({
        id: s.id,
        date: s.date,
        durationMinutes: Math.round(s.durationMs / 60000),
        satisfaction: s.satisfaction,
      })),
      exerciseProgress,
      progressionSuggestions,
    });
  } catch (error) {
    console.error("ERRO AO PROCESSAR HISTÓRICO DE PROGRESSO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao carregar o progresso do aluno." },
      { status: 500 }
    );
  }
}
