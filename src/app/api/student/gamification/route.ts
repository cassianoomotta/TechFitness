import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Perfil de aluno não encontrado." },
        { status: 404 }
      );
    }

    // 1. Total de treinos realizados
    const sessions = await prisma.workoutSession.findMany({
      where: { studentId: studentProfile.id },
      include: { logs: true },
      orderBy: { date: "desc" },
    });
    const totalSessions = sessions.length;

    // Buscar fichas de treino propostas
    const studentPlans = await prisma.workoutPlan.findMany({
      where: { studentId: studentProfile.id },
      include: { exercises: true },
    });

    // 2. Total de PRs (Recordes de carga)
    const prAggregations = await prisma.exerciseLog.groupBy({
      by: ["exerciseId"],
      where: { studentId: studentProfile.id },
    });
    const prsCount = prAggregations.length;

    // 3. Contagem de medições/peso corporal registrados
    const measurementsCount = await prisma.bodyMeasurement.count({
      where: { studentId: studentProfile.id },
    });

    // 4. Calcular o Streak Atual (semanas consecutivas em que completou todos os treinos da ficha)
    let streak = 0;
    if (totalSessions > 0) {
      const getWeekStart = (d: Date) => {
        const temp = new Date(d);
        temp.setHours(0, 0, 0, 0);
        const day = temp.getDay();
        const diff = temp.getDate() - day + (day === 0 ? -6 : 1); // Segunda-feira
        const monday = new Date(temp.setDate(diff));
        return monday.toLocaleDateString("en-CA");
      };

      // Agrupar sessões por semana
      const sessionsByWeek: Record<string, typeof sessions> = {};
      for (const s of sessions) {
        const w = getWeekStart(new Date(s.date));
        if (!sessionsByWeek[w]) {
          sessionsByWeek[w] = [];
        }
        sessionsByWeek[w].push(s);
      }

      // Função para verificar se a semana foi completada
      const isWeekCompleted = (weekStr: string) => {
        const weekSessions = sessionsByWeek[weekStr] || [];
        if (weekSessions.length === 0) return false;
        if (studentPlans.length === 0) return true; // Se não tiver ficha, qualquer treino conta

        const completedPlanIds = new Set<string>();
        for (const session of weekSessions) {
          const sessionExerciseIds = new Set(session.logs.map((l) => l.exerciseId));
          let bestPlanId = null;
          let maxOverlap = 0;

          for (const plan of studentPlans) {
            const planExerciseIds = plan.exercises.map((e) => e.exerciseId);
            const overlap = planExerciseIds.filter((id) => sessionExerciseIds.has(id)).length;
            if (overlap > maxOverlap) {
              maxOverlap = overlap;
              bestPlanId = plan.id;
            }
          }

          if (bestPlanId) {
            completedPlanIds.add(bestPlanId);
          }
        }

        // A semana está completa se todos os planos foram executados
        return studentPlans.every((plan) => completedPlanIds.has(plan.id));
      };

      const today = new Date();
      const currentWeek = getWeekStart(today);
      
      const lastWeekDate = new Date(today);
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeek = getWeekStart(lastWeekDate);

      const isCurrentWeekDone = isWeekCompleted(currentWeek);
      const isLastWeekDone = isWeekCompleted(lastWeek);

      if (isCurrentWeekDone || isLastWeekDone) {
        streak = 1;
        const refDate = new Date(isCurrentWeekDone ? currentWeek : lastWeek);

        while (true) {
          refDate.setDate(refDate.getDate() - 7);
          const prevWeekStr = getWeekStart(refDate);
          if (isWeekCompleted(prevWeekStr)) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // 5. Cálculo de XP e Nível
    // Regra: Treino = 300 XP, PR = 150 XP, Medição = 100 XP
    const xpFromSessions = totalSessions * 300;
    const xpFromPrs = prsCount * 150;
    const xpFromMeasurements = measurementsCount * 100;
    const totalXp = xpFromSessions + xpFromPrs + xpFromMeasurements;

    // Cada nível exige 1000 XP
    const xpPerLevel = 1000;
    const level = Math.floor(totalXp / xpPerLevel) + 1;
    const currentLevelXp = totalXp % xpPerLevel;
    const nextLevelXpNeeded = xpPerLevel;

    // Título do nível RPG
    let levelTitle = "Recruta do Aço";
    if (level >= 3 && level <= 4) levelTitle = "Forjador de Cargas";
    else if (level >= 5 && level <= 6) levelTitle = "Guerreiro de Ferro";
    else if (level >= 7 && level <= 9) levelTitle = "Monstro da Academia";
    else if (level >= 10) levelTitle = "Lenda do Olimpo";

    // 6. Conquistas/Badges Estilizadas — Jornada Completa
    const achievementsList = [
      // ── TIER 1: Primeiros Passos ──
      {
        id: "first_step",
        title: "Primeiro Passo",
        description: "Concluiu o primeiro treino na plataforma",
        icon: "Play",
        xpReward: 100,
        unlocked: totalSessions >= 1,
        progress: Math.min(totalSessions, 1),
        target: 1,
        tier: 1,
      },
      {
        id: "pr_pioneer",
        title: "Pioneiro da Força",
        description: "Bateu seu primeiro recorde pessoal de carga (PR)",
        icon: "Zap",
        xpReward: 150,
        unlocked: prsCount >= 1,
        progress: Math.min(prsCount, 1),
        target: 1,
        tier: 1,
      },
      {
        id: "body_awareness",
        title: "Consciência Corporal",
        description: "Registrou seu peso ou medidas corporais pela primeira vez",
        icon: "Scale",
        xpReward: 100,
        unlocked: measurementsCount >= 1,
        progress: Math.min(measurementsCount, 1),
        target: 1,
        tier: 1,
      },

      // ── TIER 2: Criando o Hábito ──
      {
        id: "iron_consistency",
        title: "Consistência de Aço",
        description: "Concluiu 5 sessões de treino no total",
        icon: "Award",
        xpReward: 250,
        unlocked: totalSessions >= 5,
        progress: Math.min(totalSessions, 5),
        target: 5,
        tier: 2,
      },
      {
        id: "streak_fire",
        title: "Frequência Semanal",
        description: "Completou todas as fichas de treino por 3 semanas consecutivas",
        icon: "Flame",
        xpReward: 300,
        unlocked: streak >= 3,
        progress: Math.min(streak, 3),
        target: 3,
        tier: 2,
      },
      {
        id: "eagle_eye",
        title: "Olhar de Águia",
        description: "Registrou peso ou medidas corporais 3 vezes",
        icon: "Scale",
        xpReward: 200,
        unlocked: measurementsCount >= 3,
        progress: Math.min(measurementsCount, 3),
        target: 3,
        tier: 2,
      },

      // ── TIER 3: Evolução Real ──
      {
        id: "warrior_path",
        title: "Caminho do Guerreiro",
        description: "Completou 15 sessões de treino — disciplina notável",
        icon: "Sword",
        xpReward: 500,
        unlocked: totalSessions >= 15,
        progress: Math.min(totalSessions, 15),
        target: 15,
        tier: 3,
      },
      {
        id: "titan_strength",
        title: "Força Titânica",
        description: "Bateu 5 recordes de carga (PRs) em exercícios diferentes",
        icon: "ShieldAlert",
        xpReward: 500,
        unlocked: prsCount >= 5,
        progress: Math.min(prsCount, 5),
        target: 5,
        tier: 3,
      },
      {
        id: "inferno_streak",
        title: "Constância de Titã",
        description: "Completou todas as fichas de treino por 7 semanas consecutivas",
        icon: "Flame",
        xpReward: 600,
        unlocked: streak >= 7,
        progress: Math.min(streak, 7),
        target: 7,
        tier: 3,
      },

      // ── TIER 4: Elite / Lenda ──
      {
        id: "centurion",
        title: "Centurião",
        description: "Alcançou 30 sessões de treino completas",
        icon: "Crown",
        xpReward: 800,
        unlocked: totalSessions >= 30,
        progress: Math.min(totalSessions, 30),
        target: 30,
        tier: 4,
      },
      {
        id: "pr_machine",
        title: "Máquina de PRs",
        description: "Acumulou 10 recordes pessoais de carga em exercícios",
        icon: "Zap",
        xpReward: 750,
        unlocked: prsCount >= 10,
        progress: Math.min(prsCount, 10),
        target: 10,
        tier: 4,
      },
      {
        id: "olympus_legend",
        title: "Lenda do Olimpo",
        description: "Completou 50 sessões de treino — poucos chegam aqui",
        icon: "Trophy",
        xpReward: 1500,
        unlocked: totalSessions >= 50,
        progress: Math.min(totalSessions, 50),
        target: 50,
        tier: 4,
      },
    ];

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
