import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export interface RegisteredUserItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  trainerName: string | null;
  workoutsCount: number;
  plansCount: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const isAuthorized =
      session.user.role === "TRAINER" ||
      session.user.role === "ADMIN" ||
      session.user.email === "cassianoomotta@gmail.com";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Acesso restrito a administradores e ao perfil autorizado." },
        { status: 403 }
      );
    }

    // Buscar todos os alunos cadastrados no sistema
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        studentProfile: {
          select: {
            trainer: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: {
                sessions: true,
                workoutPlans: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted: RegisteredUserItem[] = users.map((u) => ({
      id: u.id,
      name: u.name || "Sem Nome",
      email: u.email,
      image: u.image,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      trainerName: u.studentProfile?.trainer?.user?.name || null,
      workoutsCount: u.studentProfile?._count?.sessions || 0,
      plansCount: u.studentProfile?._count?.workoutPlans || 0,
    }));

    return NextResponse.json({
      total: formatted.length,
      users: formatted,
    });
  } catch (error: unknown) {
    console.error("ERRO AO LISTAR USUÁRIOS REGISTRADOS:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar usuários cadastrados." },
      { status: 500 }
    );
  }
}
