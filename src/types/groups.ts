export interface GroupSummaryItem {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  icon: string;
  creatorId: string;
  isCreator: boolean;
  memberCount: number;
  joinedAt?: string;
  myRole: "CREATOR" | "MEMBER";
}

export interface GroupMemberItem {
  id: string;
  studentId: string;
  name: string;
  email: string;
  image?: string | null;
  role: "CREATOR" | "MEMBER";
  joinedAt: string;
  isCreator: boolean;
  isMe: boolean;
}

export interface GroupRankingItem {
  rank: number;
  studentId: string;
  name: string;
  image?: string | null;
  checkinsCount: number;
  streak: number;
  totalXp: number;
  level: number;
  levelTitle: string;
  tierName: string;
  tierBadge: string;
  isMe: boolean;
  isCreator: boolean;
}

export interface GroupCheckinItem {
  sessionId: string;
  date: string;
  photoUrl: string;
  durationMs: number;
  satisfaction: number;
  student: {
    id: string;
    name: string;
    image?: string | null;
    level: number;
    levelTitle: string;
    tierName: string;
    tierBadge: string;
  };
}

export interface GroupDetail {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  icon: string;
  creatorId: string;
  isCreator: boolean;
  createdAt: string;
  members: GroupMemberItem[];
  ranking: GroupRankingItem[];
  checkins: GroupCheckinItem[];
}

export interface TimelineExerciseSummary {
  name: string;
  sets: number;
  maxWeight: number;
}

export interface TimelineItem {
  id: string;
  date: string;
  durationMs: number;
  satisfaction: number;
  photoUrl?: string | null;
  isMe: boolean;
  student: {
    id: string;
    name: string;
    image?: string | null;
    streak: number;
    level: number;
    levelTitle: string;
    tierName: string;
    tierBadge: string;
  };
  groups: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  exercises: TimelineExerciseSummary[];
  exercisesCount: number;
}

export interface PartnerComparisonData {
  myInfo: {
    name: string;
    sessionsCount: number;
    totalVolume: number;
  };
  partnerInfo: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    sessionsCount: number;
    totalVolume: number;
  };
  sharedExercises: Array<{
    exerciseId: string;
    name: string;
    muscleGroup: string;
    equipment?: string;
  }>;
  exerciseComparison: Array<{
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    myMax: number;
    partnerMax: number;
  }>;
}
