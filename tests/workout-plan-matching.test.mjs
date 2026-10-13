import test from "node:test";
import assert from "node:assert/strict";
import planMatching from "../.test-build/workout-plan-matching.js";

const { resolveWorkoutPlanId } = planMatching;

const plans = [
  { id: "active-a", exerciseIds: ["squat", "press"], isArchived: false, deletionStatus: "ACTIVE" },
  { id: "active-b", exerciseIds: ["squat", "row"], isArchived: false, deletionStatus: "ACTIVE" },
  { id: "archived", exerciseIds: ["squat", "press", "row"], isArchived: true, deletionStatus: "ARCHIVED" },
];

test("uses the exact plan id even when another plan shares more exercises", () => {
  assert.equal(
    resolveWorkoutPlanId({ sessionPlanId: "active-a", sessionExerciseIds: ["squat", "row"], plans }),
    "active-a",
  );
});

test("does not mark an archived plan complete", () => {
  assert.equal(
    resolveWorkoutPlanId({ sessionPlanId: "archived", sessionExerciseIds: ["squat", "press", "row"], plans }),
    null,
  );
});

test("uses the overlap heuristic only for legacy sessions without a plan id", () => {
  assert.equal(
    resolveWorkoutPlanId({ sessionPlanId: null, sessionExerciseIds: ["squat", "row"], plans }),
    "active-b",
  );
});

test("does not guess when a legacy session has too few matching exercises", () => {
  assert.equal(
    resolveWorkoutPlanId({ sessionPlanId: null, sessionExerciseIds: ["unknown"], plans }),
    null,
  );
});
