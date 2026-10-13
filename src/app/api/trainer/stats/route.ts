import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { countWeeklyPersonalRecords } from "@/lib/trainer-stat-aggregation";

// GET: Retorna estatísticas dinâmicas do dashboard do trainer
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!trainerProfile) {
      return NextResponse.json(
        { error: "Perfil de treinador não encontrado." },
        { status: 404 }
      );
    }

    // IDs dos alunos deste trainer
    const studentProfiles = await prisma.studentProfile.findMany({
      where: { trainerId: trainerProfile.id },
      select: { id: true },
    });
    const studentIds = studentProfiles.map((s) => s.id);

    if (studentIds.length === 0) {
      return NextResponse.json({
        monthlyFrequency: 0,
        weeklyPRs: 0,
      });
    }

    // --- Frequência Mensal ---
    // Sessões concluídas nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Frequência mensal e máximos por exercício são leituras independentes.
    const [sessionsLast30Days, totalPlans, recentMaxAggregations, previousMaxAggregations] = await Promise.all([
      prisma.workoutSession.count({
        where: {
          studentId: { in: studentIds },
          completed: true,
          date: { gte: thirtyDaysAgo },
        },
      }),
      prisma.workoutPlan.count({
        where: { studentId: { in: studentIds } },
      }),
      prisma.exerciseLog.groupBy({
        by: ["studentId", "exerciseId"],
        _max: { weightUsed: true },
        where: {
          studentId: { in: studentIds },
          session: { date: { gte: sevenDaysAgo } },
        },
      }),
      prisma.exerciseLog.groupBy({
        by: ["studentId", "exerciseId"],
        _max: { weightUsed: true },
        where: {
          studentId: { in: studentIds },
          session: { date: { lt: sevenDaysAgo } },
        },
      }),
    ]);

    // Meta esperada: cada ficha deveria ser feita ~4x no mês (1x/semana)
    const expectedSessions = totalPlans * 4;
    const monthlyFrequency = expectedSessions > 0
      ? Math.min(Math.round((sessionsLast30Days / expectedSessions) * 1000) / 10, 100)
      : 0;

    // --- PRs da Semana ---
    // Um PR é quando um aluno registrou carga maior que todas as anteriores no mesmo exercício
    const recentMaxes = new Map<string, number>();
    for (const recent of recentMaxAggregations) {
      recentMaxes.set(
        `${recent.studentId}_${recent.exerciseId}`,
        recent._max.weightUsed ?? 0
      );
    }

    const previousMaxes = new Map<string, number>();
    for (const previous of previousMaxAggregations) {
      previousMaxes.set(
        `${previous.studentId}_${previous.exerciseId}`,
        previous._max.weightUsed ?? 0
      );
    }

    // Mantém a regra atual: precisa haver carga anterior positiva e superá-la.
    const weeklyPRs = countWeeklyPersonalRecords(recentMaxes, previousMaxes);

    return NextResponse.json({
      monthlyFrequency,
      weeklyPRs,
    });
  } catch (error) {
    console.error("ERRO AO CALCULAR STATS:", error);
    return NextResponse.json(
      { error: "Erro ao calcular estatísticas." },
      { status: 500 }
    );
  }
}
