import test from "node:test";
import assert from "node:assert/strict";
import photoPermission from "../.test-build/workout-photo-permission.js";

const { canDeleteWorkoutPhoto } = photoPermission;

test("the student can delete their own workout photo", () => {
  assert.equal(
    canDeleteWorkoutPhoto({ role: "STUDENT", userId: "student-1", studentUserId: "student-1" }),
    true,
  );
});

test("only the trainer linked to the student can delete the photo", () => {
  assert.equal(
    canDeleteWorkoutPhoto({ role: "TRAINER", userId: "trainer-1", trainerProfileId: "profile-1", studentUserId: "student-1", studentTrainerId: "profile-1" }),
    true,
  );
  assert.equal(
    canDeleteWorkoutPhoto({ role: "TRAINER", userId: "trainer-2", trainerProfileId: "profile-2", studentUserId: "student-1", studentTrainerId: "profile-1" }),
    false,
  );
});

test("admins can delete a photo and matching names do not grant access", () => {
  assert.equal(
    canDeleteWorkoutPhoto({ role: "ADMIN", userId: "admin-1", studentUserId: "student-1" }),
    true,
  );
  assert.equal(
    canDeleteWorkoutPhoto({ role: "TRAINER", userId: "other", studentUserId: "student-1", studentName: "Ana Paula", actorName: "Ana" }),
    false,
  );
});
