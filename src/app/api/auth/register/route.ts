import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Endereço de email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["TRAINER", "STUDENT"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação com Zod
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado no sistema." },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transação no Prisma para garantir criação atômica do usuário e seu perfil
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      if (role === "TRAINER") {
        await tx.trainerProfile.create({
          data: {
            userId: user.id,
          },
        });
      } else if (role === "STUDENT") {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
          },
        });

        // Notificar todos os treinadores sobre o novo aluno disponível
        const trainers = await tx.user.findMany({
          where: { role: "TRAINER" },
          select: { id: true }
        });

        if (trainers.length > 0) {
          await tx.notification.createMany({
            data: trainers.map((t) => ({
              userId: t.id,
              title: "Novo Aluno Registrado 🆕",
              message: `${name} acabou de se cadastrar no sistema e está disponível para ser vinculado!`,
            }))
          });
        }
      }

      return user;
    });

    return NextResponse.json(
      {
        message: "Usuário registrado com sucesso!",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("ERRO NO REGISTRO DE USUÁRIO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar seu cadastro." },
      { status: 500 }
    );
  }
}
