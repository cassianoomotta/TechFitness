import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "A senha atual é obrigatória"),
    newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "A confirmação da nova senha deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "A nova senha e a confirmação não coincidem",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await request.json();

    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Dados inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;

    // Buscar usuário com senha atual no banco
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // Validar se a senha atual confere
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "A senha atual informada está incorreta." },
        { status: 400 }
      );
    }

    // Criptografar nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso!",
    });
  } catch (error) {
    console.error("ERRO AO ALTERAR SENHA:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao alterar a senha. Tente novamente." },
      { status: 500 }
    );
  }
}
