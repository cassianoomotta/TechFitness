import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RegisteredUserItem } from "@/lib/types/registered-user";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso restrito a administradores." },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        studentProfile: { isNot: null },
      },
      select: {
        id: true,
        name: true,
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
      image: u.image,
      role: "STUDENT",
      createdAt: u.createdAt.toISOString(),
      trainerName: u.studentProfile?.trainer?.user?.name || null,
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
