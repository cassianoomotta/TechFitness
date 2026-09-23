import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  calculateXp,
  getLevelTitle,
  getWeeklyGoalFromPlans,
  calculatePeriodXp,
  getWeekStart,
} from "@/lib/gamification";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [name, domain] = parts;
  const maskedName = name.length <= 2 ? name[0] + "***" : name.slice(0, 2) + "***" + name.slice(-1);
  return `${maskedName}@${domain}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    // 1. Identificar perfil e atletas participantes em uma única query aninhada
    const currentUserProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        groupMemberships: {
          select: {
            group: {
              select: {
                members: {
                  select: { studentId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!currentUserProfile) {
      return NextResponse.json(
        { error: "Perfil não encontrado." },
        { status: 404 }
      );
    }

    // Coleta IDs únicos de todos os atletas das turmas do aluno
    const memberIds = new Set<string>([currentUserProfile.id]);
    for (const gm of currentUserProfile.groupMemberships || []) {
      for (const m of gm.group?.members || []) {
        if (m.studentId) memberIds.add(m.studentId);
      }
    }
    const targetStudentIds = Array.from(memberIds);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const periodStartDate = startOfMonth < sevenDaysAgo ? startOfMonth : sevenDaysAgo;

    // 2. Executa em paralelo: dados dos estudantes com planos, sessões do período e contagem de PRs agrupada
    const [students, prGroups] = await Promise.all([
      prisma.studentProfile.findMany({
        where: { id: { in: targetStudentIds } },
        select: {
          id: true,
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          workoutPlans: {
            select: {
              weekDays: true,
              division: true,
            },
          },
          _count: {
            select: {
              sessions: true,
              measurements: true,
            },
          },
          sessions: {
            where: {
              date: { gte: periodStartDate },
            },
            select: {
              id: true,
              date: true,
              photoUrl: true,
              durationMs: true,
              satisfaction: true,
            },
            orderBy: { date: "desc" },
          },
        },
      }),
      prisma.exerciseLog.groupBy({
        by: ["studentId", "exerciseId"],
        where: { studentId: { in: targetStudentIds } },
      }),
    ]);

    // Mapeamento O(1) de recordes pessoais (PRs) por aluno
    const prsCountByStudent = new Map<string, number>();
    for (const pr of prGroups) {
      prsCountByStudent.set(pr.studentId, (prsCountByStudent.get(pr.studentId) || 0) + 1);
    }

    const DAY_NAMES: Record<number, { short: string; full: string }> = {
      0: { short: "DOM", full: "Domingo" },
      1: { short: "SEG", full: "Segunda-feira" },
      2: { short: "TER", full: "Terça-feira" },
      3: { short: "QUA", full: "Quarta-feira" },
      4: { short: "QUI", full: "Quinta-feira" },
      5: { short: "SEX", full: "Sexta-feira" },
      6: { short: "SÁB", full: "Sábado" },
    };

    // Calcular XP Semanal, Mensal e Geral com base na meta da ficha de cada atleta
    const processedStudents = students.map((student) => {
      const totalSessions = student._count.sessions;
      const measurementsCount = student._count.measurements;
      const prsCount = prsCountByStudent.get(student.id) || 0;
      const weeklyGoal = getWeeklyGoalFromPlans(student.workoutPlans);

      // 1. XP Geral (All-time)
      const allTimeResult = calculateXp(totalSessions, prsCount, measurementsCount);
      const levelTitle = getLevelTitle(allTimeResult.level);

      // 2. XP Semanal (Semana Atual)
      const weeklyResult = calculatePeriodXp(
        student.sessions,
        weeklyGoal,
        prsCount,
        measurementsCount,
        "weekly"
      );

      // 3. XP Mensal (Mês Atual)
      const monthlyResult = calculatePeriodXp(
        student.sessions,
        weeklyGoal,
        prsCount,
        measurementsCount,
        "monthly"
      );

      // Check-ins fotográficos dos últimos 7 dias para o mural/feed
      const weeklyCheckins = student.sessions
        .filter((s) => s.photoUrl && new Date(s.date) >= sevenDaysAgo)
        .map((s) => {
          const d = new Date(s.date);
          const dayInfo = DAY_NAMES[d.getDay()] || { short: "TREINO", full: "Dia de Treino" };
          const formattedDate = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
          return {
            id: s.id,
            date: s.date,
            dayOfWeek: dayInfo.short,
            dayOfWeekFull: dayInfo.full,
            formattedDate,
            photoUrl: s.photoUrl,
            durationMinutes: s.durationMs ? Math.round(s.durationMs / 60000) : 0,
            satisfaction: s.satisfaction,
          };
        });

      return {
        id: student.id,
        name: student.user.name || student.user.email.split("@")[0],
        email: maskEmail(student.user.email),
        image: student.user.image,
        weeklyGoal,
        // Pontuações
        weeklyXp: weeklyResult.totalXp,
        monthlyXp: monthlyResult.totalXp,
        totalXp: allTimeResult.totalXp,
        level: allTimeResult.level,
        levelTitle,
        totalSessions,
        weeklyCheckins,
      };
    });

    // Helper para gerar ordenação e posições por período
    const buildPeriodRanking = (xpKey: "weeklyXp" | "monthlyXp" | "totalXp") => {
      const sorted = [...processedStudents]
        .map((s) => ({
          ...s,
          // Para visualização, o display XP é o XP do período correspondente
          displayXp: s[xpKey],
        }))
        .sort((a, b) => b.displayXp - a.displayXp);

      const top5 = sorted.slice(0, 5);
      const userPosition = currentUserProfile
        ? sorted.findIndex((s) => s.id === currentUserProfile.id) + 1
        : -1;

      return { top5, allRanked: sorted, userPosition };
    };

    const weeklyData = buildPeriodRanking("weeklyXp");
    const monthlyData = buildPeriodRanking("monthlyXp");
    const allTimeData = buildPeriodRanking("totalXp");

    // Feed agregado de fotos da semana
    const weeklyFeed = processedStudents
      .flatMap((s) =>
        s.weeklyCheckins.map((chk) => ({
          ...chk,
          studentId: s.id,
          studentName: s.name,
          studentImage: s.image,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      // Padrão semanal para disputa contínua e dinâmica
      top5: weeklyData.top5,
      allRanked: weeklyData.allRanked,
      userPosition: weeklyData.userPosition,
      totalParticipants: processedStudents.length,
      weeklyFeed,
      periods: {
        weekly: weeklyData,
        monthly: monthlyData,
        allTime: allTimeData,
      },
    });
  } catch (error) {
    console.error("ERRO AO BUSCAR RANKING DE GAMIFICACAO:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar ranking." },
      { status: 500 }
    );
  }
}
