import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const measurementSchema = z.object({
  weight: z.number().positive("O peso deve ser maior que zero"),
  bodyFat: z.number().min(0).max(100).optional().nullable(),
  chest: z.number().positive().optional().nullable(),
  waist: z.number().positive().optional().nullable(),
  armLeft: z.number().positive().optional().nullable(),
  armRight: z.number().positive().optional().nullable(),
  thighLeft: z.number().positive().optional().nullable(),
  thighRight: z.number().positive().optional().nullable(),
  calfLeft: z.number().positive().optional().nullable(),
  calfRight: z.number().positive().optional().nullable(),
  photos: z.array(
    z.string().refine(
      (str) => /^data:image\/(jpeg|png|webp);base64,/.test(str) && str.length < 7_000_000,
      "Imagem inválida ou muito grande (máx ~5MB). Use JPEG, PNG ou WebP."
    )
  ).optional(),
});

// GET: Buscar histórico de avaliações físicas de um aluno
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "TRAINER" && session.user.role !== "STUDENT")) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { id: studentId } = await params;

    // Verificar ownership baseado na role do usuário
    if (session.user.role === "TRAINER") {
      // Trainer: verificar se o aluno pertence a este trainer
      const trainerProfile = await prisma.trainerProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!trainerProfile) {
        return NextResponse.json(
          { error: "Perfil de treinador não encontrado." },
          { status: 404 }
        );
      }

      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
      });

      if (!student || student.trainerId !== trainerProfile.id) {
        return NextResponse.json(
          { error: "Acesso negado. Este aluno não está vinculado a você." },
          { status: 403 }
        );
      }
    } else if (session.user.role === "STUDENT") {
      // Student: só pode ver as próprias medições
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!studentProfile || studentProfile.id !== studentId) {
        return NextResponse.json(
          { error: "Acesso negado. Você só pode visualizar suas próprias medições." },
          { status: 403 }
        );
      }
    }

    // Buscar as avaliações
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
    });

    const formattedMeasurements = measurements.map((m) => ({
      ...m,
      photos: Array.isArray(m.photos) ? m.photos : [],
    }));

    return NextResponse.json(formattedMeasurements);
  } catch (error) {
    console.error("ERRO AO BUSCAR AVALIAÇÕES:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao buscar avaliações." },
      { status: 500 }
    );
  }
}

// POST: Registrar uma nova avaliação física para o aluno
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas personal trainers podem registrar avaliações físicas." },
        { status: 401 }
      );
    }

    const { id: studentId } = await params;
    const body = await request.json();
    const validation = measurementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Buscar perfil do personal trainer logado
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainerProfile) {
      return NextResponse.json(
        { error: "Perfil de treinador não encontrado." },
        { status: 404 }
      );
    }

    // Validar se o aluno pertence ao personal
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    if (student.trainerId !== trainerProfile.id) {
      return NextResponse.json(
        { error: "Acesso negado. Este aluno não pertence a você." },
        { status: 403 }
      );
    }

    const data = validation.data;

    const newMeasurement = await prisma.bodyMeasurement.create({
      data: {
        studentId,
        weight: data.weight,
        bodyFat: data.bodyFat || null,
        chest: data.chest || null,
        waist: data.waist || null,
        armLeft: data.armLeft || null,
        armRight: data.armRight || null,
        thighLeft: data.thighLeft || null,
        thighRight: data.thighRight || null,
        calfLeft: data.calfLeft || null,
        calfRight: data.calfRight || null,
        photos: JSON.stringify(data.photos || []),
      },
    });

    return NextResponse.json(newMeasurement, { status: 201 });
  } catch (error) {
    console.error("ERRO AO SALVAR AVALIAÇÃO:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao salvar a avaliação física." },
      { status: 500 }
    );
  }
}
