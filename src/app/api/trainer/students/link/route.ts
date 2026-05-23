import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "ID do aluno é obrigatório." },
        { status: 400 }
      );
    }

    // Verificar se o perfil do aluno existe
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
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
