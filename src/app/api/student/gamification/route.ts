import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  calculateStreak,
  calculateXp,
  getLevelTitle,
  ALL_ACHIEVEMENTS,
  getWeeklyGoalFromPlans,
  calculateSessionsAdherence,
} from "@/lib/gamification";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Perfil de aluno não encontrado." },
        { status: 404 }
      );
    }

    const [totalSessions, sessions, studentPlans, prAggregations, measurementsCount] =
      await Promise.all([
        prisma.workoutSession.count({
          where: { studentId: studentProfile.id },
        }),
        prisma.workoutSession.findMany({
          where: { studentId: studentProfile.id },
          select: { date: true },
        }),
        prisma.workoutPlan.findMany({
          where: { studentId: studentProfile.id },
          select: { weekDays: true, division: true },
        }),
        prisma.exerciseLog.groupBy({
          by: ["exerciseId"],
          where: { studentId: studentProfile.id },
        }),
        prisma.bodyMeasurement.count({
          where: { studentId: studentProfile.id },
        }),
      ]);
    const prsCount = prAggregations.length;

    // 4. Calcular o Streak Atual e Aderência Semanal à Ficha
    const streak = calculateStreak(sessions, studentPlans);
    const weeklyGoal = getWeeklyGoalFromPlans(studentPlans);
    const { perfectWeeks, extraSessions } = calculateSessionsAdherence(sessions, weeklyGoal);

    // 5. Cálculo Justo de XP e Nível
    const { totalXp, level, currentLevelXp, nextLevelXpNeeded } =
      calculateXp(totalSessions, prsCount, measurementsCount, {
        perfectWeeks,
        extraSessions,
      });

    const levelTitle = getLevelTitle(level);

    // 6. Conquistas/Badges Estilizadas — Jornada Completa
    const achievementsList = ALL_ACHIEVEMENTS.map((ach) => {
      // Determinar progresso e unlocked com base no tipo de achievement
      let progress = 0;
      let target = 0;
      let unlocked = false;

      switch (ach.id) {
        case "first_step":
          target = 1; progress = Math.min(totalSessions, 1); unlocked = totalSessions >= 1;
          break;
        case "pr_pioneer":
          target = 1; progress = Math.min(prsCount, 1); unlocked = prsCount >= 1;
          break;
        case "body_awareness":
          target = 1; progress = Math.min(measurementsCount, 1); unlocked = measurementsCount >= 1;
          break;
        case "iron_consistency":
          target = 5; progress = Math.min(totalSessions, 5); unlocked = totalSessions >= 5;
          break;
        case "streak_fire":
          target = 3; progress = Math.min(streak, 3); unlocked = streak >= 3;
          break;
        case "eagle_eye":
          target = 3; progress = Math.min(measurementsCount, 3); unlocked = measurementsCount >= 3;
          break;
        case "warrior_path":
          target = 15; progress = Math.min(totalSessions, 15); unlocked = totalSessions >= 15;
          break;
        case "titan_strength":
          target = 5; progress = Math.min(prsCount, 5); unlocked = prsCount >= 5;
          break;
        case "inferno_streak":
          target = 7; progress = Math.min(streak, 7); unlocked = streak >= 7;
          break;
        case "centurion":
          target = 30; progress = Math.min(totalSessions, 30); unlocked = totalSessions >= 30;
          break;
        case "pr_machine":
          target = 10; progress = Math.min(prsCount, 10); unlocked = prsCount >= 10;
          break;
        case "olympus_legend":
          target = 50; progress = Math.min(totalSessions, 50); unlocked = totalSessions >= 50;
          break;
      }

      return {
        ...ach,
        unlocked,
        progress,
        target,
      };
    });

    return NextResponse.json({
      level,
      levelTitle,
      totalXp,
      currentLevelXp,
      nextLevelXpNeeded,
      streak,
      totalSessions,
      prsCount,
      measurementsCount,
      achievements: achievementsList,
    });
  } catch (error) {
    console.error("ERRO AO BUSCAR DADOS DE GAMIFICACAO:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar dados de gamificação." },
      { status: 500 }
    );
  }
}
