const MAX_WORKOUT_ATTEMPT_AGE_MS = 24 * 60 * 60 * 1000;

export function shouldResetStaleWorkoutState(
  startedAt: string | null,
  hasSavedState: boolean,
  now: number
): boolean {
  if (!hasSavedState) return false;
  if (!startedAt || startedAt.trim() === "") return true;

  const timestamp = Number(startedAt);
  if (!Number.isFinite(timestamp) || timestamp <= 0 || timestamp > now) return true;

  return now - timestamp > MAX_WORKOUT_ATTEMPT_AGE_MS;
}
