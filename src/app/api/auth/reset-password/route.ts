import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .email("Endereço de e-mail inválido")
      .transform((val) => val.trim().toLowerCase()),
    newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "A confirmação deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      const flattened = validation.error.flatten().fieldErrors;
      const firstError =
        flattened.newPassword?.[0] ||
        flattened.confirmPassword?.[0] ||
        flattened.email?.[0] ||
        "Dados inválidos para redefinição.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Nenhum usuário encontrado com este endereço de e-mail." },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Sua senha foi redefinida com sucesso! Agora você já pode fazer login.",
    });
  } catch (error) {
    console.error("ERRO AO REDEFINIR SENHA:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao redefinir a senha. Tente novamente." },
      { status: 500 }
    );
  }
}
