import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const joinGroupSchema = z.object({
  code: z.string().trim().min(3, "Código de convite inválido.").max(150, "Código de convite inválido."),
});

export async function POST(req: NextRequest) {
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

    const body = await req.json().catch(() => null);
    const parseResult = joinGroupSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json({ error: issue?.message || "Código inválido." }, { status: 400 });
    }

    let cleanCode = parseResult.data.code.trim().toUpperCase();
    // Extrair padrão TF-XXXX caso o usuário tenha colado texto adicional
    const tfMatch = cleanCode.match(/TF-[A-Z0-9]{3,8}/i);
    if (tfMatch) {
      cleanCode = tfMatch[0].toUpperCase();
    }

    // Localizar grupo pelo código
    const group = await prisma.workoutGroup.findUnique({
      where: { code: cleanCode },
      include: {
        creator: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Nenhum grupo encontrado com este código de convite. Verifique o código e tente novamente." },
        { status: 404 }
      );
    }

    // Verificar se já é membro
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_studentId: {
          groupId: group.id,
          studentId: studentProfile.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: `Você já faz parte do grupo "${group.name}".` },
        { status: 400 }
      );
    }

    // Criar membro
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        studentId: studentProfile.id,
        role: "MEMBER",
      },
    });

    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        name: group.name,
        icon: group.icon,
      },
      message: `Você entrou com sucesso no grupo "${group.name}"!`,
    });
  } catch (error) {
    console.error("ERRO AO ENTRAR NO GRUPO:", error);
    return NextResponse.json({ error: "Erro interno ao entrar no grupo." }, { status: 500 });
  }
}
