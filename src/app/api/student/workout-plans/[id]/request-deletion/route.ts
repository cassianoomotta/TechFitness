import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST: Aluno solicita a exclusão de uma ficha prescrita por treinador (Protocolo de 3 dias)
export async function POST(
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

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { name: true } },
        trainer: {
          include: {
            user: { select: { id: true, name: true } },
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

    const plan = await prisma.workoutPlan.findUnique({
      where: { id },
    });

    if (!plan || plan.studentId !== studentProfile.id) {
      return NextResponse.json(
        { error: "Ficha não encontrada ou acesso negado." },
        { status: 404 }
      );
    }

    const now = new Date();

    // Atualizar status da ficha para PENDING_DELETION com data atual
    const updated = await prisma.workoutPlan.update({
      where: { id },
      data: {
        deletionStatus: "PENDING_DELETION",
        deletionRequestedAt: now,
      },
    });

    // Notificar o treinador, se houver
    if (studentProfile.trainer?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: studentProfile.trainer.user.id,
          title: "Solicitação de Exclusão de Ficha",
          message: `O atleta ${studentProfile.user.name || "seu aluno"} solicitou a exclusão da ficha '${plan.name}'. Você tem até 3 dias para aceitar ou manter a ficha ativa.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      deletionStatus: updated.deletionStatus,
      deletionRequestedAt: updated.deletionRequestedAt?.toISOString(),
      message: "Solicitação de exclusão enviada ao treinador. Caso não haja resposta em 3 dias, a ficha será excluída automaticamente.",
    });
  } catch (error) {
    console.error("ERRO AO SOLICITAR EXCLUSÃO DE FICHA:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao solicitar a exclusão da ficha." },
      { status: 500 }
    );
  }
}
