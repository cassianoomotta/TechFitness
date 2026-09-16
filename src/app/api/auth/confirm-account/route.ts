import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const confirmAccountSchema = z.object({
  email: z.string().email("Endereço de e-mail inválido"),
  password: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres").optional(),
  image: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = confirmAccountSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Dados inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password, name, image } = validation.data;

    // Buscar usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Nenhuma conta encontrada com este endereço de e-mail." },
        { status: 404 }
      );
    }

    // Criptografar nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar dados
    const updateData: { password: string; name?: string; image?: string } = {
      password: hashedPassword,
    };

    if (name && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (image) {
      updateData.image = image;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Conta ativada com sucesso! Você já pode acessar a plataforma.",
    });
  } catch (error) {
    console.error("ERRO AO CONFIRMAR CONTA:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao confirmar a conta." },
      { status: 500 }
    );
  }
}
