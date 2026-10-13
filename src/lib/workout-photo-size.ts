export const MAX_WORKOUT_PHOTO_DATA_URL_CHARS = 12_000_000;
export const MAX_WORKOUT_REQUEST_BYTES = 12_500_000;

export function isWorkoutPhotoWithinLimit(photoDataUrl: string): boolean {
  return photoDataUrl.length <= MAX_WORKOUT_PHOTO_DATA_URL_CHARS;
}
