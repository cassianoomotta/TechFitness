import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { calculateXp, getLevelTitle } from "@/lib/gamification";

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

    // Identificar perfil atual primeiro para saber o trainerId
    const currentUserProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!currentUserProfile) {
      return NextResponse.json(
        { error: "Perfil não encontrado." },
        { status: 404 }
      );
    }

    // 1. Buscar todos os grupos que o aluno atual participa
    const userMemberships = await prisma.groupMember.findMany({
      where: { studentId: currentUserProfile.id },
      select: { groupId: true },
    });

    const userGroupIds = userMemberships.map((m) => m.groupId);

    // 2. Determinar os atletas participantes: todos os membros de todas as turmas do aluno (totalizados e deduplicados)
    let targetStudentIds: string[] = [];

    if (userGroupIds.length === 0) {
      // Se ainda não participa de turmas, exibe o próprio aluno
      targetStudentIds = [currentUserProfile.id];
    } else {
      const groupMembers = await prisma.groupMember.findMany({
        where: { groupId: { in: userGroupIds } },
        select: { studentId: true },
      });

      // Deduplica IDs para que cada atleta apareça uma única vez com sua pontuação totalizada
      targetStudentIds = Array.from(
        new Set([currentUserProfile.id, ...groupMembers.map((m) => m.studentId)])
      );
    }

    // Buscar perfis dos atletas dos grupos do usuário (totalizado)
    const students = await prisma.studentProfile.findMany({
      where: { id: { in: targetStudentIds } },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
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
        },
        measurements: {
          select: { id: true },
        },
        logs: {
          select: { exerciseId: true },
        },
      },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

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
      const totalSessions = student.sessions.length;
      
      // Contagem de exercícios únicos com registro de carga (PRs)
      const uniqueExercises = new Set(student.logs.map((log) => log.exerciseId));
      const prsCount = uniqueExercises.size;

      const measurementsCount = student.measurements.length;

      // Usar lógica centralizada
      const { totalXp, level } = calculateXp(totalSessions, prsCount, measurementsCount);
      const levelTitle = getLevelTitle(level);

      // Check-ins com foto dos últimos 7 dias associados ao dia da semana
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
            durationMinutes: Math.round(s.durationMs / 60000),
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
