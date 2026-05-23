import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const workoutPlanSchema = z.object({
  name: z.string().min(2, "O nome do treino deve ter pelo menos 2 caracteres"),
  description: z.string().optional().nullable(),
  division: z.string().min(1, "Especifique a divisão do treino (Ex: A, B, C)"),
  weekDays: z.string().optional().nullable(),
  exercises: z.array(
    z.object({
      exerciseId: z.string().min(1, "Selecione um exercício válido"),
      sets: z.number().int().min(1, "Mínimo 1 série"),
      reps: z.string().min(1, "Defina a faixa de repetições"),
      restSeconds: z.number().int().min(0),
      method: z.string().default("Normal"),
      recommendedRpe: z.number().int().min(1).max(10).optional().nullable(),
      recommendedWeight: z.number().optional().nullable(),
      notes: z.string().optional().nullable(),
    })
  ).min(1, "Adicione pelo menos 1 exercício ao treino"),
});

// POST: Salvar um novo plano de treino para um aluno
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

    const { id: studentId } = await params;
    const body = await request.json();
    const validation = workoutPlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

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

    // Validar se o aluno pertence a este personal
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    if (student.trainerId !== trainerProfile.id) {
      return NextResponse.json(
        { error: "Acesso negado. Este aluno não está vinculado a você." },
        { status: 403 }
      );
    }

    const { name, description, division, weekDays, exercises } = validation.data;

    // Transação para persistir o plano de treino e os exercícios associados de forma atômica
    const newPlan = await prisma.$transaction(async (tx) => {
      const plan = await tx.workoutPlan.create({
        data: {
          studentId,
          name,
          description,
          division,
          weekDays: weekDays || null,
        },
      });

      // Mapear exercícios
      const exercisesPayload = exercises.map((ex, index) => ({
        workoutPlanId: plan.id,
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
        method: ex.method,
        recommendedRpe: ex.recommendedRpe || null,
        recommendedWeight: ex.recommendedWeight || null,
        notes: ex.notes || null,
        order: index,
      }));

      await tx.workoutPlanExercise.createMany({
        data: exercisesPayload,
      });

      // Notificar o aluno sobre o novo treino
      await tx.notification.create({
        data: {
          userId: student.userId,
          title: "Novo Treino Cadastrado 🏋️‍♂️",
          message: `Seu treinador ${session.user.name} cadastrou uma nova ficha: ${name} (Divisão ${division}).`,
        }
      });

      return plan;
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error("ERRO AO CRIAR PLANO DE TREINO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao salvar o plano de treino." },
      { status: 500 }
    );
  }
}

// PUT: Atualizar um plano de treino existente
export async function PUT(
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

    const { id: studentId } = await params;
    const body = await request.json();
    const { planId, ...planData } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "ID do plano de treino é obrigatório para edição." },
        { status: 400 }
      );
    }

    const validation = workoutPlanSchema.safeParse(planData);
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

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

    // Validar se o aluno pertence a este personal
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student || student.trainerId !== trainerProfile.id) {
      return NextResponse.json(
        { error: "Acesso negado ou aluno não encontrado." },
        { status: 403 }
      );
    }

    // Verificar se o plano pertence a este aluno
    const existingPlan = await prisma.workoutPlan.findFirst({
      where: { id: planId, studentId },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plano de treino não encontrado." },
        { status: 404 }
      );
    }

    const { name, description, division, weekDays, exercises } = validation.data;

    // Transação para atualizar o plano
    const updatedPlan = await prisma.$transaction(async (tx) => {
      // 1. Atualizar dados principais
      const plan = await tx.workoutPlan.update({
        where: { id: planId },
        data: {
          name,
          description,
          division,
          weekDays: weekDays || null,
        },
      });

      // 2. Apagar exercícios antigos da ficha
      await tx.workoutPlanExercise.deleteMany({
        where: { workoutPlanId: planId },
      });

      // 3. Criar os novos exercícios da ficha
      const exercisesPayload = exercises.map((ex, index) => ({
        workoutPlanId: planId,
        exerciseId: ex.exerciseId,
        sets: Number(ex.sets),
        reps: ex.reps,
        restSeconds: Number(ex.restSeconds),
        method: ex.method,
        recommendedRpe: ex.recommendedRpe || null,
        recommendedWeight: ex.recommendedWeight || null,
        notes: ex.notes || null,
        order: index,
      }));

      await tx.workoutPlanExercise.createMany({
        data: exercisesPayload,
      });

      // Notificar o aluno sobre a atualização do treino
      await tx.notification.create({
        data: {
          userId: student.userId,
          title: "Treino Atualizado 🔄",
          message: `Seu treino "${name}" (Divisão ${division}) foi atualizado pelo treinador ${session.user.name}.`,
        }
      });

      return plan;
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

// DELETE: Excluir um plano de treino
export async function DELETE(
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

    const { id: studentId } = await params;
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");

    if (!planId) {
      return NextResponse.json(
        { error: "ID do plano de treino é obrigatório." },
        { status: 400 }
      );
    }

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

    // Validar se o aluno pertence a este personal
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student || student.trainerId !== trainerProfile.id) {
      return NextResponse.json(
        { error: "Acesso negado." },
        { status: 403 }
      );
    }

    const existingPlan = await prisma.workoutPlan.findFirst({
      where: { id: planId, studentId },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plano de treino não encontrado." },
        { status: 404 }
      );
    }

    await prisma.workoutPlan.delete({
      where: { id: planId, studentId },
    });

    // Notificar o aluno sobre a remoção do treino
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: "Treino Removido 🗑️",
        message: `Seu treino "${existingPlan.name}" foi removido pelo treinador ${session.user.name}.`,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ERRO AO EXCLUIR PLANO DE TREINO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao excluir o plano de treino." },
      { status: 500 }
    );
  }
}

