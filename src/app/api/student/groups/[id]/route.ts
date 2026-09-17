import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateStreak, calculateXp, getLevelTitle } from "@/lib/gamification";
import { z } from "zod";

const updateGroupSchema = z.object({
  name: z.string().trim().min(3).max(40).optional(),
  description: z.string().trim().max(250).optional(),
  icon: z.string().trim().max(10).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    const { id } = await params;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Verificar se o grupo existe
    const group = await prisma.workoutGroup.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        members: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
                _count: {
                  select: {
                    sessions: true,
                    logs: true,
                    measurements: true,
                  },
                },
                sessions: {
                  select: {
                    id: true,
                    date: true,
                    photoUrl: true,
                    durationMs: true,
                    satisfaction: true,
                  },
                  orderBy: { date: "desc" },
                  take: 60,
                },
                measurements: {
                  select: {
                    id: true,
                    date: true,
                  },
                  where: {
                    date: { gte: sevenDaysAgo },
                  },
                },
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
    }

    // Verificar se o aluno atual é membro deste grupo
    const currentMemberRecord = group.members.find(
      (m) => m.studentId === studentProfile.id
    );

    if (!currentMemberRecord) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo." },
        { status: 403 }
      );
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

    // Calcular estatísticas de gamificação de cada membro
    const memberStats = group.members.map((m) => {
      const s = m.student;
      const totalSessions = s._count.sessions;
      const prsCount = Math.min(s._count.logs, totalSessions * 3);
      const measurementsCount = s._count.measurements;

      // XP Geral
      const { totalXp, level, currentLevelXp, nextLevelXpNeeded } = calculateXp(
        totalSessions,
        prsCount,
        measurementsCount
      );
      const levelTitle = getLevelTitle(level);

      // Streak
      const streak = calculateStreak(s.sessions.map((sess) => sess.date));

      // Métricas da Semana (Últimos 7 dias)
      const weeklySessions = s.sessions.filter(
        (sess) => new Date(sess.date) >= sevenDaysAgo
      );
      const weeklyPRs = Math.min(weeklySessions.length * 2, s._count.logs);
      const weeklyMeasurements = s.measurements.length;

      const weeklyXp =
        weeklySessions.length * 300 +
        weeklyPRs * 150 +
        weeklyMeasurements * 100;

      // Check-ins com foto dos últimos 7 dias
      const weeklyCheckins = weeklySessions
        .filter((sess) => sess.photoUrl)
        .map((sess) => {
          const d = new Date(sess.date);
          const dayInfo = DAY_NAMES[d.getDay()] || {
            short: "TREINO",
            full: "Dia de Treino",
          };
          return {
            id: sess.id,
            date: sess.date,
            dayOfWeek: dayInfo.short,
            dayOfWeekFull: dayInfo.full,
            formattedDate: d.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            }),
            photoUrl: sess.photoUrl,
            durationMinutes: Math.round(sess.durationMs / 60000),
            satisfaction: sess.satisfaction,
          };
        });

      const isMe = s.id === studentProfile.id;
      const isCreator = m.role === "CREATOR" || group.creatorId === s.id;

      return {
        memberId: m.id,
        studentId: s.id,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
        isMe,
        isCreator,
        name: s.user.name || "Atleta",
        image: s.user.image,
        totalXp,
        level,
        levelTitle,
        currentLevelXp,
        nextLevelXpNeeded,
        streak,
        totalSessions,
        prsCount,
        weeklyXp,
        weeklySessionsCount: weeklySessions.length,
        weeklyCheckins,
      };
    });

    // Leaderboard Geral (ordenado por totalXp decrescente)
    const allTimeLeaderboard = [...memberStats]
      .sort((a, b) => b.totalXp - a.totalXp)
      .map((member, index) => ({
        ...member,
        rank: index + 1,
      }));

    // Leaderboard Semanal (ordenado por weeklyXp decrescente)
    const weeklyLeaderboard = [...memberStats]
      .sort((a, b) => b.weeklyXp - a.weeklyXp || b.totalXp - a.totalXp)
      .map((member, index) => ({
        ...member,
        rank: index + 1,
      }));

    // Feed de Fotos Recentes da Galera do Grupo
    const photoFeed = memberStats
      .flatMap((member) =>
        member.weeklyCheckins.map((chk) => ({
          ...chk,
          studentId: member.studentId,
          studentName: member.name,
          studentImage: member.image,
          isCreator: member.isCreator,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Posição do usuário logado
    const myAllTimeRank = allTimeLeaderboard.find((m) => m.isMe)?.rank ?? null;
    const myWeeklyRank = weeklyLeaderboard.find((m) => m.isMe)?.rank ?? null;

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        icon: group.icon || "🏋️",
        code: group.code,
        creatorId: group.creatorId,
        creatorName: group.creator.user.name || "Atleta",
        creatorImage: group.creator.user.image,
        isCreator: group.creatorId === studentProfile.id,
        myRole: currentMemberRecord.role,
        createdAt: group.createdAt.toISOString(),
        totalMembers: group.members.length,
        membersCount: group.members.length,
        members: allTimeLeaderboard.map((member) => ({
          id: member.memberId,
          role: member.role,
          joinedAt: member.joinedAt,
          student: {
            id: member.studentId,
            name: member.name,
            image: member.image,
            streak: member.streak,
            workoutsCount: member.totalSessions,
            totalXp: member.totalXp,
            level: member.level,
            levelTitle: member.levelTitle,
          },
        })),
      },
      allTimeLeaderboard,
      weeklyLeaderboard,
      photoFeed,
      myRanks: {
        allTime: myAllTimeRank,
        weekly: myWeeklyRank,
      },
    });
  } catch (error) {
    console.error("ERRO AO BUSCAR GRUPO:", error);
    return NextResponse.json({ error: "Erro interno ao buscar grupo." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    const { id } = await params;
    const group = await prisma.workoutGroup.findUnique({ where: { id } });

    if (!group) {
      return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
    }

    if (group.creatorId !== studentProfile.id) {
      return NextResponse.json(
        { error: "Apenas o criador do grupo pode editar as informações." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const parseResult = updateGroupSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const updated = await prisma.workoutGroup.update({
      where: { id },
      data: parseResult.data,
    });

    return NextResponse.json({ success: true, group: updated });
  } catch (error) {
    console.error("ERRO AO ATUALIZAR GRUPO:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar grupo." }, { status: 500 });
  }
}

export const PUT = PATCH;

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    const { id } = await params;
    const group = await prisma.workoutGroup.findUnique({ where: { id } });

    if (!group) {
      return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
    }

    if (group.creatorId !== studentProfile.id) {
      return NextResponse.json(
        { error: "Apenas o criador do grupo pode excluir o grupo." },
        { status: 403 }
      );
    }

    await prisma.workoutGroup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Grupo excluído com sucesso." });
  } catch (error) {
    console.error("ERRO AO EXCLUIR GRUPO:", error);
    return NextResponse.json({ error: "Erro interno ao excluir grupo." }, { status: 500 });
  }
}
