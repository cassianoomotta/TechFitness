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
      customName: z.string().optional().nullable(),
    })
  ).min(1, "Adicione pelo menos 1 exercício ao treino"),
});

interface SaveExerciseItem {
  exerciseId?: string | null;
  name: string;
  customName?: string | null;
  muscleGroup?: string;
  equipment?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  method?: string;
  recommendedRpe?: number | null;
  recommendedWeight?: number | null;
  notes?: string | null;
}

interface SavePlanItem {
  name: string;
  description?: string | null;
  division?: string;
  weekDays?: string[] | string | null;
  exercises: SaveExerciseItem[];
}

// POST: Salvar novo(s) plano(s) de treino para um aluno (individual ou em lote)
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

    // Se o professor optou por arquivar automaticamente os treinos anteriores
    if (body.archivePrevious) {
      await prisma.workoutPlan.updateMany({
        where: {
          studentId,
          isArchived: false,
        },
        data: {
          isArchived: true,
          deletionStatus: "ARCHIVED",
        },
      });
    }

    // Função interna para criar um plano com seus exercícios
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createSinglePlanRecord = async (tx: any, planData: SavePlanItem) => {
      let formattedWeekDays: string[] | undefined = undefined;
      if (Array.isArray(planData.weekDays)) {
        formattedWeekDays = planData.weekDays;
      } else if (typeof planData.weekDays === "string" && planData.weekDays) {
        formattedWeekDays = planData.weekDays.split(",").map((d: string) => d.trim());
      }

      const plan = await tx.workoutPlan.create({
        data: {
          studentId,
          name: String(planData.name),
          description: planData.description ? String(planData.description) : null,
          division: planData.division ? String(planData.division) : "A",
          weekDays: formattedWeekDays,
          createdByType: "TRAINER",
        },
      });

      const exercisesPayload = [];
      for (let i = 0; i < planData.exercises.length; i++) {
        const ex = planData.exercises[i];
        let targetId: string;
        let existingEx = null;
        if (ex.exerciseId) {
          existingEx = await tx.exercise.findUnique({ where: { id: ex.exerciseId } });
        }

        if (existingEx) {
          targetId = existingEx.id;
        } else {
          const createdOrFound = await tx.exercise.upsert({
            where: { name: ex.name },
            update: {},
            create: {
              name: ex.name,
              muscleGroup: ex.muscleGroup || "Geral",
              equipment: ex.equipment || "Livre",
              description: "Exercício cadastrado via importação de treino",
              gifUrl: null,
              videoUrl: null,
            },
          });
          targetId = createdOrFound.id;
        }

        exercisesPayload.push({
          workoutPlanId: plan.id,
          exerciseId: targetId,
          sets: Number(ex.sets) || 4,
          reps: String(ex.reps || "10-12"),
          restSeconds: Number(ex.restSeconds) || 60,
          method: ex.method || "Normal",
          recommendedRpe: ex.recommendedRpe ? Number(ex.recommendedRpe) : null,
          recommendedWeight: ex.recommendedWeight ? Number(ex.recommendedWeight) : null,
          notes: ex.notes || null,
          customName: ex.customName || null,
          order: i,
        });
      }

      await tx.workoutPlanExercise.createMany({
        data: exercisesPayload,
      });

      return plan;
    };

    // Caso 1: Salvamento em lote (múltiplas fichas A, B, C...)
    if (Array.isArray(body.plans) && body.plans.length > 0) {
      const createdPlans = await prisma.$transaction(async (tx) => {
        const results = [];
        for (const p of body.plans) {
          if (p.name && Array.isArray(p.exercises) && p.exercises.length > 0) {
            const created = await createSinglePlanRecord(tx, p);
            results.push(created);
          }
        }

        if (results.length > 0) {
          await tx.notification.create({
            data: {
              userId: student.userId,
              title: "Novos Treinos Cadastrados 🏋️‍♂️",
              message: `Seu treinador ${session.user.name} cadastrou ${results.length} novas fichas de treino para você.`,
            },
          });
        }

        return results;
      });

      return NextResponse.json(
        { success: true, count: createdPlans.length, plans: createdPlans },
        { status: 201 }
      );
    }

    // Caso 2: Salvamento de um único plano
    if (!body.name || !Array.isArray(body.exercises) || body.exercises.length === 0) {
      return NextResponse.json(
        { error: "Informe o nome do treino e ao menos um exercício." },
        { status: 400 }
      );
    }

    const newPlan = await prisma.$transaction(async (tx) => {
      const plan = await createSinglePlanRecord(tx, body);

      await tx.notification.create({
        data: {
          userId: student.userId,
          title: "Novo Treino Cadastrado 🏋️‍♂️",
          message: `Seu treinador ${session.user.name} cadastrou uma nova ficha: ${plan.name} (Divisão ${plan.division}).`,
        },
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
    const { planId, updateLinked, ...planData } = body;

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
          weekDays: weekDays ? weekDays.split(",") : undefined,
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
        customName: ex.customName || null,
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

      // 4. Se 'updateLinked' for true, propagar as atualizações
      if (updateLinked) {
        // Encontrar planos vinculados
        let linkedPlans = [];
        if (existingPlan.parentPlanId) {
          linkedPlans = await tx.workoutPlan.findMany({
            where: {
              OR: [
                { id: existingPlan.parentPlanId },
                { parentPlanId: existingPlan.parentPlanId }
              ],
              NOT: { id: existingPlan.id }
            },
            include: { student: true }
          });
        } else {
          linkedPlans = await tx.workoutPlan.findMany({
            where: {
              parentPlanId: existingPlan.id
            },
            include: { student: true }
          });
        }

        for (const lp of linkedPlans) {
          // Atualizar dados principais
          await tx.workoutPlan.update({
            where: { id: lp.id },
            data: {
              name,
              description,
              division,
              weekDays: weekDays ? weekDays.split(",") : undefined,
            }
          });

          // Apagar exercícios antigos
          await tx.workoutPlanExercise.deleteMany({
            where: { workoutPlanId: lp.id },
          });

          // Inserir os novos exercícios
          const lpExercisesPayload = exercises.map((ex, index) => ({
            workoutPlanId: lp.id,
            exerciseId: ex.exerciseId,
            sets: Number(ex.sets),
            reps: ex.reps,
            restSeconds: Number(ex.restSeconds),
            method: ex.method,
            recommendedRpe: ex.recommendedRpe || null,
            recommendedWeight: ex.recommendedWeight || null,
            notes: ex.notes || null,
            customName: ex.customName || null,
            order: index,
          }));
          await tx.workoutPlanExercise.createMany({
            data: lpExercisesPayload,
          });
          // Notificar o aluno do plano vinculado
          await tx.notification.create({
            data: {
              userId: lp.student.userId,
              title: "Treino Vinculado Atualizado 🔄",
              message: `Seu treino "${name}" (Divisão ${division}) foi atualizado pelo treinador ${session.user.name}.`,
            }
          });
        }
      }

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

