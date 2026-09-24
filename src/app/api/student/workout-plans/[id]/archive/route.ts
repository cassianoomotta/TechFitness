import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH: Alternar arquivamento da ficha (isArchived: true / false)
export async function PATCH(
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

    const nextArchived = !plan.isArchived;

    const updated = await prisma.workoutPlan.update({
      where: { id },
      data: {
        isArchived: nextArchived,
      },
    });

    return NextResponse.json({
      success: true,
      isArchived: updated.isArchived,
      message: updated.isArchived ? "Ficha arquivada com sucesso." : "Ficha desarquivada com sucesso.",
    });
  } catch (error) {
    console.error("ERRO AO ARQUIVAR FICHA:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao alternar arquivamento da ficha." },
      { status: 500 }
    );
  }
}
