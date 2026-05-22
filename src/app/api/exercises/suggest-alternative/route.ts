import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST: Suggest an alternative exercise from the same muscle group
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { exerciseId } = body;

    if (!exerciseId) {
      return NextResponse.json(
        { error: "ID do exercício é obrigatório." },
        { status: 400 }
      );
    }

    // Find the current exercise to know its muscle group
    const currentExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!currentExercise) {
      return NextResponse.json(
        { error: "Exercício não encontrado." },
        { status: 404 }
      );
    }

    // Find alternatives from the same muscle group, excluding the current one
    const alternatives = await prisma.exercise.findMany({
      where: {
        muscleGroup: currentExercise.muscleGroup,
        id: { not: exerciseId },
      },
      select: {
        id: true,
        name: true,
        muscleGroup: true,
        equipment: true,
        description: true,
        videoUrl: true,
      },
    });

    if (alternatives.length === 0) {
      return NextResponse.json(
        { suggestion: null, message: "Não há exercícios alternativos disponíveis para este grupo muscular." }
      );
    }

    // Pick a random alternative
    const randomIndex = Math.floor(Math.random() * alternatives.length);
    const suggestion = alternatives[randomIndex];

    return NextResponse.json({
      suggestion,
      message: `Sugestão: "${suggestion.name}" usando ${suggestion.equipment}`,
    });
  } catch (error) {
    console.error("ERRO AO SUGERIR ALTERNATIVA:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar exercício alternativo." },
      { status: 500 }
    );
  }
}
