import test from "node:test";
import assert from "node:assert/strict";
import studentExerciseNotes from "../.test-build/student-exercise-notes.js";

const { normalizeStudentExerciseNote } = studentExerciseNotes;

test("trims personal exercise notes and maps blank content to deletion", () => {
  assert.equal(normalizeStudentExerciseNote("  Manter o cotovelo alinhado.  "), "Manter o cotovelo alinhado.");
  assert.equal(normalizeStudentExerciseNote("  \n "), null);
});

test("rejects notes longer than the supported limit", () => {
  assert.throws(() => normalizeStudentExerciseNote("a".repeat(1001)), /1000 caracteres/);
});
