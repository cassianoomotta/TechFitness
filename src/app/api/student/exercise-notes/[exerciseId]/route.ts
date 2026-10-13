import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { normalizeStudentExerciseNote } from "@/lib/student-exercise-notes";

const updateNoteSchema = z.object({
  note: z.string().max(1000),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ exerciseId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const parsedBody = updateNoteSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json({ error: "A observação deve ter até 1000 caracteres." }, { status: 400 });
    }

    const { exerciseId } = await params;
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    const planExercise = await prisma.workoutPlanExercise.findFirst({
      where: {
        exerciseId,
        workoutPlan: { studentId: studentProfile.id },
      },
      select: { id: true },
    });
    if (!planExercise) {
      return NextResponse.json({ error: "Exercício não encontrado nas suas fichas." }, { status: 404 });
    }

    const note = normalizeStudentExerciseNote(parsedBody.data.note);
    if (note === null) {
      await prisma.$executeRaw`
        DELETE FROM "StudentExerciseNote"
        WHERE "studentProfileId" = ${studentProfile.id} AND "exerciseId" = ${exerciseId}
      `;
      return NextResponse.json({ note: null, saved: false });
    }

    await prisma.$executeRaw`
      INSERT INTO "StudentExerciseNote" ("studentProfileId", "exerciseId", "note", "updatedAt")
      VALUES (${studentProfile.id}, ${exerciseId}, ${note}, CURRENT_TIMESTAMP)
      ON CONFLICT ("studentProfileId", "exerciseId")
      DO UPDATE SET "note" = EXCLUDED."note", "updatedAt" = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ note, saved: true });
  } catch (error) {
    console.error("Erro ao salvar observação pessoal de exercício:", error);
    return NextResponse.json({ error: "Não foi possível salvar a observação." }, { status: 500 });
  }
}
