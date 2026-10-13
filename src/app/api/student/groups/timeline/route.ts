import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateLevel, calculateStreak, calculateTier } from "@/lib/gamification";
import {
  filterVisibleTimelineGroups,
  type TimelineGroup,
  type TimelineGroupMembership,
} from "@/lib/group-timeline-visibility";
import { splitCursorPage } from "@/lib/group-timeline-pagination";

const TIMELINE_PAGE_SIZE = 12;
const PHOTO_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const timelineQuerySchema = z.object({
  groupId: z.string().min(1).max(100).optional(),
  cursor: z.string().min(1).max(100).optional(),
});

interface GroupSummary {
  id: string;
  name: string;
  icon: string;
  code: string;
  membersCount: number;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    // Obter todos os grupos aos quais o usuário logado pertence
    const myMemberships = await prisma.groupMember.findMany({
      where: { studentId: studentProfile.id },
      select: {
        group: {
          select: {
            id: true,
            name: true,
            icon: true,
            code: true,
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    const userGroups: GroupSummary[] = myMemberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      icon: m.group.icon || "🏋️",
      code: m.group.code,
      membersCount: m.group._count.members,
    }));

    if (userGroups.length === 0) {
      return NextResponse.json({
        timeline: [],
        userGroups: [],
        hasMore: false,
        nextCursor: null,
        message: "Você ainda não participa de nenhum grupo.",
      });
    }

    // Filtro opcional por grupo específico
    const { searchParams } = new URL(req.url);
    const parsedQuery = timelineQuerySchema.safeParse({
      groupId: searchParams.get("groupId") || undefined,
      cursor: searchParams.get("cursor") || undefined,
    });
    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Filtro inválido." }, { status: 400 });
    }
    const { groupId: filterGroupId, cursor } = parsedQuery.data;
    if (filterGroupId && filterGroupId !== "all" && !userGroups.some((g) => g.id === filterGroupId)) {
      return NextResponse.json(
        { error: "Você não tem permissão para visualizar este grupo." },
        { status: 403 }
      );
    }
    const targetGroupIds = filterGroupId && filterGroupId !== "all"
      ? [filterGroupId]
      : userGroups.map((g) => g.id);

    // Buscar todos os membros dos grupos alvo
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: { in: targetGroupIds } },
      select: {
        studentId: true,
        joinedAt: true,
        group: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    // Mapear grupos em comum para cada atleta e suas respectivas datas de ingresso
    const mutualGroupsMap = new Map<string, TimelineGroupMembership[]>();
    const targetStudentIdsSet = new Set<string>();

    groupMembers.forEach((member) => {
      targetStudentIdsSet.add(member.studentId);
      const existing = mutualGroupsMap.get(member.studentId) || [];
      if (!existing.some((g) => g.id === member.group.id)) {
        existing.push({
          id: member.group.id,
          name: member.group.name,
          icon: member.group.icon || "🏋️",
          joinedAt: member.joinedAt,
        });
      }
      mutualGroupsMap.set(member.studentId, existing);
    });

    const targetStudentIds = Array.from(targetStudentIdsSet);
    const photoCutoff = new Date(Date.now() - PHOTO_RETENTION_MS);

    // Buscar estatísticas de gamificação dos atletas participantes apenas 1 vez (redução massiva de overhead)
    const sessionRows = await prisma.workoutSession.findMany({
      where: {
        studentId: { in: targetStudentIds },
        completed: true,
        photoUrl: { not: null },
        date: { gte: photoCutoff },
      },
      select: {
        id: true,
        date: true,
        durationMs: true,
        satisfaction: true,
        photoUrl: true,
        studentId: true,
        targetGroupIds: true,
        student: {
          select: {
            id: true,
            user: { select: { id: true, name: true, image: true } },
          },
        },
        logs: {
          select: {
            exercise: { select: { name: true } },
            weightUsed: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: TIMELINE_PAGE_SIZE + 1,
    });
    const sessionPage = splitCursorPage(sessionRows, TIMELINE_PAGE_SIZE);

    const visibleGroupsBySessionId = new Map<string, TimelineGroup[]>();
    const visibleSessions = sessionPage.items.filter((sess) => {
      const visibleGroups = filterVisibleTimelineGroups(
        mutualGroupsMap.get(sess.studentId) || [],
        sess.date,
        sess.targetGroupIds,
      );
      if (visibleGroups.length === 0) return false;
      visibleGroupsBySessionId.set(sess.id, visibleGroups);
      return true;
    });

    // Carregar histórico somente dos autores que aparecem nesta página do mural.
    const visibleAuthorIds = Array.from(new Set(visibleSessions.map((session) => session.studentId)));
    const authorProfiles = visibleAuthorIds.length > 0
      ? await prisma.studentProfile.findMany({
          where: { id: { in: visibleAuthorIds } },
          select: {
            id: true,
            _count: {
              select: {
                sessions: true,
                measurements: true,
                logs: true,
              },
            },
            sessions: {
              select: { date: true },
              orderBy: { date: "desc" },
              take: 45,
            },
          },
        })
      : [];

    const athleteStatsMap = new Map<
      string,
      { streak: number; workoutsCount: number; level: number; levelTitle: string; tierName: string; tierBadge: string }
    >();

    authorProfiles.forEach((ap) => {
      const allDates = ap.sessions.map((s: { date: Date }) => s.date);
      const streak = calculateStreak(allDates);
      const workoutsCount = ap._count.sessions;
      const measurementsCount = ap._count.measurements;
      const logsCount = ap._count.logs;
      const totalXp = workoutsCount * 50 + Math.min(logsCount, 100) * 20 + measurementsCount * 30;
      const levelInfo = calculateLevel(totalXp);
      const tierInfo = calculateTier(levelInfo.level);

      athleteStatsMap.set(ap.id, {
        streak,
        workoutsCount,
        level: levelInfo.level,
        levelTitle: levelInfo.title,
        tierName: tierInfo.name,
        tierBadge: tierInfo.badge,
      });
    });

    // Formatar cada item da timeline respeitando os grupos selecionados pelo autor (targetGroupIds)
    const timeline = visibleSessions
      .map((sess) => {
        const stats = athleteStatsMap.get(sess.studentId) || {
          streak: 0,
          workoutsCount: 1,
          level: 1,
          levelTitle: "Iniciante",
          tierName: "Bronze",
          tierBadge: "🥉",
        };

        // Agrupar logs de exercícios desta sessão
        const exerciseSummaryMap = new Map<string, { name: string; sets: number; maxWeight: number }>();
        sess.logs.forEach((log: { exercise: { name: string }; weightUsed: number }) => {
          const exName = log.exercise.name;
          const current = exerciseSummaryMap.get(exName) || { name: exName, sets: 0, maxWeight: 0 };
          current.sets += 1;
          if (log.weightUsed > current.maxWeight) {
            current.maxWeight = log.weightUsed;
          }
          exerciseSummaryMap.set(exName, current);
        });

        const exercisesSummary = Array.from(exerciseSummaryMap.values());

        // Grupos em comum entre o autor da postagem e o usuário logado
        const visibleGroups = visibleGroupsBySessionId.get(sess.id) || [];

        return {
          id: sess.id,
          date: sess.date.toISOString(),
          durationMs: sess.durationMs,
          satisfaction: sess.satisfaction,
          photoUrl: sess.photoUrl,
          isMe: sess.studentId === studentProfile.id,
          student: {
            id: sess.student.id,
            name: sess.student.user.name || "Atleta",
            image: sess.student.user.image,
            streak: stats.streak,
            level: stats.level,
            levelTitle: stats.levelTitle,
            tierName: stats.tierName,
            tierBadge: stats.tierBadge,
          },
          groups: visibleGroups,
          exercises: exercisesSummary,
          exercisesCount: exercisesSummary.length,
        };
      })
      .filter((post): post is NonNullable<typeof post> => post !== null);

    return NextResponse.json({
      timeline,
      userGroups,
      hasMore: sessionPage.hasMore,
      nextCursor: sessionPage.nextCursor,
    });
  } catch (error) {
    console.error("ERRO AO CARREGAR TIMELINE DOS GRUPOS:", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar feed social dos grupos." },
      { status: 500 }
    );
  }
}
