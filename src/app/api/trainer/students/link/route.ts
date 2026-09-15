import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const linkStudentSchema = z.object({
  studentId: z.string().min(1, "ID do aluno é obrigatório"),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Não autorizado." },
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

    const body = await request.json();
    const validation = linkStudentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { studentId } = validation.data;

    // Verificar se o perfil do aluno existe
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        trainer: {
          include: {
            user: { select: { name: true } },
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

    // Impedir roubo de aluno: verificar se já tem trainer vinculado
    if (student.trainerId) {
      if (student.trainerId === trainerProfile.id) {
        return NextResponse.json(
          { error: "Este aluno já está vinculado ao seu painel." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error: "Este aluno já está vinculado a outro personal trainer. A desvinculação deve ser solicitada pelo aluno ou realizada por um administrador.",
        },
        { status: 409 }
      );
    }

    // Atualizar o trainerId do aluno para vinculá-lo ao treinador atual
    const updatedStudent = await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        trainerId: trainerProfile.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    // Notificar o aluno
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: "Treinador Vinculado 🤝",
        message: `Você foi vinculado ao treinador ${session.user.name}.`,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Aluno ${updatedStudent.user.name} foi adicionado ao seu painel.`,
    });
  } catch (error) {
    console.error("ERRO AO VINCULAR ALUNO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao vincular o aluno." },
      { status: 500 }
    );
  }
}
