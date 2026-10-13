export interface PhotoFeedMembership {
  group: {
    members: Array<{ studentId: string }>;
  };
}

export interface PhotoFeedSession {
  id: string;
  date: Date;
  photoUrl: string | null;
  durationMs: number | null;
  satisfaction: number | null;
}

export interface WeeklyPhotoFeedItem {
  id: string;
  date: string;
  dayOfWeek: string;
  dayOfWeekFull: string;
  formattedDate: string;
  photoUrl: string;
  durationMinutes: number;
  satisfaction: number | null;
}

const DAY_NAMES: Record<number, { short: string; full: string }> = {
  0: { short: "DOM", full: "Domingo" },
  1: { short: "SEG", full: "Segunda-feira" },
  2: { short: "TER", full: "Terça-feira" },
  3: { short: "QUA", full: "Quarta-feira" },
  4: { short: "QUI", full: "Quinta-feira" },
  5: { short: "SEX", full: "Sexta-feira" },
  6: { short: "SÁB", full: "Sábado" },
};

export function collectUniquePhotoFeedStudentIds(
  currentStudentId: string,
  memberships: readonly PhotoFeedMembership[]
): string[] {
  const studentIds = new Set<string>([currentStudentId]);
  for (const membership of memberships) {
    for (const member of membership.group.members) {
      studentIds.add(member.studentId);
    }
  }
  return Array.from(studentIds);
}

export function buildWeeklyPhotoFeed(
  sessions: readonly PhotoFeedSession[],
  now: Date
): WeeklyPhotoFeedItem[] {
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

  return sessions
    .filter(
      (session): session is PhotoFeedSession & { photoUrl: string } =>
        Boolean(session.photoUrl) && session.date.getTime() >= sevenDaysAgo
    )
    .map((session) => {
      const dayInfo = DAY_NAMES[session.date.getDay()] ?? {
        short: "TREINO",
        full: "Dia de Treino",
      };

      return {
        id: session.id,
        date: session.date.toISOString(),
        dayOfWeek: dayInfo.short,
        dayOfWeekFull: dayInfo.full,
        formattedDate: session.date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        photoUrl: session.photoUrl,
        durationMinutes: session.durationMs
          ? Math.round(session.durationMs / 60_000)
          : 0,
        satisfaction: session.satisfaction,
      };
    })
    .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime());
}
