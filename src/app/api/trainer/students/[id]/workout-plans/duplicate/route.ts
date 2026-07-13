import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const duplicateSchema = z.object({
  planId: z.string().min(1, "ID do plano de treino é obrigatório"),
  targetStudentIds: z.array(z.string().min(1)).min(1, "Selecione pelo menos 1 aluno de destino"),
});

// POST: Duplicar um plano de treino de um aluno para outros alunos
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { id: sourceStudentId } = await params;
    const body = await request.json();
    const validation = duplicateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { planId, targetStudentIds } = validation.data;

    // Buscar perfil do personal logado
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainerProfile) {
      return NextResponse.json(
        { error: "Perfil de treinador não encontrado." },
        { status: 404 }
      );
    }

    // Verificar se o aluno de origem pertence ao treinador
    const sourceStudent = await prisma.studentProfile.findUnique({
      where: { id: sourceStudentId },
    });

    if (!sourceStudent || sourceStudent.trainerId !== trainerProfile.id) {
      return NextResponse.json(
        { error: "Acesso negado. Aluno de origem não está vinculado a você." },
        { status: 403 }
      );
    }

    // Buscar o plano de treino de origem com todos os exercícios
    const sourcePlan = await prisma.workoutPlan.findFirst({
      where: { id: planId, studentId: sourceStudentId },
      include: {
        exercises: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!sourcePlan) {
      return NextResponse.json(
        { error: "Plano de treino de origem não encontrado." },
        { status: 404 }
      );
    }

    // Verificar se todos os alunos de destino pertencem ao treinador
    const targetStudents = await prisma.studentProfile.findMany({
      where: {
        id: { in: targetStudentIds },
        trainerId: trainerProfile.id,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (targetStudents.length !== targetStudentIds.length) {
      return NextResponse.json(
        { error: "Um ou mais alunos de destino não estão vinculados a você." },
        { status: 403 }
      );
    }

    // Transação para duplicar o plano para todos os alunos de destino
    const createdPlans = await prisma.$transaction(async (tx) => {
      const plans = [];

      for (const target of targetStudents) {
        // Criar o plano de treino
        const newPlan = await tx.workoutPlan.create({
          data: {
            studentId: target.id,
            name: sourcePlan.name,
            description: sourcePlan.description,
            division: sourcePlan.division,
            weekDays: sourcePlan.weekDays ? (sourcePlan.weekDays as any) : undefined,
            parentPlanId: sourcePlan.id,
          },
        });

        // Criar os exercícios do plano
        const exercisesPayload = sourcePlan.exercises.map((ex) => ({
          workoutPlanId: newPlan.id,
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          method: ex.method,
          recommendedRpe: ex.recommendedRpe,
          recommendedWeight: ex.recommendedWeight,
          notes: ex.notes,
          customName: ex.customName,
          order: ex.order,
        }));

        await tx.workoutPlanExercise.createMany({
          data: exercisesPayload,
        });

        // Notificar o aluno de destino
        await tx.notification.create({
          data: {
            userId: target.user.id,
            title: "Novo Treino Recebido 📋",
            message: `Seu treinador ${session.user.name} duplicou a ficha "${sourcePlan.name}" (Divisão ${sourcePlan.division}) para você.`,
          },
        });

        plans.push(newPlan);
      }

      return plans;
    });

    return NextResponse.json(
      {
        success: true,
        duplicatedCount: createdPlans.length,
        plans: createdPlans,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERRO AO DUPLICAR PLANO DE TREINO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao duplicar o plano de treino." },
      { status: 500 }
    );
  }
}
