import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
const updatePlanSchema = z.object({
  name: z.string().min(1, "O nome não pode ser vazio").max(100, "Nome muito longo").optional()
    .transform((val) => val ? val.replace(/<[^>]*>/g, "").trim() : val),
  division: z.string().min(1, "A divisão não pode ser vazia").max(20, "Divisão muito longa")
    .transform((val) => val.replace(/<[^>]*>/g, "").trim()),
  weekDays: z.string().max(50).optional().nullable()
    .transform((val) => val ? val.replace(/<[^>]*>/g, "").trim() : val),
});

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
            order: "asc",
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
                gifUrl: true,
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

    // Busca os últimos registros de todos os exercícios em lote para evitar 2 consultas por item.
    const exerciseIds = Array.from(new Set(plan.exercises.map((exercise) => exercise.exerciseId)));
    const [latestSessions, personalNotes] = await Promise.all([
      exerciseIds.length > 0
        ? prisma.$queryRaw<Array<{ exerciseId: string; sessionId: string }>>`
            SELECT DISTINCT ON (log."exerciseId") log."exerciseId", log."sessionId"
            FROM "ExerciseLog" AS log
            INNER JOIN "WorkoutSession" AS session ON session."id" = log."sessionId"
            WHERE log."studentId" = ${studentProfile.id}
              AND log."exerciseId" IN (${Prisma.join(exerciseIds)})
            ORDER BY log."exerciseId", session."date" DESC, log."setNumber" ASC
          `
        : Promise.resolve([]),
      exerciseIds.length > 0
        ? prisma.$queryRaw<Array<{ exerciseId: string; note: string }>>`
            SELECT "exerciseId", "note"
            FROM "StudentExerciseNote"
            WHERE "studentProfileId" = ${studentProfile.id}
              AND "exerciseId" IN (${Prisma.join(exerciseIds)})
          `
        : Promise.resolve([]),
    ]);

    const latestSessionByExercise = new Map<string, string>();
    for (const item of latestSessions) {
      latestSessionByExercise.set(item.exerciseId, item.sessionId);
    }
    const latestSessionIds = Array.from(new Set(latestSessionByExercise.values()));
    const recentLogs = latestSessionIds.length > 0
      ? await prisma.exerciseLog.findMany({
          where: { studentId: studentProfile.id, sessionId: { in: latestSessionIds } },
          orderBy: { setNumber: "asc" },
          select: { exerciseId: true, sessionId: true, setNumber: true, weightUsed: true, repsPerformed: true },
        })
      : [];
    const personalNoteByExercise = new Map(personalNotes.map((item) => [item.exerciseId, item.note]));

    const formattedExercises = plan.exercises.map((pe) => ({
      id: pe.id,
      exerciseId: pe.exercise.id,
      name: pe.customName || pe.exercise.name,
      customName: pe.customName,
      muscleGroup: pe.exercise.muscleGroup,
      equipment: pe.exercise.equipment,
      description: pe.exercise.description,
      videoUrl: pe.exercise.videoUrl,
      gifUrl: pe.exercise.gifUrl,
      sets: pe.sets,
      reps: pe.reps,
      restSeconds: pe.restSeconds,
      method: pe.method,
      recommendedRpe: pe.recommendedRpe,
      recommendedWeight: pe.recommendedWeight,
      notes: pe.notes,
      personalNote: personalNoteByExercise.get(pe.exerciseId) ?? null,
      previousWorkoutSets: recentLogs
        .filter((log) => log.exerciseId === pe.exerciseId && log.sessionId === latestSessionByExercise.get(pe.exerciseId))
        .map((log) => ({
          setNumber: log.setNumber,
          weightUsed: log.weightUsed,
          repsPerformed: log.repsPerformed,
        })),
    }));

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
    const validation = updatePlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, division, weekDays } = validation.data;

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
        ...(name ? { name: name.trim() } : {}),
        division: division.trim(),
        weekDays: weekDays ? (typeof weekDays === 'string' ? weekDays.split(',').map((d: string) => d.trim()) : weekDays) : Prisma.DbNull,
      },
    });

    return NextResponse.json({
      ...updatedPlan,
      weekDays: Array.isArray(updatedPlan.weekDays) ? (updatedPlan.weekDays as string[]).join(',') : (updatedPlan.weekDays as string | null),
    });
  } catch (error) {
    console.error("ERRO AO ATUALIZAR PLANO DE TREINO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao atualizar o plano de treino." },
      { status: 500 }
    );
  }
}

// DELETE: Excluir plano de treino (permitido imediatamente para fichas criadas pelo aluno ou sem treinador)
export async function DELETE(
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

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Perfil de aluno não encontrado." },
        { status: 404 }
      );
    }

    const plan = await prisma.workoutPlan.findUnique({
      where: { id },
    });

    if (!plan || plan.studentId !== studentProfile.id) {
      return NextResponse.json(
        { error: "Ficha não encontrada ou acesso negado." },
        { status: 404 }
      );
    }

    // Regra: se foi prescrito por treinador e o aluno tem treinador vinculado, não pode deletar direto
    if (plan.createdByType === "TRAINER" && studentProfile.trainerId) {
      return NextResponse.json(
        { error: "Fichas prescritas por treinadores exigem solicitação de exclusão com prazo de 3 dias." },
        { status: 403 }
      );
    }

    // Excluir ficha imediatamente
    await prisma.workoutPlan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Ficha excluída com sucesso." });
  } catch (error) {
    console.error("ERRO AO EXCLUIR PLANO DE TREINO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao excluir o plano de treino." },
      { status: 500 }
    );
  }
}
