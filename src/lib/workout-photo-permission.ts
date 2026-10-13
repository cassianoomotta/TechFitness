export interface WorkoutPhotoPermissionInput {
  role: string;
  userId: string;
  studentUserId: string;
  trainerProfileId?: string | null;
  studentTrainerId?: string | null;
}

export function canDeleteWorkoutPhoto(input: WorkoutPhotoPermissionInput): boolean {
  if (input.role === "ADMIN") return true;
  if (input.userId === input.studentUserId) return true;

  return Boolean(
    input.role === "TRAINER" &&
      input.trainerProfileId &&
      input.studentTrainerId &&
      input.trainerProfileId === input.studentTrainerId
  );
}
