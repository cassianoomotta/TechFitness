import test from "node:test";
import assert from "node:assert/strict";
import workoutSessionLifecycle from "../.test-build/workout-session-lifecycle.js";

const { shouldResetStaleWorkoutState } = workoutSessionLifecycle;
const DAY_MS = 24 * 60 * 60 * 1000;

test("resets persisted workout state when its timer is older than one day", () => {
  const now = Date.now();

  assert.equal(
    shouldResetStaleWorkoutState(String(now - DAY_MS - 1), true, now),
    true
  );
});

test("keeps a recent workout that has saved progress", () => {
  const now = Date.now();

  assert.equal(
    shouldResetStaleWorkoutState(String(now - 60_000), true, now),
    false
  );
});

test("resets orphaned saved progress when its start timestamp is missing or invalid", () => {
  const now = Date.now();

  assert.equal(shouldResetStaleWorkoutState(null, true, now), true);
  assert.equal(shouldResetStaleWorkoutState("invalid", true, now), true);
});

test("keeps a new workout with no prior saved state", () => {
  assert.equal(shouldResetStaleWorkoutState(null, false, Date.now()), false);
});
