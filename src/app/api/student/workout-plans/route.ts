import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Buscar todas as fichas de treino (WorkoutPlans) do aluno logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas alunos podem acessar esta rota." },
        { status: 401 }
      );
    }

    // Buscar perfil do aluno correspondente ao usuário logado
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        trainer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Perfil de aluno não encontrado." },
        { status: 404 }
      );
    }

    // Buscar todos os planos de treino ativos do aluno
    const plans = await prisma.workoutPlan.findMany({
      where: { studentId: studentProfile.id },
      include: {
        exercises: {
          orderBy: {
            id: "asc",
          },
          include: {
            exercise: {
              select: {
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
      orderBy: {
        division: "asc",
      },
    });

    // Mapear retorno
    const formattedResponse = {
      trainer: studentProfile.trainer
        ? {
            name: studentProfile.trainer.user.name,
            email: studentProfile.trainer.user.email,
          }
        : null,
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        division: plan.division,
        weekDays: plan.weekDays,
        createdAt: plan.createdAt,
        exercises: plan.exercises.map((pe) => ({
          id: pe.id,
          exerciseId: pe.exerciseId,
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
      })),
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("ERRO AO CARREGAR TREINOS DO ALUNO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao buscar seus treinos." },
      { status: 500 }
    );
  }
}
