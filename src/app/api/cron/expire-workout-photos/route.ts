import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const PHOTO_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "Rotina de expiração não configurada." },
      { status: 503 }
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const photoCutoff = new Date(Date.now() - PHOTO_RETENTION_MS);
    const result = await prisma.workoutSession.updateMany({
      where: {
        completed: true,
        photoUrl: { not: null },
        date: { lte: photoCutoff },
      },
      data: { photoUrl: null },
    });

    console.info("Fotos de check-in expiradas removidas:", result.count);
    return NextResponse.json({
      success: true,
      removedPhotos: result.count,
      expiredBefore: photoCutoff.toISOString(),
    });
  } catch (error) {
    console.error("ERRO AO EXPIRAR FOTOS DE CHECK-IN:", error);
    return NextResponse.json(
      { error: "Não foi possível expirar as fotos de check-in." },
      { status: 500 }
    );
  }
}
