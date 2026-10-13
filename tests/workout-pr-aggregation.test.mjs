import test from "node:test";
import assert from "node:assert/strict";
import prAggregation from "../.test-build/workout-pr-aggregation.js";

const { mapPreviousExerciseMaxima } = prAggregation;

test("maps each grouped exercise to its previous maximum weight", () => {
  const maxima = mapPreviousExerciseMaxima([
    { exerciseId: "squat", _max: { weightUsed: 125 } },
    { exerciseId: "row", _max: { weightUsed: 60 } },
  ]);

  assert.equal(maxima.get("squat"), 125);
  assert.equal(maxima.get("row"), 60);
  assert.equal(maxima.size, 2);
});

test("treats a missing aggregate value as no previous weight", () => {
  const maxima = mapPreviousExerciseMaxima([
    { exerciseId: "press", _max: { weightUsed: null } },
  ]);

  assert.equal(maxima.get("press"), 0);
});
