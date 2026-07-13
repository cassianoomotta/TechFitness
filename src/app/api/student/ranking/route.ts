import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { calculateXp, getLevelTitle } from "@/lib/gamification";

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

    // Buscar perfis de alunos do mesmo treinador apenas
    const students = await prisma.studentProfile.findMany({
      where: { trainerId: currentUserProfile.trainerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        sessions: {
          select: { id: true },
        },
        measurements: {
          select: { id: true },
        },
        logs: {
          select: { exerciseId: true },
        },
      },
    });

    // Calcular XP de cada aluno
    const rankedStudents = students.map((student) => {
      const totalSessions = student.sessions.length;
      
      // Contagem de exercícios únicos com registro de carga (PRs)
      const uniqueExercises = new Set(student.logs.map((log) => log.exerciseId));
      const prsCount = uniqueExercises.size;

      const measurementsCount = student.measurements.length;

      // Usar lógica centralizada
      const { totalXp, level } = calculateXp(totalSessions, prsCount, measurementsCount);
      const levelTitle = getLevelTitle(level);

      return {
        id: student.id,
        name: student.user.name || student.user.email.split("@")[0],
        email: student.user.email,
        image: student.user.image,
        totalXp,
        level,
        levelTitle,
        totalSessions,
      };
    });

    // Ordenar por XP decrescente
    rankedStudents.sort((a, b) => b.totalXp - a.totalXp);

    // Pegar os top 5
    const top5 = rankedStudents.slice(0, 5);

    let userPosition = -1;
    if (currentUserProfile) {
      userPosition = rankedStudents.findIndex((s) => s.id === currentUserProfile.id) + 1;
    }

    return NextResponse.json({
      top5,
      userPosition,
      totalParticipants: rankedStudents.length,
    });
  } catch (error) {
    console.error("ERRO AO BUSCAR RANKING DE GAMIFICACAO:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar ranking." },
      { status: 500 }
    );
  }
}
