import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    // Buscar todos os perfis de alunos
    const students = await prisma.studentProfile.findMany({
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

      // Regra de XP: Treino = 300 XP, PR = 150 XP, Medição = 100 XP
      const totalXp = (totalSessions * 300) + (prsCount * 150) + (measurementsCount * 100);
      const level = Math.floor(totalXp / 1000) + 1;

      // Nomes de nível RPG
      let levelTitle = "Recruta do Aço";
      if (level >= 3 && level <= 4) levelTitle = "Forjador de Cargas";
      else if (level >= 5 && level <= 6) levelTitle = "Guerreiro de Ferro";
      else if (level >= 7 && level <= 9) levelTitle = "Monstro da Academia";
      else if (level >= 10) levelTitle = "Lenda do Olimpo";

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

    // Identificar a posição do usuário logado no ranking
    const currentUserProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

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
