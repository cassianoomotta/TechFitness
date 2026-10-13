import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  buildWeeklyPhotoFeed,
  collectUniquePhotoFeedStudentIds,
} from "@/lib/student-photo-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const currentStudent = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        groupMemberships: {
          select: {
            group: {
              select: {
                members: { select: { studentId: true } },
              },
            },
          },
        },
      },
    });

    if (!currentStudent) {
      return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
    }

    const studentIds = collectUniquePhotoFeedStudentIds(
      currentStudent.id,
      currentStudent.groupMemberships
    );
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const students = await prisma.studentProfile.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        user: {
          select: { name: true, email: true, image: true },
        },
        sessions: {
          where: {
            date: { gte: sevenDaysAgo },
            photoUrl: { not: null },
          },
          select: {
            id: true,
            date: true,
            photoUrl: true,
            durationMs: true,
            satisfaction: true,
          },
          orderBy: { date: "desc" },
        },
      },
    });

    const weeklyFeed = students.flatMap((student) => {
      const studentName = student.user.name || student.user.email.split("@")[0];
      return buildWeeklyPhotoFeed(student.sessions, now).map((checkin) => ({
        ...checkin,
        studentId: student.id,
        studentName,
        studentImage: student.user.image,
      }));
    }).sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime());

    return NextResponse.json({ weeklyFeed });
  } catch (error) {
    console.error("ERRO AO BUSCAR MURAL DE FOTOS:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar mural de fotos." },
      { status: 500 }
    );
  }
}
