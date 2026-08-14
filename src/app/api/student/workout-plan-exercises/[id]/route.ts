import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateExerciseNameSchema = z.object({
  customName: z.string().max(100, "Nome muito longo").optional().nullable()
    .transform((val) => val ? val.replace(/<[^>]*>/g, "").trim() : val),
});

export async function PUT(
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
    const body = await request.json();
    const validation = updateExerciseNameSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { customName } = validation.data;

    // Buscar o exercício do plano
    const planExercise = await prisma.workoutPlanExercise.findUnique({
      where: { id },
      include: {
        workoutPlan: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!planExercise) {
      return NextResponse.json(
        { error: "Exercício do plano não encontrado." },
        { status: 404 }
      );
    }

    // Verificar se pertence ao aluno logado
    if (planExercise.workoutPlan.student.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Acesso negado. Este plano não pertence a você." },
        { status: 403 }
      );
    }

    // Atualizar
    const updated = await prisma.workoutPlanExercise.update({
      where: { id },
      data: {
        customName: customName && customName.trim() !== "" ? customName.trim() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("ERRO AO ATUALIZAR NOME DO EXERCÍCIO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao renomear o exercício." },
      { status: 500 }
    );
  }
}
