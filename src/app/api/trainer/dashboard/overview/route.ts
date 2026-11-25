import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { countWeeklyPersonalRecords } from "@/lib/trainer-stat-aggregation";
import { TrainerDashboardOverview, TrainerDashboardPeriod, TrainerRelationshipPeriod } from "@/lib/trainer-dashboard";

const querySchema = z.object({
  period: z.enum(["7d", "30d", "90d"]).default("30d"),
  relationshipPeriod: z.enum(["6m", "12m"]).default("6m"),
});

interface SessionBucketRow { bucket: Date; completedSessions: number }
interface PRBucketRow { bucket: Date; personalRecords: number }
interface RelationshipBucketRow { bucket: Date; eventType: "LINKED" | "UNLINKED"; total: number }

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function activityStart(now: Date, period: TrainerDashboardPeriod): Date {
  const start = startOfUtcDay(now);
  start.setUTCDate(start.getUTCDate() - (period === "7d" ? 6 : period === "30d" ? 29 : 89));
  return start;
}

function relationshipStart(now: Date, period: TrainerRelationshipPeriod): Date {
  const months = period === "6m" ? 6 : 12;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 1));
}

function dayKey(date: Date): string { return date.toISOString().slice(0, 10); }
function monthKey(date: Date): string { return date.toISOString().slice(0, 7); }

function makeSessionSeries(now: Date, period: TrainerDashboardPeriod, values: Map<string, number>) {
  if (period === "90d") {
    const firstDay = activityStart(now, period);
    const firstMonday = new Date(firstDay);
    firstMonday.setUTCDate(firstMonday.getUTCDate() - ((firstMonday.getUTCDay() + 6) % 7));
    const currentMonday = startOfUtcDay(now);
    currentMonday.setUTCDate(currentMonday.getUTCDate() - ((currentMonday.getUTCDay() + 6) % 7));
    const weekCount = Math.floor((currentMonday.getTime() - firstMonday.getTime()) / (7 * 86_400_000)) + 1;
    return Array.from({ length: weekCount }, (_unused, index) => {
      const monday = new Date(firstMonday);
      monday.setUTCDate(monday.getUTCDate() + index * 7);
      const bucket = dayKey(monday);
      return { bucket, completedSessions: values.get(bucket) ?? 0 };
    });
  }

  const days = period === "7d" ? 7 : 30;
  const today = startOfUtcDay(now);
  return Array.from({ length: days }, (_unused, index) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - (days - index - 1));
    const bucket = dayKey(date);
    return { bucket, completedSessions: values.get(bucket) ?? 0 };
  });
}

function makeRelationshipSeries(now: Date, period: TrainerRelationshipPeriod, values: Map<string, { linked: number; unlinked: number }>) {
  const months = period === "6m" ? 6 : 12;
  return Array.from({ length: months }, (_unused, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1 + index, 1));
    const bucket = monthKey(date);
    const count = values.get(bucket);
    return { bucket, linked: count?.linked ?? 0, unlinked: count?.unlinked ?? 0 };
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Acesso restrito a treinadores." }, { status: 403 });
    }

    const parsed = querySchema.safeParse({
      period: request.nextUrl.searchParams.get("period") ?? undefined,
      relationshipPeriod: request.nextUrl.searchParams.get("relationshipPeriod") ?? undefined,
    });
    if (!parsed.success) return NextResponse.json({ error: "Período inválido." }, { status: 400 });

    const { period, relationshipPeriod } = parsed.data;
    const trainer = await prisma.trainerProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!trainer) return NextResponse.json({ error: "Perfil de treinador não encontrado." }, { status: 404 });

    const now = new Date();
    const since = activityStart(now, period);
    const prSeriesStart = startOfUtcDay(now);
    prSeriesStart.setUTCDate(prSeriesStart.getUTCDate() - ((prSeriesStart.getUTCDay() + 6) % 7) - 12 * 7);
    const relationshipSince = relationshipStart(now, relationshipPeriod);
    const students = await prisma.studentProfile.findMany({
      where: { trainerId: trainer.id },
      select: {
        id: true,
        user: { select: { name: true, image: true } },
      },
      orderBy: { user: { name: "asc" } },
    });
    const studentIds = students.map((student) => student.id);

    const [completedSessions, sessionsInRange, lastSessions, activePlanCounts, oldestActivePlans, relationshipRows, sessionRows, prRows, recentMaxes, previousMaxes] = await Promise.all([
      studentIds.length === 0 ? Promise.resolve(0) : prisma.workoutSession.count({
        where: { studentId: { in: studentIds }, completed: true, date: { gte: since } },
      }),
      studentIds.length === 0 ? Promise.resolve([]) : prisma.workoutSession.groupBy({
        by: ["studentId"], _count: { _all: true },
        where: { studentId: { in: studentIds }, completed: true, date: { gte: since } },
      }),
      studentIds.length === 0 ? Promise.resolve([]) : prisma.workoutSession.groupBy({
        by: ["studentId"], _max: { date: true },
        where: { studentId: { in: studentIds }, completed: true },
      }),
      studentIds.length === 0 ? Promise.resolve([]) : prisma.workoutPlan.groupBy({
        by: ["studentId"], _count: { _all: true },
        where: { studentId: { in: studentIds }, isArchived: false, deletionStatus: "ACTIVE" },
      }),
      studentIds.length === 0 ? Promise.resolve([]) : prisma.workoutPlan.findMany({
        where: { studentId: { in: studentIds }, isArchived: false, deletionStatus: "ACTIVE" },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: 8,
        select: { id: true, studentId: true, name: true, createdAt: true },
      }),
      prisma.$queryRaw<RelationshipBucketRow[]>(Prisma.sql`
        SELECT date_trunc('month', "createdAt") AS bucket, "eventType", COUNT(*)::int AS total
        FROM "TrainerStudentLinkEvent"
        WHERE "trainerId" = ${trainer.id} AND "createdAt" >= ${relationshipSince}
        GROUP BY 1, 2 ORDER BY 1 ASC
      `),
      studentIds.length === 0 ? Promise.resolve([]) : prisma.$queryRaw<SessionBucketRow[]>(Prisma.sql`
        SELECT date_trunc(${period === "90d" ? "week" : "day"}, "date") AS bucket,
          COUNT(*)::int AS "completedSessions"
        FROM "WorkoutSession"
        WHERE "studentId" IN (${Prisma.join(studentIds)}) AND "completed" = true AND "date" >= ${since}
        GROUP BY 1 ORDER BY 1 ASC
      `),
      studentIds.length === 0 ? Promise.resolve([]) : prisma.$queryRaw<PRBucketRow[]>(Prisma.sql`
        WITH historical_maxes AS (
          SELECT log."studentId", log."exerciseId", MAX(log."weightUsed") AS max_weight
          FROM "ExerciseLog" AS log
          INNER JOIN "WorkoutSession" AS session ON session."id" = log."sessionId"
          WHERE log."studentId" IN (${Prisma.join(studentIds)}) AND session."date" < ${prSeriesStart}
          GROUP BY log."studentId", log."exerciseId"
        ),
        weekly_maxes AS (
          SELECT log."studentId", log."exerciseId", date_trunc('week', session."date") AS bucket,
            MAX(log."weightUsed") AS max_weight
          FROM "ExerciseLog" AS log
          INNER JOIN "WorkoutSession" AS session ON session."id" = log."sessionId"
          WHERE log."studentId" IN (${Prisma.join(studentIds)})
            AND session."date" >= ${prSeriesStart} AND session."date" <= ${now}
          GROUP BY log."studentId", log."exerciseId", date_trunc('week', session."date")
        ),
        ranked AS (
          SELECT weekly."studentId" AS "studentId", weekly."exerciseId" AS "exerciseId", weekly.bucket, weekly.max_weight,
            GREATEST(
              COALESCE(historical.max_weight, 0),
              COALESCE(MAX(weekly.max_weight) OVER (PARTITION BY weekly."studentId", weekly."exerciseId" ORDER BY weekly.bucket
                ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0)
            ) AS prior_max
          FROM weekly_maxes AS weekly
          LEFT JOIN historical_maxes AS historical
            ON historical."studentId" = weekly."studentId" AND historical."exerciseId" = weekly."exerciseId"
        )
        SELECT bucket, COUNT(*)::int AS "personalRecords"
        FROM ranked
        WHERE prior_max > 0 AND max_weight > prior_max
        GROUP BY bucket ORDER BY bucket ASC
      `),
      studentIds.length === 0 ? Promise.resolve([]) : prisma.exerciseLog.groupBy({
        by: ["studentId", "exerciseId"], _max: { weightUsed: true },
        where: { studentId: { in: studentIds }, session: { date: { gte: new Date(now.getTime() - 7 * 86_400_000) } } },
      }),
      studentIds.length === 0 ? Promise.resolve([]) : prisma.exerciseLog.groupBy({
        by: ["studentId", "exerciseId"], _max: { weightUsed: true },
        where: { studentId: { in: studentIds }, session: { date: { lt: new Date(now.getTime() - 7 * 86_400_000) } } },
      }),
    ]);

    const sessionsByStudent = new Map(sessionsInRange.map((row) => [row.studentId, row._count._all]));
    const lastSessionByStudent = new Map(lastSessions.map((row) => [row.studentId, row._max.date]));
    const activePlanCountByStudent = new Map(activePlanCounts.map((row) => [row.studentId, row._count._all]));
    const relationshipByMonth = new Map<string, { linked: number; unlinked: number }>();
    for (const row of relationshipRows) {
      const key = monthKey(row.bucket);
      const counts = relationshipByMonth.get(key) ?? { linked: 0, unlinked: 0 };
      if (row.eventType === "LINKED") counts.linked = row.total;
      else counts.unlinked = row.total;
      relationshipByMonth.set(key, counts);
    }
    const sessionsByBucket = new Map(sessionRows.map((row) => [dayKey(row.bucket), row.completedSessions]));
    const recordsByBucket = new Map(prRows.map((row) => [dayKey(row.bucket), row.personalRecords]));
    const recentRecordMaxes = new Map(recentMaxes.map((row) => [`${row.studentId}_${row.exerciseId}`, row._max.weightUsed ?? 0]));
    const previousRecordMaxes = new Map(previousMaxes.map((row) => [`${row.studentId}_${row.exerciseId}`, row._max.weightUsed ?? 0]));
    const plansByStudent = new Map<string, Array<{ id: string; name: string; createdAt: string; ageDays: number }>>();
    for (const plan of oldestActivePlans) {
      const studentPlans = plansByStudent.get(plan.studentId) ?? [];
      studentPlans.push({
        id: plan.id,
        name: plan.name,
        createdAt: plan.createdAt.toISOString(),
        ageDays: Math.max(0, Math.floor((now.getTime() - plan.createdAt.getTime()) / 86_400_000)),
      });
      plansByStudent.set(plan.studentId, studentPlans);
    }

    const rosterActivity = students.map((student) => ({
      studentId: student.id,
      name: student.user.name || "Aluno sem nome",
      image: student.user.image,
      lastSessionAt: lastSessionByStudent.get(student.id)?.toISOString() ?? null,
      sessionsInPeriod: sessionsByStudent.get(student.id) ?? 0,
      activePlanCount: activePlanCountByStudent.get(student.id) ?? 0,
      activePlans: plansByStudent.get(student.id) ?? [],
    }));

    const reports = await prisma.trainerDailySummary.findMany({
      where: { trainerId: trainer.id, day: { gte: new Date(now.getTime() - 31 * 86_400_000) } },
      orderBy: { day: "desc" }, take: 30,
      select: { day: true, sessions: true, inactiveStudents: true, olderPlans: true, joined: true, departed: true },
    });
    const overview: TrainerDashboardOverview = {
      dailyReports: reports.map((report) => ({ ...report, day: dayKey(report.day) })),
      period,
      relationshipPeriod,
      generatedAt: now.toISOString(),
      summary: {
        linkedStudents: students.length,
        completedSessions,
        studentsWithoutSessions: rosterActivity.filter((student) => student.sessionsInPeriod === 0).length,
        activePlans: [...activePlanCountByStudent.values()].reduce((sum, count) => sum + count, 0),
        weeklyPersonalRecords: countWeeklyPersonalRecords(recentRecordMaxes, previousRecordMaxes),
      },
      sessionSeries: makeSessionSeries(now, period, sessionsByBucket),
      prSeries: Array.from({ length: 13 }, (_unused, index) => {
        const monday = startOfUtcDay(now);
        monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7) - (12 - index) * 7);
        const bucket = dayKey(monday);
        return { bucket, personalRecords: recordsByBucket.get(bucket) ?? 0 };
      }),
      relationshipSeries: makeRelationshipSeries(now, relationshipPeriod, relationshipByMonth),
      rosterActivity,
    };

    return NextResponse.json(overview, { headers: { "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    console.error("ERRO AO CARREGAR VISÃO DO TREINADOR:", error);
    return NextResponse.json({ error: "Não foi possível carregar os dados do painel." }, { status: 500 });
  }
}
