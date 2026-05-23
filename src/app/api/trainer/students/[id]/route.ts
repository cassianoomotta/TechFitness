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
          include: {
            exercises: {
              orderBy: {
                order: "asc",
              },
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

    const DAY_ORDER: Record<string, number> = {
      "Seg": 1,
      "Ter": 2,
      "Qua": 3,
      "Qui": 4,
      "Sex": 5,
      "Sáb": 6,
      "Dom": 7
    };

    student.workoutPlans.sort((a, b) => {
      if (!a.weekDays && !b.weekDays) return 0;
      if (!a.weekDays) return 1;
      if (!b.weekDays) return -1;

      const aDays = a.weekDays.split(",").map(d => d.trim()).map(d => DAY_ORDER[d] || 999).sort((x, y) => x - y);
      const bDays = b.weekDays.split(",").map(d => d.trim()).map(d => DAY_ORDER[d] || 999).sort((x, y) => x - y);

      for (let i = 0; i < Math.max(aDays.length, bDays.length); i++) {
        const aVal = aDays[i] !== undefined ? aDays[i] : 999;
        const bVal = bDays[i] !== undefined ? bDays[i] : 999;
        if (aVal !== bVal) {
          return aVal - bVal;
        }
      }
      return 0;
    });

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
