export type TrainerDashboardPeriod = "7d" | "30d" | "90d";
export type TrainerRelationshipPeriod = "6m" | "12m";

export interface TrainerDashboardSummary {
  linkedStudents: number;
  completedSessions: number;
  studentsWithoutSessions: number;
  activePlans: number;
  weeklyPersonalRecords: number;
}

export interface TrainerSessionBucket {
  bucket: string;
  completedSessions: number;
}

export interface TrainerPersonalRecordBucket {
  bucket: string;
  personalRecords: number;
}

export interface TrainerRelationshipBucket {
  bucket: string;
  linked: number;
  unlinked: number;
}

export interface TrainerDashboardPlan {
  id: string;
  name: string;
  createdAt: string;
  ageDays: number;
}

export interface TrainerRosterActivity {
  studentId: string;
  name: string;
  image: string | null;
  lastSessionAt: string | null;
  sessionsInPeriod: number;
  activePlanCount: number;
  activePlans: TrainerDashboardPlan[];
}

export interface TrainerDashboardOverview {
  period: TrainerDashboardPeriod;
  relationshipPeriod: TrainerRelationshipPeriod;
  generatedAt: string;
  summary: TrainerDashboardSummary;
  sessionSeries: TrainerSessionBucket[];
  prSeries: TrainerPersonalRecordBucket[];
  relationshipSeries: TrainerRelationshipBucket[];
  rosterActivity: TrainerRosterActivity[];
}
