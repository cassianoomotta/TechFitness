import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    const { id } = await params;

    const group = await prisma.workoutGroup.findUnique({
      where: { id },
      include: {
        members: {
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
    }

    const membership = group.members.find(
      (m) => m.studentId === studentProfile.id
    );

    if (!membership) {
      return NextResponse.json(
        { error: "Você não faz parte deste grupo." },
        { status: 400 }
      );
    }

    const isCreator = group.creatorId === studentProfile.id;

    if (isCreator) {
      // Se for o único membro, exclui o grupo
      if (group.members.length <= 1) {
        await prisma.workoutGroup.delete({ where: { id } });
        return NextResponse.json({
          success: true,
          message: "Você saiu do grupo. Como era o único membro, o grupo foi excluído.",
        });
      }

      // Se houver outros membros, passa o criador para o membro mais antigo
      const nextLeader = group.members.find(
        (m) => m.studentId !== studentProfile.id
      );

      if (nextLeader) {
        await prisma.$transaction([
          prisma.groupMember.update({
            where: { id: nextLeader.id },
            data: { role: "CREATOR" },
          }),
          prisma.workoutGroup.update({
            where: { id },
            data: { creatorId: nextLeader.studentId },
          }),
          prisma.groupMember.delete({
            where: { id: membership.id },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: "Você saiu do grupo e a liderança foi transferida para outro membro.",
        });
      }
    }

    // Membro comum saindo
    await prisma.groupMember.delete({
      where: { id: membership.id },
    });

    return NextResponse.json({
      success: true,
      message: "Você saiu do grupo com sucesso.",
    });
  } catch (error) {
    console.error("ERRO AO SAIR DO GRUPO:", error);
    return NextResponse.json({ error: "Erro interno ao sair do grupo." }, { status: 500 });
  }
}
