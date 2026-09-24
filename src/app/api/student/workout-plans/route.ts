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

    // Processar auto-exclusão de fichas com solicitação pendente há mais de 3 dias (72 horas)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const expiredPlans = await prisma.workoutPlan.findMany({
      where: {
        studentId: studentProfile.id,
        deletionStatus: "PENDING_DELETION",
        deletionRequestedAt: { lte: threeDaysAgo },
      },
      select: { id: true, name: true },
    });

    if (expiredPlans.length > 0) {
      for (const ep of expiredPlans) {
        await prisma.workoutPlan.delete({ where: { id: ep.id } });
        await prisma.notification.create({
          data: {
            userId: session.user.id,
            title: "Ficha Excluída Automaticamente",
            message: `A ficha '${ep.name}' foi excluída automaticamente após o prazo de 3 dias sem contestação do treinador.`,
          },
        });
      }
    }

    // Buscar todos os planos de treino ativos do aluno
    const plans = await prisma.workoutPlan.findMany({
      where: { studentId: studentProfile.id },
      include: {
        exercises: {
          orderBy: {
            order: "asc",
          },
          include: {
            exercise: {
              select: {
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

    const DAY_ORDER: Record<string, number> = {
      "Seg": 1,
      "Ter": 2,
      "Qua": 3,
      "Qui": 4,
      "Sex": 5,
      "Sáb": 6,
      "Dom": 7
    };

    plans.sort((a, b) => {
      if (!a.weekDays && !b.weekDays) return 0;
      if (!a.weekDays) return 1;
      if (!b.weekDays) return -1;

      const getDaysArray = (wd: any): string[] => {
        if (!wd) return [];
        if (Array.isArray(wd)) return wd;
        if (typeof wd === 'string') return wd.split(",");
        return [];
      };

      const aDays = getDaysArray(a.weekDays).map(d => d.trim()).map(d => DAY_ORDER[d] || 999).sort((x, y) => x - y);
      const bDays = getDaysArray(b.weekDays).map(d => d.trim()).map(d => DAY_ORDER[d] || 999).sort((x, y) => x - y);

      for (let i = 0; i < Math.max(aDays.length, bDays.length); i++) {
        const aVal = aDays[i] !== undefined ? aDays[i] : 999;
        const bVal = bDays[i] !== undefined ? bDays[i] : 999;
        if (aVal !== bVal) {
          return aVal - bVal;
        }
      }
      return 0;
    });

    // Identificar qual ficha foi realizada na última sessão para determinar o próximo treino do ciclo
    const lastSession = await prisma.workoutSession.findFirst({
      where: {
        studentId: studentProfile.id,
        completed: true,
      },
      orderBy: { date: "desc" },
      select: {
        id: true,
        logs: {
          select: { exerciseId: true },
          take: 10,
        },
      },
    });

    let lastCompletedPlanId: string | null = null;
    if (lastSession && lastSession.logs.length > 0) {
      const sessionExerciseIds = new Set(lastSession.logs.map((l: { exerciseId: string }) => l.exerciseId));
      let maxMatches = 0;
      for (const p of plans) {
        const matches = p.exercises.filter((pe) => sessionExerciseIds.has(pe.exerciseId)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          lastCompletedPlanId = p.id;
        }
      }
    }

    // Mapear retorno
    const formattedResponse = {
      trainer: studentProfile.trainer
        ? {
            name: studentProfile.trainer.user.name,
            email: studentProfile.trainer.user.email,
          }
        : null,
      lastCompletedPlanId,
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        division: plan.division,
        weekDays: Array.isArray(plan.weekDays) ? (plan.weekDays as string[]).join(",") : (plan.weekDays as string | null),
        isArchived: Boolean(plan.isArchived),
        createdByType: plan.createdByType || "TRAINER",
        deletionStatus: plan.deletionStatus || "ACTIVE",
        deletionRequestedAt: plan.deletionRequestedAt ? plan.deletionRequestedAt.toISOString() : null,
        createdAt: plan.createdAt,
        exercises: plan.exercises.map((pe) => ({
          id: pe.id,
          exerciseId: pe.exerciseId,
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

interface SaveExercisePayload {
  exerciseId?: string | null;
  name: string;
  customName?: string | null;
  muscleGroup?: string;
  equipment?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  method?: string;
  notes?: string;
}

// POST: Salvar ficha de treino importada ou criada pelo aluno
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas alunos podem salvar treinos nesta rota." },
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

    const body = await request.json();

    // Se o usuário optou por arquivar automaticamente os treinos anteriores da semana
    if (body.archivePrevious) {
      await prisma.workoutPlan.updateMany({
        where: {
          studentId: studentProfile.id,
          isArchived: false,
        },
        data: {
          isArchived: true,
          deletionStatus: "ARCHIVED",
        },
      });
    }

    const createPlanRecord = async (plan: {
      name: string;
      division?: string;
      description?: string;
      weekDays?: string[] | null;
      exercises: SaveExercisePayload[];
    }) => {
      const exercisesPayload = plan.exercises;
      const exercisesData = [];

      for (let i = 0; i < exercisesPayload.length; i++) {
        const ex = exercisesPayload[i];
        let targetId = ex.exerciseId;

        if (!targetId) {
          const createdOrFound = await prisma.exercise.upsert({
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

        exercisesData.push({
          exerciseId: targetId,
          customName: ex.customName || null,
          sets: Number(ex.sets) || 4,
          reps: String(ex.reps || "10-12"),
          restSeconds: Number(ex.restSeconds) || 60,
          method: ex.method || "Normal",
          notes: ex.notes || null,
          order: i,
        });
      }

      return await prisma.workoutPlan.create({
        data: {
          studentId: studentProfile.id,
          name: String(plan.name),
          division: String(plan.division || "A"),
          description: plan.description ? String(plan.description) : "Importado com IA",
          weekDays: Array.isArray(plan.weekDays) ? plan.weekDays : [],
          createdByType: "STUDENT",
          exercises: {
            create: exercisesData,
          },
        },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
          },
        },
      });
    };

    // Suporte a lote de fichas (múltiplos treinos: Treino 1, 2, 3...)
    if (Array.isArray(body.plans) && body.plans.length > 0) {
      const createdPlans = [];
      for (const p of body.plans) {
        if (p.name && Array.isArray(p.exercises) && p.exercises.length > 0) {
          const created = await createPlanRecord(p);
          createdPlans.push(created);
        }
      }
      return NextResponse.json({ success: true, count: createdPlans.length, plans: createdPlans });
    }

    const { name, division, description, weekDays, exercises } = body;

    if (!name || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: "Dados incompletos. Informe o nome da ficha e ao menos um exercício." },
        { status: 400 }
      );
    }

    const newPlan = await createPlanRecord({ name, division, description, weekDays, exercises });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error: unknown) {
    console.error("ERRO AO SALVAR TREINO IMPORTADO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao salvar o treino." },
      { status: 500 }
    );
  }
}

