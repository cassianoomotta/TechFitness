import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const exerciseSchema = z.object({
  name: z.string().min(2, "O nome do exercício deve ter pelo menos 2 caracteres"),
  muscleGroup: z.string().min(2, "Selecione o grupo muscular primário"),
  equipment: z.string().min(2, "Selecione o equipamento utilizado"),
  description: z.string().optional(),
  videoUrl: z.string().url("Vídeo demonstrativo deve ser uma URL válida").or(z.literal("")).optional(),
  gifUrl: z.string().url("GIF de movimento deve ser uma URL válida").or(z.literal("")).optional(),
  alternatives: z.array(z.string()).optional(),
});

// GET: Buscar todos os exercícios com suporte a busca e filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const muscle = searchParams.get("muscle") || "";
    const equipment = searchParams.get("equipment") || "";

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (muscle && muscle !== "todos") {
      whereClause.muscleGroup = { equals: muscle };
    }

    if (equipment && equipment !== "todos") {
      whereClause.equipment = { equals: equipment };
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("ERRO AO BUSCAR EXERCÍCIOS:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao buscar os exercícios." },
      { status: 500 }
    );
  }
}

// POST: Criar um novo exercício na biblioteca (apenas Trainers e Admins)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "TRAINER" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Não autorizado. Apenas profissionais podem adicionar exercícios." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = exerciseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, muscleGroup, equipment, description, videoUrl, gifUrl, alternatives } = validation.data;

    // Verificar se já existe
    const existingExercise = await prisma.exercise.findUnique({
      where: { name },
    });

    if (existingExercise) {
      return NextResponse.json(
        { error: "Já existe um exercício cadastrado com este nome." },
        { status: 400 }
      );
    }

    const newExercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroup,
        equipment,
        description,
        videoUrl,
        gifUrl,
        alternatives: JSON.stringify(alternatives || []),
      },
    });

    return NextResponse.json(newExercise, { status: 201 });
  } catch (error) {
    console.error("ERRO AO CRIAR EXERCÍCIO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao salvar o exercício." },
      { status: 500 }
    );
  }
}
