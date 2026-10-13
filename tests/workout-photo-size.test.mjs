import test from "node:test";
import assert from "node:assert/strict";
import photoSize from "../.test-build/workout-photo-size.js";

const { isWorkoutPhotoWithinLimit, MAX_WORKOUT_PHOTO_DATA_URL_CHARS } = photoSize;

test("accepts photo data at or below the configured limit", () => {
  assert.equal(isWorkoutPhotoWithinLimit("x".repeat(MAX_WORKOUT_PHOTO_DATA_URL_CHARS)), true);
  assert.equal(isWorkoutPhotoWithinLimit("x".repeat(MAX_WORKOUT_PHOTO_DATA_URL_CHARS - 1)), true);
});

test("rejects photo data above the configured limit", () => {
  assert.equal(isWorkoutPhotoWithinLimit("x".repeat(MAX_WORKOUT_PHOTO_DATA_URL_CHARS + 1)), false);
});
