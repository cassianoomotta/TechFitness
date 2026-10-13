import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildWeeklyPhotoFeed, collectUniquePhotoFeedStudentIds } = require("../.test-build/student-photo-feed.js");

test("photo feed formats date, duration, and satisfaction", () => {
  const now = new Date("2026-10-13T15:00:00.000Z");
  const [item] = buildWeeklyPhotoFeed(
    [{
      id: "session-1",
      date: new Date("2026-10-12T15:00:00.000Z"),
      photoUrl: "https://example.test/photo.jpg",
      durationMs: 3_600_000,
      satisfaction: 5,
    }],
    now
  );

  assert.equal(item.id, "session-1");
  assert.equal(item.dayOfWeek, "SEG");
  assert.equal(item.dayOfWeekFull, "Segunda-feira");
  assert.equal(item.formattedDate, "12/10");
  assert.equal(item.durationMinutes, 60);
  assert.equal(item.satisfaction, 5);
});

test("photo feed excludes sessions without a photo", () => {
  const result = buildWeeklyPhotoFeed(
    [{
      id: "session-no-photo",
      date: new Date("2026-10-12T15:00:00.000Z"),
      photoUrl: null,
      durationMs: null,
      satisfaction: null,
    }],
    new Date("2026-10-13T15:00:00.000Z")
  );

  assert.deepEqual(result, []);
});

test("photo feed deduplicates students shared across groups", () => {
  const studentIds = collectUniquePhotoFeedStudentIds("student-me", [
    { group: { members: [{ studentId: "student-me" }, { studentId: "student-1" }] } },
    { group: { members: [{ studentId: "student-1" }, { studentId: "student-2" }] } },
  ]);

  assert.deepEqual(studentIds, ["student-me", "student-1", "student-2"]);
});
