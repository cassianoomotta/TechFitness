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

    // Para cada exercício, buscar os logs da última sessão que o aluno realizou
    const formattedExercises = await Promise.all(
      plan.exercises.map(async (pe) => {
        const lastLog = await prisma.exerciseLog.findFirst({
          where: {
            studentId: studentProfile.id,
            exerciseId: pe.exerciseId,
          },
          orderBy: {
            session: {
              date: "desc",
            },
          },
          select: {
            sessionId: true,
          },
        });

        let previousWorkoutSets: { setNumber: number; weightUsed: number; repsPerformed: number }[] = [];

        if (lastLog) {
          const sets = await prisma.exerciseLog.findMany({
            where: {
              sessionId: lastLog.sessionId,
              exerciseId: pe.exerciseId,
            },
            orderBy: {
              setNumber: "asc",
            },
            select: {
              setNumber: true,
              weightUsed: true,
              repsPerformed: true,
            },
          });
          previousWorkoutSets = sets.map((s) => ({
            setNumber: s.setNumber,
            weightUsed: s.weightUsed,
            repsPerformed: s.repsPerformed,
          }));
        }

        return {
          id: pe.id,
          exerciseId: pe.exercise.id,
          name: pe.customName || pe.exercise.name,
          customName: pe.customName,
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
          previousWorkoutSets,
        };
      })
    );

    const formattedPlan = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      division: plan.division,
      exercises: formattedExercises,
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

// PUT: Atualizar a divisão e dias da semana de um plano de treino específico
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { division, weekDays } = body;

    if (!division || division.trim() === "") {
      return NextResponse.json(
        { error: "A divisão não pode ser vazia." },
        { status: 400 }
      );
    }

    // Buscar o plano de treino
    const plan = await prisma.workoutPlan.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plano de treino não encontrado." },
        { status: 404 }
      );
    }

    // Autorização: aluno dono do treino ou personal vinculado
    if (session.user.role === "STUDENT") {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!studentProfile || plan.studentId !== studentProfile.id) {
        return NextResponse.json(
          { error: "Acesso negado. Este plano não pertence a você." },
          { status: 403 }
        );
      }
    } else if (session.user.role === "TRAINER") {
      const trainerProfile = await prisma.trainerProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!trainerProfile || plan.student.trainerId !== trainerProfile.id) {
        return NextResponse.json(
          { error: "Acesso negado. Este aluno não está vinculado a você." },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Acesso negado." },
        { status: 403 }
      );
    }

    // Atualizar
    const updatedPlan = await prisma.workoutPlan.update({
      where: { id },
      data: {
        division: division.trim(),
        weekDays: weekDays || null,
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("ERRO AO ATUALIZAR PLANO DE TREINO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao atualizar o plano de treino." },
      { status: 500 }
    );
  }
}
