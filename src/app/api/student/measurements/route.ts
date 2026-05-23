import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const weightMeasurementSchema = z.object({
  weight: z.number().positive("O peso deve ser um número positivo"),
  date: z.string().transform((val) => new Date(val)),
});

// GET: Buscar histórico de peso/medidas do aluno logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Perfil do aluno não encontrado." },
        { status: 404 }
      );
    }

    const measurements = await prisma.bodyMeasurement.findMany({
      where: { studentId: studentProfile.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(measurements);
  } catch (error) {
    console.error("ERRO AO BUSCAR MEDIDAS DO ALUNO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao carregar seu histórico de peso." },
      { status: 500 }
    );
  }
}

// POST: Registrar novo peso pelo aluno
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Perfil do aluno não encontrado." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = weightMeasurementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { weight, date } = validation.data;

    const newMeasurement = await prisma.bodyMeasurement.create({
      data: {
        studentId: studentProfile.id,
        weight,
        date,
      },
    });

    return NextResponse.json(newMeasurement, { status: 201 });
  } catch (error) {
    console.error("ERRO AO REGISTRAR PESO DO ALUNO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao registrar seu peso." },
      { status: 500 }
    );
  }
}
