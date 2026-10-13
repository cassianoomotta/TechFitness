import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type {
  ExerciseProgressPoint,
  ExerciseProgressResponse,
  ExerciseProgressSeries,
} from "@/lib/exercise-progress";

const exerciseIdsSchema = z.array(z.string().trim().min(1).max(128)).min(1).max(20);

interface ExerciseSetRecord {
  exerciseId: string;
  setNumber: number;
  weightUsed: number;
  repsPerformed: number;
}

function getBestSet(
  sets: ExerciseSetRecord[],
  metric: ExerciseProgressSeries["metric"]
): ExerciseSetRecord | null {
  const comparableSets = sets.filter((set) =>
    metric === "best_set_volume"
      ? set.weightUsed > 0 && set.repsPerformed > 0
      : set.repsPerformed > 0
  );

  return comparableSets.reduce<ExerciseSetRecord | null>((best, current) => {
    if (!best) return current;

    const bestValue = metric === "best_set_volume"
      ? best.weightUsed * best.repsPerformed
      : best.repsPerformed;
    const currentValue = metric === "best_set_volume"
      ? current.weightUsed * current.repsPerformed
      : current.repsPerformed;

    if (currentValue > bestValue) return current;
    if (
      currentValue === bestValue &&
      (current.weightUsed > best.weightUsed ||
        (current.weightUsed === best.weightUsed && current.setNumber < best.setNumber))
    ) {
      return current;
    }

    return best;
  }, null);
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const requestedExerciseIds = new URL(request.url).searchParams.getAll("exerciseId");
    const validation = exerciseIdsSchema.safeParse(requestedExerciseIds);
    if (!validation.success) {
      return NextResponse.json({ error: "Lista de exercícios inválida." }, { status: 400 });
    }

    const exerciseIds = Array.from(new Set(validation.data));
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    const sessions = await prisma.workoutSession.findMany({
      where: {
        studentId: studentProfile.id,
        completed: true,
        logs: { some: { exerciseId: { in: exerciseIds } } },
      },
      orderBy: { date: "desc" },
      take: 60,
      select: {
        id: true,
        date: true,
        logs: {
          where: { exerciseId: { in: exerciseIds } },
          select: {
            exerciseId: true,
            setNumber: true,
            weightUsed: true,
            repsPerformed: true,
          },
        },
      },
    });

    const exercises: ExerciseProgressSeries[] = exerciseIds.map((exerciseId) => {
      const matchingSets = sessions.flatMap((workoutSession) =>
        workoutSession.logs.filter((log) => log.exerciseId === exerciseId)
      );
      const metric: ExerciseProgressSeries["metric"] = matchingSets.some(
        (set) => set.weightUsed > 0
      )
        ? "best_set_volume"
        : "best_set_reps";

      const points: ExerciseProgressPoint[] = sessions.flatMap((workoutSession) => {
        const sets = workoutSession.logs.filter((log) => log.exerciseId === exerciseId);
        const bestSet = getBestSet(sets, metric);
        if (!bestSet) return [];

        return [{
          sessionId: workoutSession.id,
          date: workoutSession.date.toISOString(),
          value: metric === "best_set_volume"
            ? bestSet.weightUsed * bestSet.repsPerformed
            : bestSet.repsPerformed,
          weightKg: bestSet.weightUsed,
          reps: bestSet.repsPerformed,
        }];
      }).slice(0, 6).reverse();

      return { exerciseId, metric, points };
    });

    const response: ExerciseProgressResponse = { exercises };
    return NextResponse.json(response);
  } catch (error) {
    console.error("ERRO AO BUSCAR HISTÓRICO DE EXERCÍCIOS:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar a evolução dos exercícios." },
      { status: 500 }
    );
  }
}
