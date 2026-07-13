import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const sessionsLast30Days = await prisma.workoutSession.count({
      where: {
        studentId: { in: studentIds },
        completed: true,
        date: { gte: thirtyDaysAgo },
      },
    });

    // Total de fichas ativas (meta: 1 sessão por ficha por semana = ~4.3 por mês)
    const totalPlans = await prisma.workoutPlan.count({
      where: { studentId: { in: studentIds } },
    });

    // Meta esperada: cada ficha deveria ser feita ~4x no mês (1x/semana)
    const expectedSessions = totalPlans * 4;
    const monthlyFrequency = expectedSessions > 0
      ? Math.min(Math.round((sessionsLast30Days / expectedSessions) * 1000) / 10, 100)
      : 0;

    // --- PRs da Semana ---
    // Um PR é quando um aluno registrou carga maior que todas as anteriores no mesmo exercício
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Logs da última semana
    const recentLogs = await prisma.exerciseLog.findMany({
      where: {
        studentId: { in: studentIds },
        session: { date: { gte: sevenDaysAgo } },
      },
      select: {
        studentId: true,
        exerciseId: true,
        weightUsed: true,
      },
    });

    // Agrupar carga máxima recente por (student, exercise)
    const recentMaxes = new Map<string, number>();
    for (const log of recentLogs) {
      const key = `${log.studentId}_${log.exerciseId}`;
      const current = recentMaxes.get(key) || 0;
      if (log.weightUsed > current) {
        recentMaxes.set(key, log.weightUsed);
      }
    }

    // Carga máxima ANTES dos últimos 7 dias para todos os alunos
    const allPreviousMaxes = await prisma.exerciseLog.groupBy({
      by: ["studentId", "exerciseId"],
      _max: { weightUsed: true },
      where: {
        studentId: { in: studentIds },
        session: { date: { lt: sevenDaysAgo } },
      },
    });

    const prevMaxMap = new Map<string, number>();
    for (const prev of allPreviousMaxes) {
      const key = `${prev.studentId}_${prev.exerciseId}`;
      prevMaxMap.set(key, prev._max.weightUsed || 0);
    }

    // Para cada par (student, exercise) com log recente, verificar se é PR
    let weeklyPRs = 0;

    for (const [key, recentMax] of recentMaxes) {
      const prevMaxWeight = prevMaxMap.get(key) || 0;

      if (recentMax > prevMaxWeight && prevMaxWeight > 0) {
        weeklyPRs++;
      }
    }

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
