import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Buscar dados de um aluno específico se ele for vinculado ao personal logado
export async function GET(
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

    const { id } = await params;

    // Buscar o perfil do treinador logado
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainerProfile) {
      return NextResponse.json(
        { error: "Perfil de treinador não encontrado." },
        { status: 404 }
      );
    }

    // Buscar o aluno e verificar se pertence a esse treinador
    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        workoutPlans: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
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

    const formattedStudent = {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      image: student.user.image,
      workoutPlans: student.workoutPlans,
    };

    return NextResponse.json(formattedStudent);
  } catch (error) {
    console.error("ERRO AO BUSCAR DETALHES DO ALUNO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao buscar detalhes do aluno." },
      { status: 500 }
    );
  }
}
