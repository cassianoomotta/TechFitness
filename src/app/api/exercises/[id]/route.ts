import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const exerciseUpdateSchema = z.object({
  name: z.string().min(2, "O nome do exercício deve ter pelo menos 2 caracteres").optional(),
  muscleGroup: z.string().min(2, "Selecione o grupo muscular primário").optional(),
  equipment: z.string().min(2, "Selecione o equipamento utilizado").optional(),
  description: z.string().optional(),
  videoUrl: z.string().url("Vídeo demonstrativo deve ser uma URL válida").or(z.literal("")).optional(),
  gifUrl: z.string().url("GIF de movimento deve ser uma URL válida").or(z.literal("")).optional(),
  alternatives: z.array(z.string()).optional(),
});

// PUT: Atualizar dados de um exercício específico
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "TRAINER" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = exerciseUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verificar se o exercício existe
    const existingExercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existingExercise) {
      return NextResponse.json(
        { error: "Exercício não encontrado." },
        { status: 404 }
      );
    }

    // Se mudou o nome, verificar se não colide com outro exercício
    if (validation.data.name && validation.data.name !== existingExercise.name) {
      const nameConflict = await prisma.exercise.findUnique({
        where: { name: validation.data.name },
      });
      if (nameConflict) {
        return NextResponse.json(
          { error: "Já existe outro exercício cadastrado com este nome." },
          { status: 400 }
        );
      }
    }

    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error("ERRO AO ATUALIZAR EXERCÍCIO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao atualizar o exercício." },
      { status: 500 }
    );
  }
}

// DELETE: Remover um exercício específico
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "TRAINER" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar se o exercício existe
    const existingExercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existingExercise) {
      return NextResponse.json(
        { error: "Exercício não encontrado." },
        { status: 404 }
      );
    }

    await prisma.exercise.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Exercício excluído com sucesso!" });
  } catch (error) {
    console.error("ERRO AO DELETAR EXERCÍCIO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao excluir o exercício. Certifique-se de que ele não está associado a nenhuma ficha de treino." },
      { status: 500 }
    );
  }
}
