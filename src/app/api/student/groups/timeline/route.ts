import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateLevel, calculateStreak, calculateTier } from "@/lib/gamification";

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
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    // Obter todos os grupos aos quais o usuário logado pertence
    const myMemberships = await prisma.groupMember.findMany({
      where: { studentId: studentProfile.id },
      include: {
        group: {
          include: {
            _count: {
              select: { members: true },
            },
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
        message: "Você ainda não participa de nenhum grupo.",
      });
    }

    // Filtro opcional por grupo específico
    const { searchParams } = new URL(req.url);
    const filterGroupId = searchParams.get("groupId");

    let targetGroupIds: string[] = [];
    if (filterGroupId && filterGroupId !== "all") {
      const belongs = userGroups.some((g) => g.id === filterGroupId);
      if (!belongs) {
        return NextResponse.json(
          { error: "Você não tem permissão para visualizar este grupo." },
          { status: 403 }
        );
      }
      targetGroupIds = [filterGroupId];
    } else {
      targetGroupIds = userGroups.map((g) => g.id);
    }

    // Buscar todos os membros dos grupos alvo
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: { in: targetGroupIds } },
      include: {
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
    const mutualGroupsMap = new Map<string, Array<{ id: string; name: string; icon: string }>>();
    const memberJoinDateMap = new Map<string, Date>(); // Chave: `${studentId}_${groupId}`
    const targetStudentIdsSet = new Set<string>();

    groupMembers.forEach((member) => {
      targetStudentIdsSet.add(member.studentId);
      memberJoinDateMap.set(`${member.studentId}_${member.group.id}`, new Date(member.joinedAt));
      const existing = mutualGroupsMap.get(member.studentId) || [];
      if (!existing.some((g) => g.id === member.group.id)) {
        existing.push({
          id: member.group.id,
          name: member.group.name,
          icon: member.group.icon || "🏋️",
        });
      }
      mutualGroupsMap.set(member.studentId, existing);
    });

    const targetStudentIds = Array.from(targetStudentIdsSet);

    // Buscar estatísticas de gamificação dos atletas participantes apenas 1 vez (redução massiva de overhead)
    const authorProfiles = await prisma.studentProfile.findMany({
      where: { id: { in: targetStudentIds } },
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
    });

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

    // Buscar as sessões dos membros (limitado às últimas 40 para alta velocidade)
    const sessions = await prisma.workoutSession.findMany({
      where: {
        studentId: { in: targetStudentIds },
        completed: true,
      },
      include: {
        student: {
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
        logs: {
          select: {
            exercise: {
              select: {
                id: true,
                name: true,
                muscleGroup: true,
              },
            },
            weightUsed: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 40,
    });

    // Formatar cada item da timeline respeitando os grupos selecionados pelo autor (targetGroupIds)
    const timeline = sessions
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
        const mutualGroups = mutualGroupsMap.get(sess.studentId) || [];

        // Filtrar de acordo com os grupos selecionados pelo autor na postagem (targetGroupIds)
        let rawTargetIds: string[] = [];
        if (Array.isArray(sess.targetGroupIds)) {
          rawTargetIds = sess.targetGroupIds as string[];
        } else if (typeof sess.targetGroupIds === "string") {
          try {
            const parsed = JSON.parse(sess.targetGroupIds);
            if (Array.isArray(parsed)) rawTargetIds = parsed;
          } catch (e) {}
        }

        const isAllGroups = rawTargetIds.length === 0 || rawTargetIds.includes("ALL");
        const sessDate = new Date(sess.date);

        // Regra de Isolamento: Apenas exibe o post para grupos onde o atleta já era membro no momento do treino.
        // Ao entrar em um novo grupo, o atleta começa do zero e não carrega postagens anteriores realizadas em outros grupos.
        const visibleGroups = mutualGroups.filter((g) => {
          const joinDate = memberJoinDateMap.get(`${sess.studentId}_${g.id}`);
          if (!joinDate || sessDate < joinDate) {
            return false;
          }
          if (!isAllGroups && !rawTargetIds.includes(g.id)) {
            return false;
          }
          return true;
        });

        // Se o treino foi realizado antes de ingressar no grupo ou não foi direcionado a ele, não exibe
        if (visibleGroups.length === 0) {
          return null;
        }

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
    });
  } catch (error) {
    console.error("ERRO AO CARREGAR TIMELINE DOS GRUPOS:", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar feed social dos grupos." },
      { status: 500 }
    );
  }
}
