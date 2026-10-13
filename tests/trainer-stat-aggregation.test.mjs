import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { countWeeklyPersonalRecords } = require("../.test-build/trainer-stat-aggregation.js");

test("first weekly log is not a new PR", () => {
  assert.equal(countWeeklyPersonalRecords(new Map([["student-1_exercise-1", 40]]), new Map()), 0);
});

test("equal recent maximum is not a PR", () => {
  assert.equal(
    countWeeklyPersonalRecords(
      new Map([["student-1_exercise-1", 40]]),
      new Map([["student-1_exercise-1", 40]])
    ),
    0
  );
});

test("higher recent maximum counts once per student and exercise", () => {
  const recent = new Map([
    ["student-1_exercise-1", 45],
    ["student-1_exercise-2", 25],
    ["student-2_exercise-1", 50],
  ]);
  const previous = new Map([
    ["student-1_exercise-1", 40],
    ["student-1_exercise-2", 20],
    ["student-2_exercise-1", 50],
  ]);

  assert.equal(countWeeklyPersonalRecords(recent, previous), 2);
});

test("empty recent period returns zero", () => {
  assert.equal(countWeeklyPersonalRecords(new Map(), new Map()), 0);
});
