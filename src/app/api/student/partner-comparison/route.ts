import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Retornar outros alunos vinculados ao mesmo treinador para seleção
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    // Buscar perfil do aluno logado
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, trainerId: true },
    });

    if (!student || !student.trainerId) {
      return NextResponse.json(
        { error: "Você ainda não possui um treinador vinculado." },
        { status: 400 }
      );
    }

    // Buscar outros alunos do mesmo treinador
    const partners = await prisma.studentProfile.findMany({
      where: {
        trainerId: student.trainerId,
        id: { not: student.id }, // Excluir o próprio aluno
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      partners.map((p) => ({
        id: p.id,
        name: p.user.name,
        email: p.user.email,
      }))
    );
  } catch (error) {
    console.error("ERRO AO BUSCAR PARCEIROS:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

// POST: Retornar a comparação detalhada de métricas entre o aluno logado e o parceiro selecionado
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { partnerId } = await request.json();

    if (!partnerId) {
      return NextResponse.json(
        { error: "ID do parceiro de treino é obrigatório." },
        { status: 400 }
      );
    }

    // 1. Aluno logado
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true } } },
    });

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
    }

    // 2. Parceiro selecionado
    const partner = await prisma.studentProfile.findUnique({
      where: { id: partnerId },
      include: { user: { select: { name: true } } },
    });

    if (!partner) {
      return NextResponse.json({ error: "Parceiro de treino não encontrado." }, { status: 404 });
    }

    // 3. Coletar estatísticas do aluno logado
    const studentSessions = await prisma.workoutSession.findMany({
      where: { studentId: student.id },
      include: { logs: true },
    });

    const studentTotalSessions = studentSessions.length;
    const studentTotalSets = studentSessions.reduce(
      (sum, s) => sum + s.logs.length,
      0
    );

    // 4. Coletar estatísticas do parceiro
    const partnerSessions = await prisma.workoutSession.findMany({
      where: { studentId: partner.id },
      include: { logs: true },
    });

    const partnerTotalSessions = partnerSessions.length;
    const partnerTotalSets = partnerSessions.reduce(
      (sum, s) => sum + s.logs.length,
      0
    );

    // 5. Coletar cargas máximas nos exercícios-chave
    // Exercício 1: Supino Reto com Barra
    // Exercício 2: Agachamento Livre com Barra
    // Exercício 3: Rosca Direta com Barra W
    const targetExercises = [
      "Supino Reto com Barra",
      "Agachamento Livre com Barra",
      "Rosca Direta com Barra W",
    ];

    const studentLogs = await prisma.exerciseLog.findMany({
      where: {
        studentId: student.id,
        exercise: { name: { in: targetExercises } },
      },
      include: { exercise: { select: { name: true } } },
    });

    const partnerLogs = await prisma.exerciseLog.findMany({
      where: {
        studentId: partner.id,
        exercise: { name: { in: targetExercises } },
      },
      include: { exercise: { select: { name: true } } },
    });

    // Função auxiliar para encontrar a carga máxima
    const getMaxWeight = (logsList: typeof studentLogs, exName: string) => {
      const filtered = logsList.filter((l) => l.exercise.name === exName);
      if (filtered.length === 0) return 0;
      return Math.max(...filtered.map((l) => l.weightUsed));
    };

    const exerciseComparison = targetExercises.map((name) => ({
      exerciseName: name,
      myMax: getMaxWeight(studentLogs, name),
      partnerMax: getMaxWeight(partnerLogs, name),
    }));

    return NextResponse.json({
      myInfo: {
        name: student.user.name,
        sessionsCount: studentTotalSessions,
        setsCount: studentTotalSets,
      },
      partnerInfo: {
        name: partner.user.name,
        sessionsCount: partnerTotalSessions,
        setsCount: partnerTotalSets,
      },
      exerciseComparison,
    });
  } catch (error) {
    console.error("ERRO AO GERAR COMPARAÇÃO:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
