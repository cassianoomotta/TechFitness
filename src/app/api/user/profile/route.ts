import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres").max(100, "O nome é muito longo"),
  image: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("ERRO AO BUSCAR PERFIL:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await request.json();

    // Rejeitar expressamente tentativa de alteração de e-mail
    if ("email" in body && body.email !== session.user.email) {
      return NextResponse.json(
        { error: "O endereço de e-mail não pode ser alterado por segurança." },
        { status: 400 }
      );
    }

    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Dados inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, image } = validation.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        ...(image !== undefined ? { image } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Dados cadastrais atualizados com sucesso!",
    });
  } catch (error) {
    console.error("ERRO AO ATUALIZAR PERFIL:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar perfil." }, { status: 500 });
  }
}
