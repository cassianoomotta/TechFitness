import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [name, domain] = parts;
  const maskedName = name.length <= 2 ? name[0] + "***" : name.slice(0, 2) + "***" + name.slice(-1);
  return `${maskedName}@${domain}`;
}

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
    const query = (searchParams.get("q") || "").trim();

    if (query.length < 2) {
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

    const isEmailSearch = query.includes("@");

    // Blindagem de privacidade: busca aberta exibe apenas alunos disponíveis (sem treinador)
    // Se for pesquisa por e-mail exato, busca direta permitida
    const whereClause = isEmailSearch
      ? {
          user: {
            email: { equals: query.toLowerCase(), mode: "insensitive" as const },
          },
          NOT: { trainerId: trainerProfile.id },
        }
      : {
          trainerId: null, // Apenas alunos que ainda não possuem personal vinculado
          user: {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
            ],
          },
        };

    const students = await prisma.studentProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      take: 10,
    });

    const formattedStudents = students.map((student) => ({
      id: student.id,
      userId: student.user.id,
      name: student.user.name,
      email: maskEmail(student.user.email),
      image: student.user.image,
      alreadyHasTrainer: student.trainerId !== null,
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
