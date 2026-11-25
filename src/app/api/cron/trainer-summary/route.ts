import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const issuer = "https://token.actions.githubusercontent.com";
const keys = createRemoteJWKSet(new URL(issuer + "/.well-known/jwks"));
const workflow = "cassianoomotta/TechFitness/.github/workflows/trainer-summary.yml@refs/heads/master";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return new Response(null, { status: 401 });
  try {
    const { payload } = await jwtVerify(authorization.slice(7), keys, {
      issuer, audience: "techfitness-trainer-summary", algorithms: ["RS256"], requiredClaims: ["exp", "iat"],
    });
    if (payload.workflow_ref !== workflow || payload.repository_id !== "1247028917" ||
        payload.ref !== "refs/heads/master" || !["schedule", "workflow_dispatch"].includes(String(payload.event_name))) {
      return new Response(null, { status: 403 });
    }
  } catch {
    return new Response(null, { status: 401 });
  }

  // Prisma stores DateTime as UTC timestamps. Close the previous São Paulo calendar day.
  const [written] = await prisma.$transaction([
    prisma.$executeRaw`
      WITH bounds AS (
        SELECT (now() AT TIME ZONE 'America/Sao_Paulo')::date AS today
      ), report_window AS (
        SELECT today - 1 AS day,
          ((today - 1)::timestamp AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'UTC' AS start,
          (today::timestamp AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'UTC' AS finish
        FROM bounds
      ), student_counts AS (
        SELECT s."trainerId", count(ws.id) FILTER (WHERE ws.date >= w.start)::int AS sessions,
          s.id AS student, count(ws.id) = 0 AS inactive
        FROM "StudentProfile" s CROSS JOIN report_window w
        LEFT JOIN "WorkoutSession" ws ON ws."studentId" = s.id AND ws.completed
          AND ws.date >= w.finish - interval '7 days' AND ws.date < w.finish
        WHERE s."trainerId" IS NOT NULL GROUP BY s."trainerId", s.id
      ), activity AS (
        SELECT "trainerId", sum(sessions)::int AS sessions, count(*) FILTER (WHERE inactive)::int AS inactive
        FROM student_counts GROUP BY "trainerId"
      ), plans AS (
        SELECT s."trainerId", count(*)::int AS total FROM "WorkoutPlan" p
        JOIN "StudentProfile" s ON s.id = p."studentId"
        WHERE NOT p."isArchived" AND p."deletionStatus" = 'ACTIVE'
          AND p."createdAt" <= (now() AT TIME ZONE 'UTC') - interval '30 days'
        GROUP BY s."trainerId"
      ), links AS (
        SELECT e."trainerId", count(*) FILTER (WHERE e."eventType" = 'LINKED')::int AS joined,
          count(*) FILTER (WHERE e."eventType" = 'UNLINKED')::int AS departed
        FROM "TrainerStudentLinkEvent" e CROSS JOIN report_window w
        WHERE e."createdAt" >= w.start AND e."createdAt" < w.finish GROUP BY e."trainerId"
      )
      INSERT INTO "TrainerDailySummary" ("trainerId", day, sessions, "inactiveStudents", "olderPlans", joined, departed)
      SELECT t.id, w.day, coalesce(a.sessions,0), coalesce(a.inactive,0), coalesce(p.total,0),
        coalesce(l.joined,0), coalesce(l.departed,0)
      FROM "TrainerProfile" t CROSS JOIN report_window w LEFT JOIN activity a ON a."trainerId" = t.id
      LEFT JOIN plans p ON p."trainerId" = t.id LEFT JOIN links l ON l."trainerId" = t.id
      ON CONFLICT ("trainerId", day) DO NOTHING
    `,
    prisma.$executeRaw`DELETE FROM "TrainerDailySummary"
      WHERE day < (now() AT TIME ZONE 'America/Sao_Paulo')::date - 30`,
  ]);
  return NextResponse.json({ written });
}
