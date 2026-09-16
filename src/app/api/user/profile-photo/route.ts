import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const profilePhotoSchema = z.object({
  image: z.string().min(1, "A imagem é obrigatória").max(3 * 1024 * 1024, "Imagem muito grande (máximo 3MB)"),
});

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = profilePhotoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { image } = validation.data;

    // Atualizar no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
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
    });
  } catch (error) {
    console.error("ERRO AO ATUALIZAR FOTO DE PERFIL:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao salvar sua foto de perfil." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    // Limpar foto de perfil no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
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
    });
  } catch (error) {
    console.error("ERRO AO REMOVER FOTO DE PERFIL:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao remover sua foto de perfil." },
      { status: 500 }
    );
  }
}
