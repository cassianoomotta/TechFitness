export interface StudentRankingParticipant {
  id: string;
  name: string;
  email: string;
  image: string | null;
  weeklyGoal: number;
  weeklyXp: number;
  monthlyXp: number;
  totalXp: number;
  level: number;
  levelTitle: string;
  totalSessions: number;
}

export interface StudentRankingPeriodPayload {
  rankedStudentIds: string[];
  userPosition: number;
}

export interface StudentRankingPayload {
  participants: StudentRankingParticipant[];
  totalParticipants: number;
  periods: {
    weekly: StudentRankingPeriodPayload;
    monthly: StudentRankingPeriodPayload;
    allTime: StudentRankingPeriodPayload;
  };
}

export interface StudentRankingItem extends StudentRankingParticipant {
  displayXp: number;
}

export interface StudentRankingPeriodData {
  top5: StudentRankingItem[];
  allRanked: StudentRankingItem[];
  userPosition: number;
}

export interface StudentRankingData {
  top5: StudentRankingItem[];
  allRanked: StudentRankingItem[];
  userPosition: number;
  totalParticipants: number;
  periods: {
    weekly: StudentRankingPeriodData;
    monthly: StudentRankingPeriodData;
    allTime: StudentRankingPeriodData;
  };
}

export function hydrateStudentRankingPayload(
  payload: StudentRankingPayload
): StudentRankingData {
  const participantsById = new Map(
    payload.participants.map((participant) => [participant.id, participant])
  );

  const buildPeriod = (
    period: StudentRankingPeriodPayload,
    xpKey: "weeklyXp" | "monthlyXp" | "totalXp"
  ): StudentRankingPeriodData => {
    const allRanked = period.rankedStudentIds.flatMap((studentId) => {
      const participant = participantsById.get(studentId);
      return participant
        ? [{ ...participant, displayXp: participant[xpKey] }]
        : [];
    });

    return {
      top5: allRanked.slice(0, 5),
      allRanked,
      userPosition: period.userPosition,
    };
  };

  const weekly = buildPeriod(payload.periods.weekly, "weeklyXp");

  return {
    top5: weekly.top5,
    allRanked: weekly.allRanked,
    userPosition: weekly.userPosition,
    totalParticipants: payload.totalParticipants,
    periods: {
      weekly,
      monthly: buildPeriod(payload.periods.monthly, "monthlyXp"),
      allTime: buildPeriod(payload.periods.allTime, "totalXp"),
    },
  };
}
