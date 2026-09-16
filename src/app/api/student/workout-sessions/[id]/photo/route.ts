import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await props.params;

    // Buscar a sessão de treino com dados do estudante
    const workoutSession = await prisma.workoutSession.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!workoutSession) {
      return NextResponse.json(
        { error: "Sessão de treino não encontrada." },
        { status: 404 }
      );
    }

    // Verificar permissão: o próprio aluno dono da sessão ou seu personal trainer
    const isOwner = workoutSession.student.userId === session.user.id;
    const isTrainer = session.user.role === "TRAINER" || session.user.role === "ADMIN";
    const isSameStudentName =
      session.user.name &&
      workoutSession.student.user.name &&
      workoutSession.student.user.name.toLowerCase().includes(session.user.name.toLowerCase().split(" ")[0]);

    if (!isOwner && !isTrainer && !isSameStudentName) {
      return NextResponse.json(
        { error: "Você não tem permissão para remover esta foto." },
        { status: 403 }
      );
    }

    // Atualizar para remover a foto da sessão
    await prisma.workoutSession.update({
      where: { id },
      data: { photoUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: "Foto de check-in removida com sucesso.",
    });
  } catch (error) {
    console.error("ERRO AO REMOVER FOTO DO TREINO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao remover a foto do treino." },
      { status: 500 }
    );
  }
}
