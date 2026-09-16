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

    // Mapear grupos em comum para cada atleta
    const mutualGroupsMap = new Map<string, Array<{ id: string; name: string; icon: string }>>();
    const targetStudentIdsSet = new Set<string>();

    groupMembers.forEach((member) => {
      targetStudentIdsSet.add(member.studentId);
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

    // Buscar as sessões dos membros (priorizando as que têm fotoUrl de check-in)
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
            sessions: {
              select: {
                id: true,
                date: true,
              },
            },
            measurements: {
              select: {
                id: true,
              },
            },
            logs: {
              select: {
                exerciseId: true,
              },
            },
          },
        },
        logs: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                muscleGroup: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 50,
    });

    // Formatar cada item da timeline
    const timeline = sessions.map((sess) => {
      const student = sess.student;
      const allDates = student.sessions.map((s) => s.date);
      const streak = calculateStreak(allDates);

      const workoutsCount = student.sessions.length;
      const measurementsCount = student.measurements.length;
      const uniqueExercisesCount = new Set(student.logs.map((l) => l.exerciseId)).size;
      const totalXp = workoutsCount * 50 + uniqueExercisesCount * 20 + measurementsCount * 30;

      const levelInfo = calculateLevel(totalXp);
      const tierInfo = calculateTier(levelInfo.level);

      // Agrupar logs de exercícios desta sessão
      const exerciseSummaryMap = new Map<string, { name: string; sets: number; maxWeight: number }>();
      sess.logs.forEach((log) => {
        const exName = log.exercise.name;
        const current = exerciseSummaryMap.get(exName) || { name: exName, sets: 0, maxWeight: 0 };
        current.sets += 1;
        if (log.weightUsed > current.maxWeight) {
          current.maxWeight = log.weightUsed;
        }
        exerciseSummaryMap.set(exName, current);
      });

      const exercisesSummary = Array.from(exerciseSummaryMap.values());

      return {
        id: sess.id,
        date: sess.date.toISOString(),
        durationMs: sess.durationMs,
        satisfaction: sess.satisfaction,
        photoUrl: sess.photoUrl,
        isMe: sess.studentId === studentProfile.id,
        student: {
          id: student.id,
          name: student.user.name || "Atleta",
          image: student.user.image,
          streak,
          level: levelInfo.level,
          levelTitle: levelInfo.title,
          tierName: tierInfo.name,
          tierBadge: tierInfo.badge,
        },
        groups: mutualGroupsMap.get(sess.studentId) || [],
        exercises: exercisesSummary,
        exercisesCount: exercisesSummary.length,
      };
    });

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
