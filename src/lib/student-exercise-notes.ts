export const STUDENT_EXERCISE_NOTE_MAX_LENGTH = 1000;

export function normalizeStudentExerciseNote(note: string): string | null {
  const normalizedNote = note.trim();

  if (normalizedNote.length > STUDENT_EXERCISE_NOTE_MAX_LENGTH) {
    throw new Error(`A observação deve ter no máximo ${STUDENT_EXERCISE_NOTE_MAX_LENGTH} caracteres.`);
  }

  return normalizedNote.length > 0 ? normalizedNote : null;
}
