import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Buscar o perfil do treinador
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainerProfile) {
      return NextResponse.json(
        { error: "Perfil de treinador não encontrado." },
        { status: 404 }
      );
    }

    // Buscar alunos existentes que batem com a busca e não estão vinculados a este treinador
    const students = await prisma.studentProfile.findMany({
      where: {
        user: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
          ],
        },
        OR: [
          { trainerId: null },
          { NOT: { trainerId: trainerProfile.id } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        trainer: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    const formattedStudents = students.map((student) => ({
      id: student.id,
      userId: student.user.id,
      name: student.user.name,
      email: student.user.email,
      image: student.user.image,
      currentTrainer: student.trainer?.user.name || null,
    }));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error("ERRO AO BUSCAR ALUNOS EXISTENTES:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao buscar alunos no sistema." },
      { status: 500 }
    );
  }
}
