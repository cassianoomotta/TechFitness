import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const bulkActionSchema = z.object({
  planIds: z.array(z.string()).min(1, "Selecione ao menos um treino."),
  action: z.enum(["ARCHIVE", "UNARCHIVE", "DELETE", "REORDER"]),
});

// POST: Processa ações em lote (Arquivar, Desarquivar ou Excluir) para treinos do aluno
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas alunos podem executar ações em lote." },
        { status: 401 }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
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

    const body = await request.json();
    const validation = bulkActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos para a operação em lote." },
        { status: 400 }
      );
    }

    const { planIds, action } = validation.data;

    // Buscar planos pertencentes a este aluno
    const plans = await prisma.workoutPlan.findMany({
      where: {
        id: { in: planIds },
        studentId: studentProfile.id,
      },
      select: {
        id: true,
        name: true,
        createdByType: true,
        deletionStatus: true,
      },
    });

    if (plans.length === 0) {
      return NextResponse.json(
        { error: "Nenhum treino válido encontrado para a seleção." },
        { status: 404 }
      );
    }

    const validIds = plans.map((p) => p.id);

    // 1. Arquivar em Lote
    if (action === "ARCHIVE") {
      await prisma.workoutPlan.updateMany({
        where: { id: { in: validIds } },
        data: {
          isArchived: true,
          deletionStatus: "ARCHIVED",
        },
      });

      return NextResponse.json({
        success: true,
        action: "ARCHIVE",
        count: validIds.length,
        message: `${validIds.length} ficha(s) arquivada(s) com sucesso.`,
      });
    }

    // 2. Desarquivar em Lote
    if (action === "UNARCHIVE") {
      await prisma.workoutPlan.updateMany({
        where: { id: { in: validIds } },
        data: {
          isArchived: false,
          deletionStatus: "ACTIVE",
        },
      });

      return NextResponse.json({
        success: true,
        action: "UNARCHIVE",
        count: validIds.length,
        message: `${validIds.length} ficha(s) restaurada(s) para ativas com sucesso.`,
      });
    }

    // 3. Reordenar Treinos
    if (action === "REORDER") {
      await Promise.all(
        planIds.map((id, index) =>
          prisma.workoutPlan.updateMany({
            where: {
              id,
              studentId: studentProfile.id,
            },
            data: {
              order: index,
            },
          })
        )
      );

      return NextResponse.json({
        success: true,
        action: "REORDER",
        count: planIds.length,
        message: "Ordem dos treinos salva com sucesso.",
      });
    }

    // 3. Exclusão em Lote (respeitando o protocolo de 3 dias para fichas do treinador)
    if (action === "DELETE") {
      const studentCreatedIds: string[] = [];
      const trainerCreatedPlans: { id: string; name: string }[] = [];

      for (const p of plans) {
        if (p.createdByType === "STUDENT" || !studentProfile.trainerId) {
          studentCreatedIds.push(p.id);
        } else {
          trainerCreatedPlans.push({ id: p.id, name: p.name });
        }
      }

      // Exclusão imediata das fichas criadas pelo aluno
      if (studentCreatedIds.length > 0) {
        await prisma.workoutPlan.deleteMany({
          where: { id: { in: studentCreatedIds } },
        });
      }

      // Solicitação de exclusão com prazo de 3 dias para fichas do personal
      if (trainerCreatedPlans.length > 0 && studentProfile.trainer?.user) {
        const trainerPlanIds = trainerCreatedPlans.map((tp) => tp.id);
        await prisma.workoutPlan.updateMany({
          where: { id: { in: trainerPlanIds } },
          data: {
            deletionStatus: "PENDING_DELETION",
            deletionRequestedAt: new Date(),
          },
        });

        // Notificar o personal
        await prisma.notification.create({
          data: {
            userId: studentProfile.trainer.user.id,
            title: "Solicitações de Exclusão de Fichas ⚠️",
            message: `O atleta ${session.user.name || "Seu aluno"} solicitou a exclusão de ${trainerCreatedPlans.length} ficha(s): ${trainerCreatedPlans.map((p) => p.name).join(", ")}. Você tem até 3 dias para aprovar ou recusar.`,
          },
        });
      }

      let resultMessage = "";
      if (studentCreatedIds.length > 0 && trainerCreatedPlans.length > 0) {
        resultMessage = `${studentCreatedIds.length} ficha(s) própria(s) excluída(s) e ${trainerCreatedPlans.length} ficha(s) do treinador enviada(s) para aprovação de 3 dias.`;
      } else if (studentCreatedIds.length > 0) {
        resultMessage = `${studentCreatedIds.length} ficha(s) excluída(s) com sucesso.`;
      } else {
        resultMessage = `Solicitação de exclusão enviada ao treinador para ${trainerCreatedPlans.length} ficha(s) (prazo de até 3 dias).`;
      }

      return NextResponse.json({
        success: true,
        action: "DELETE",
        deletedCount: studentCreatedIds.length,
        requestedCount: trainerCreatedPlans.length,
        message: resultMessage,
      });
    }

    return NextResponse.json({ error: "Ação não suportada." }, { status: 400 });
  } catch (error: unknown) {
    console.error("ERRO NA OPERAÇÃO EM LOTE DE TREINOS:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar a ação em lote." },
      { status: 500 }
    );
  }
}
