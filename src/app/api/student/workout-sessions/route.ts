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

    // --- CÁLCULO DE CONQUISTAS ANTES DE SALVAR ---
    const sessionsBefore = await prisma.workoutSession.findMany({
      where: { studentId: studentProfile.id },
      select: { date: true },
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
    const streakBefore = calculateStreak(sessionsBefore);

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
      select: { date: true },
      orderBy: { date: "desc" },
    });
    
    const prAggregationsAfter = await prisma.exerciseLog.groupBy({
      by: ["exerciseId"],
      where: { studentId: studentProfile.id },
    });

    const totalSessionsAfter = sessionsAfter.length;
    const prsCountAfter = prAggregationsAfter.length;
    const streakAfter = calculateStreak(sessionsAfter);

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
  { id: "streak_fire", title: "Fogo no Treino", description: "Alcançou um streak de 3 dias consecutivos treinando", icon: "Flame", xpReward: 300, tier: 2 },
  { id: "eagle_eye", title: "Olhar de Águia", description: "Registrou peso ou medidas corporais 3 vezes", icon: "Scale", xpReward: 200, tier: 2 },
  { id: "warrior_path", title: "Caminho do Guerreiro", description: "Completou 15 sessões de treino — disciplina notável", icon: "Sword", xpReward: 500, tier: 3 },
  { id: "titan_strength", title: "Força Titânica", description: "Bateu 5 recordes de carga (PRs) em exercícios diferentes", icon: "ShieldAlert", xpReward: 500, tier: 3 },
  { id: "inferno_streak", title: "Sequência Infernal", description: "Manteve um streak de 7 dias consecutivos de treino", icon: "Flame", xpReward: 600, tier: 3 },
  { id: "centurion", title: "Centurião", description: "Alcançou 30 sessões de treino completas", icon: "Crown", xpReward: 800, tier: 4 },
  { id: "pr_machine", title: "Máquina de PRs", description: "Acumulou 10 recordes pessoais de carga em exercícios", icon: "Zap", xpReward: 750, tier: 4 },
  { id: "olympus_legend", title: "Lenda do Olimpo", description: "Completou 50 sessões de treino — poucos chegam aqui", icon: "Trophy", xpReward: 1500, tier: 4 },
];

function calculateStreak(sessions: { date: Date }[]) {
  if (sessions.length === 0) return 0;
  
  const todayStr = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("en-CA");

  const sessionDates = new Set(
    sessions.map((s) => new Date(s.date).toLocaleDateString("en-CA"))
  );

  const hasTrainedToday = sessionDates.has(todayStr);
  const hasTrainedYesterday = sessionDates.has(yesterdayStr);

  if (!hasTrainedToday && !hasTrainedYesterday) return 0;

  let streak = 1;
  const currentRefDate = new Date(hasTrainedToday ? todayStr : yesterdayStr);
  
  while (true) {
    currentRefDate.setDate(currentRefDate.getDate() - 1);
    const checkStr = currentRefDate.toLocaleDateString("en-CA");
    if (sessionDates.has(checkStr)) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
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
