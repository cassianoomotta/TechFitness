import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const handleRequestSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

// POST: Treinador aceita ou recusa a exclusão de uma ficha solicitada pelo aluno
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas treinadores podem responder a solicitações de exclusão." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = handleRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Ação inválida. Escolha APPROVE ou REJECT." },
        { status: 400 }
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

    const plan = await prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plano de treino não encontrado." },
        { status: 404 }
      );
    }

    if (plan.student.trainerId !== trainerProfile.id) {
      return NextResponse.json(
        { error: "Acesso negado. Este aluno não pertence à sua assessoria." },
        { status: 403 }
      );
    }

    const studentUserId = plan.student.user.id;
    const { action } = validation.data;

    if (action === "APPROVE") {
      // Excluir a ficha
      await prisma.workoutPlan.delete({
        where: { id },
      });

      // Notificar o aluno
      await prisma.notification.create({
        data: {
          userId: studentUserId,
          title: "Exclusão de Ficha Aprovada",
          message: `Seu treinador aceitou a solicitação e a ficha '${plan.name}' foi excluída com sucesso.`,
        },
      });

      return NextResponse.json({
        success: true,
        action: "APPROVE",
        message: "Ficha excluída com sucesso.",
      });
    } else {
      // Recusar: reverter status para ACTIVE e anular data
      await prisma.workoutPlan.update({
        where: { id },
        data: {
          deletionStatus: "ACTIVE",
          deletionRequestedAt: null,
        },
      });

      // Notificar o aluno
      await prisma.notification.create({
        data: {
          userId: studentUserId,
          title: "Ficha Mantida pelo Treinador",
          message: `Seu treinador optou por manter a ficha '${plan.name}' ativa no seu planejamento. Lembre-se que você ainda pode arquivá-la para não vê-la na sua lista principal.`,
        },
      });

      return NextResponse.json({
        success: true,
        action: "REJECT",
        message: "Solicitação recusada. A ficha foi mantida ativa.",
      });
    }
  } catch (error) {
    console.error("ERRO AO PROCESSAR SOLICITAÇÃO DE EXCLUSÃO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar a solicitação de exclusão." },
      { status: 500 }
    );
  }
}
