import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const studentCreateSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Endereço de email inválido"),
  password: z.string().min(6, "A senha temporária deve ter pelo menos 6 caracteres"),
});

// GET: Listar todos os alunos vinculados ao personal trainer logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas treinadores podem acessar esta rota." },
        { status: 401 }
      );
    }

    // Buscar o perfil do treinador
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainerProfile) {
      return NextResponse.json(
        { error: "Perfil de treinador não encontrado." },
        { status: 404 }
      );
    }

    // Buscar todos os alunos vinculados a este treinador
    const students = await prisma.studentProfile.findMany({
      where: { trainerId: trainerProfile.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            workoutPlans: true,
            sessions: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    // Mapear retorno para facilitar leitura no front
    const formattedStudents = students.map((student) => ({
      id: student.id,
      userId: student.user.id,
      name: student.user.name,
      email: student.user.email,
      image: student.user.image,
      createdAt: student.user.createdAt,
      workoutPlansCount: student._count.workoutPlans,
      sessionsCount: student._count.sessions,
    }));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error("ERRO AO BUSCAR ALUNOS:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao buscar a lista de alunos." },
      { status: 500 }
    );
  }
}

// POST: Criar e vincular um novo aluno ao personal trainer logado
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainerProfile) {
      return NextResponse.json(
        { error: "Perfil de treinador não encontrado." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = studentCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado no sistema." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transação para criar o usuário aluno e seu perfil já vinculado ao trainer
    const newStudent = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STUDENT",
        },
      });

      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          trainerId: trainerProfile.id,
        },
      });

      return {
        id: profile.id,
        userId: user.id,
        name: user.name,
        email: user.email,
      };
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("ERRO AO CADASTRAR ALUNO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao cadastrar o aluno." },
      { status: 500 }
    );
  }
}
