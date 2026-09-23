import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { calculateXp, getLevelTitle } from "@/lib/gamification";

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

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 2. Executa em paralelo: dados leves dos estudantes (_count nativo) e contagem de PRs agrupada
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
          _count: {
            select: {
              sessions: true,
              measurements: true,
            },
          },
          sessions: {
            where: {
              photoUrl: { not: null },
              date: { gte: sevenDaysAgo },
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

    // Calcular XP e mapear check-ins fotográficos dos últimos 7 dias de cada aluno
    const rankedStudents = students.map((student) => {
      const totalSessions = student._count.sessions;
      const measurementsCount = student._count.measurements;
      const prsCount = prsCountByStudent.get(student.id) || 0;

      // Usar lógica centralizada
      const { totalXp, level } = calculateXp(totalSessions, prsCount, measurementsCount);
      const levelTitle = getLevelTitle(level);

      // Check-ins com foto dos últimos 7 dias associados ao dia da semana
      const weeklyCheckins = student.sessions
        .filter((s) => s.photoUrl)
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
        totalXp,
        level,
        levelTitle,
        totalSessions,
        weeklyCheckins,
      };
    });

    // Ordenar por XP decrescente
    rankedStudents.sort((a, b) => b.totalXp - a.totalXp);

    // Feed agregado de fotos da semana de todos os colegas da equipe
    const weeklyFeed = rankedStudents
      .flatMap((s) =>
        s.weeklyCheckins.map((chk) => ({
          ...chk,
          studentId: s.id,
          studentName: s.name,
          studentImage: s.image,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pegar os top 5
    const top5 = rankedStudents.slice(0, 5);

    let userPosition = -1;
    if (currentUserProfile) {
      userPosition = rankedStudents.findIndex((s) => s.id === currentUserProfile.id) + 1;
    }

    return NextResponse.json({
      top5,
      allRanked: rankedStudents,
      userPosition,
      totalParticipants: rankedStudents.length,
      weeklyFeed,
    });
  } catch (error) {
    console.error("ERRO AO BUSCAR RANKING DE GAMIFICACAO:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar ranking." },
      { status: 500 }
    );
  }
}
