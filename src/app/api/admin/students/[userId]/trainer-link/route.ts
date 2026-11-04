import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { recordTrainerStudentLinkEvent } from "@/lib/trainer-student-link-history";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const { userId } = await context.params;
    if (!userId.trim()) {
      return NextResponse.json({ error: "Identificador do aluno inválido." }, { status: 400 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true, trainerId: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil do aluno não encontrado." }, { status: 404 });
    }
    if (!profile.trainerId) {
      return NextResponse.json({ error: "O aluno não possui um treinador vinculado." }, { status: 409 });
    }
    const trainerId = profile.trainerId;

    const result = await prisma.$transaction(async (transaction) => {
      const detached = await transaction.studentProfile.updateMany({
        where: { id: profile.id, trainerId },
        data: { trainerId: null },
      });

      if (detached.count !== 1) return false;

      await recordTrainerStudentLinkEvent(transaction, {
        trainerId,
        studentId: profile.id,
        eventType: "UNLINKED",
      });
      return true;
    });

    if (!result) {
      return NextResponse.json({ error: "O vínculo foi alterado. Atualize a lista e tente novamente." }, { status: 409 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("ERRO AO ENCERRAR VÍNCULO DE ALUNO:", error);
    return NextResponse.json({ error: "Não foi possível encerrar o vínculo." }, { status: 500 });
  }
}
