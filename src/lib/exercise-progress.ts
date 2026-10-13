export type ExerciseProgressMetric = "best_set_volume" | "best_set_reps";

export interface ExerciseProgressPoint {
  sessionId: string;
  date: string;
  value: number;
  weightKg: number;
  reps: number;
}

export interface ExerciseProgressSeries {
  exerciseId: string;
  metric: ExerciseProgressMetric;
  points: ExerciseProgressPoint[];
}

export interface ExerciseProgressResponse {
  exercises: ExerciseProgressSeries[];
}
