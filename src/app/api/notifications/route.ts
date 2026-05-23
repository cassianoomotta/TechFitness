import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Buscar as notificações do usuário logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20, // Retornar as últimas 20 notificações
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("ERRO AO BUSCAR NOTIFICAÇÕES:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao buscar notificações." },
      { status: 500 }
    );
  }
}

// PUT: Marcar todas as notificações do usuário logado como lidas
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ERRO AO MARCAR NOTIFICAÇÕES COMO LIDAS:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao marcar notificações como lidas." },
      { status: 500 }
    );
  }
}
