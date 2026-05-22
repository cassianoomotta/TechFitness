import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Buscar um plano de treino específico (WorkoutPlan) do aluno logado
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Buscar perfil do aluno correspondente
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Perfil de aluno não encontrado." },
        { status: 404 }
      );
    }

    // Buscar o plano de treino
    const plan = await prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: {
            id: "asc",
          },
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                muscleGroup: true,
                equipment: true,
                description: true,
                videoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plano de treino não encontrado." },
        { status: 404 }
      );
    }

    // Validar se pertence a este aluno
    if (plan.studentId !== studentProfile.id) {
      return NextResponse.json(
        { error: "Acesso negado. Este plano de treino não pertence a você." },
        { status: 403 }
      );
    }

    // Mapear retorno
    const formattedPlan = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      division: plan.division,
      exercises: plan.exercises.map((pe) => ({
        id: pe.id,
        exerciseId: pe.exercise.id,
        name: pe.exercise.name,
        muscleGroup: pe.exercise.muscleGroup,
        equipment: pe.exercise.equipment,
        description: pe.exercise.description,
        videoUrl: pe.exercise.videoUrl,
        sets: pe.sets,
        reps: pe.reps,
        restSeconds: pe.restSeconds,
        method: pe.method,
        recommendedRpe: pe.recommendedRpe,
        recommendedWeight: pe.recommendedWeight,
        notes: pe.notes,
      })),
    };

    return NextResponse.json(formattedPlan);
  } catch (error) {
    console.error("ERRO AO CARREGAR DETALHES DO TREINO DO ALUNO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao buscar detalhes deste treino." },
      { status: 500 }
    );
  }
}
