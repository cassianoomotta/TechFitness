import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Retorna os Recordes Pessoais (PRs) dos exercícios que o aluno já realizou
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Perfil de aluno não encontrado." },
        { status: 404 }
      );
    }

    // Buscar logs de exercícios agrupados para encontrar o peso máximo por exercício
    const prAggregations = await prisma.exerciseLog.groupBy({
      by: ["exerciseId"],
      _max: {
        weightUsed: true,
      },
      where: {
        studentId: studentProfile.id,
      },
    });

    if (prAggregations.length === 0) {
      return NextResponse.json([]);
    }

    // Buscar detalhes de todos os exercícios de uma vez
    const exerciseIds = prAggregations.map((a) => a.exerciseId);
    const exercises = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true, name: true, muscleGroup: true, equipment: true },
    });
    
    const exerciseMap = new Map();
    for (const ex of exercises) {
      exerciseMap.set(ex.id, ex);
    }

    // Buscar as ocorrências mais recentes onde o aluno atingiu a carga máxima (PR)
    const orConditions = prAggregations.map((agg) => ({
      exerciseId: agg.exerciseId,
      weightUsed: agg._max.weightUsed || 0,
    }));

    const bestLogs = await prisma.exerciseLog.findMany({
      where: {
        studentId: studentProfile.id,
        OR: orConditions,
      },
      orderBy: {
        session: { date: "desc" },
      },
      select: {
        exerciseId: true,
        weightUsed: true,
        repsPerformed: true,
        session: { select: { date: true } },
      },
    });

    const bestLogMap = new Map();
    for (const log of bestLogs) {
      const key = `${log.exerciseId}_${log.weightUsed}`;
      if (!bestLogMap.has(key)) {
        bestLogMap.set(key, log);
      }
    }

    const prs = prAggregations.map((agg) => {
      const exercise = exerciseMap.get(agg.exerciseId);
      const bestLog = bestLogMap.get(`${agg.exerciseId}_${agg._max.weightUsed}`);

      return {
        exerciseId: agg.exerciseId,
        name: exercise?.name || "Exercício Desconhecido",
        muscleGroup: exercise?.muscleGroup || "Outros",
        equipment: exercise?.equipment || "Nenhum",
        maxWeight: agg._max.weightUsed || 0,
        reps: bestLog?.repsPerformed || 0,
        date: bestLog?.session?.date || null,
      };
    });

    // Ordenar PRs por grupo muscular e nome
    prs.sort((a, b) => {
      if (a.muscleGroup !== b.muscleGroup) {
        return a.muscleGroup.localeCompare(b.muscleGroup);
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(prs);
  } catch (error) {
    console.error("ERRO AO BUSCAR PRS DO ALUNO:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar recordes pessoais." },
      { status: 500 }
    );
  }
}
