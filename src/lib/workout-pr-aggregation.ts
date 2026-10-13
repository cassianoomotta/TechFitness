export interface ExerciseWeightMaximum {
  exerciseId: string;
  _max: { weightUsed: number | null };
}

export function mapPreviousExerciseMaxima(
  rows: ExerciseWeightMaximum[]
): Map<string, number> {
  return new Map(
    rows.map((row) => [row.exerciseId, row._max.weightUsed ?? 0])
  );
}
