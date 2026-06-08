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

// --- FUNÇÕES AUXILIARES PARA GAMIFICAÇÃO ---

const ALL_ACHIEVEMENTS = [
  { id: "first_step", title: "Primeiro Passo", description: "Concluiu o primeiro treino na plataforma", icon: "Play", xpReward: 100, tier: 1 },
  { id: "pr_pioneer", title: "Pioneiro da Força", description: "Bateu seu primeiro recorde pessoal de carga (PR)", icon: "Zap", xpReward: 150, tier: 1 },
  { id: "body_awareness", title: "Consciência Corporal", description: "Registrou seu peso ou medidas corporais pela primeira vez", icon: "Scale", xpReward: 100, tier: 1 },
  { id: "iron_consistency", title: "Consistência de Aço", description: "Concluiu 5 sessões de treino no total", icon: "Award", xpReward: 250, tier: 2 },
  { id: "streak_fire", title: "Frequência Semanal", description: "Completou todas as fichas de treino por 3 semanas consecutivas", icon: "Flame", xpReward: 300, tier: 2 },
  { id: "eagle_eye", title: "Olhar de Águia", description: "Registrou peso ou medidas corporais 3 vezes", icon: "Scale", xpReward: 200, tier: 2 },
  { id: "warrior_path", title: "Caminho do Guerreiro", description: "Completou 15 sessões de treino — disciplina notável", icon: "Sword", xpReward: 500, tier: 3 },
  { id: "titan_strength", title: "Força Titânica", description: "Bateu 5 recordes de carga (PRs) em exercícios diferentes", icon: "ShieldAlert", xpReward: 500, tier: 3 },
  { id: "inferno_streak", title: "Constância de Titã", description: "Completou todas as fichas de treino por 7 semanas consecutivas", icon: "Flame", xpReward: 600, tier: 3 },
  { id: "centurion", title: "Centurião", description: "Alcançou 30 sessões de treino completas", icon: "Crown", xpReward: 800, tier: 4 },
  { id: "pr_machine", title: "Máquina de PRs", description: "Acumulou 10 recordes pessoais de carga em exercícios", icon: "Zap", xpReward: 750, tier: 4 },
  { id: "olympus_legend", title: "Lenda do Olimpo", description: "Completou 50 sessões de treino — poucos chegam aqui", icon: "Trophy", xpReward: 1500, tier: 4 },
];

function calculateStreak(
  sessions: { date: Date; logs: { exerciseId: string }[] }[],
  studentPlans: { id: string; exercises: { exerciseId: string }[] }[]
) {
  if (sessions.length === 0) return 0;

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
    let streak = 1;
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
    return streak;
  }

  return 0;
}

function getUnlockedAchievements(totalSessions: number, prsCount: number, streak: number, measurementsCount: number) {
  const achievements = [];
  if (totalSessions >= 1) achievements.push("first_step");
  if (prsCount >= 1) achievements.push("pr_pioneer");
  if (measurementsCount >= 1) achievements.push("body_awareness");
  if (totalSessions >= 5) achievements.push("iron_consistency");
  if (streak >= 3) achievements.push("streak_fire");
  if (measurementsCount >= 3) achievements.push("eagle_eye");
  if (totalSessions >= 15) achievements.push("warrior_path");
  if (prsCount >= 5) achievements.push("titan_strength");
  if (streak >= 7) achievements.push("inferno_streak");
  if (totalSessions >= 30) achievements.push("centurion");
  if (prsCount >= 10) achievements.push("pr_machine");
  if (totalSessions >= 50) achievements.push("olympus_legend");
  return achievements;
}
