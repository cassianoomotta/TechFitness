import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { calculateSessionsAdherence, calculateStreak } = require("../.test-build/gamification.js");

function startOfWeek(date, weekOffset = 0) {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  const day = result.getDay();
  result.setDate(result.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7);
  return result;
}

function datesOnWeekdays(monday, weekdays) {
  return weekdays.map((offset) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + offset);
    return date;
  });
}

test("empty history returns zero streak and adherence", () => {
  assert.equal(calculateStreak([], []), 0);
  assert.deepEqual(calculateSessionsAdherence([], 3), {
    perfectWeeks: 0,
    extraSessions: 0,
    baseSessions: 0,
  });
});

test("date-only history preserves consecutive-week streak", () => {
  const lastWeek = startOfWeek(new Date(), -1);
  const dates = datesOnWeekdays(lastWeek, [0, 1, 2]);
  const fullRows = dates.map((date) => ({
    date,
    logs: [{ exerciseId: "exercise-1" }],
  }));

  assert.equal(calculateStreak(dates, []), 1);
  assert.equal(calculateStreak(dates, []), calculateStreak(fullRows, []));
});

test("long date-only history preserves adherence totals", () => {
  const sessions = [];
  const today = new Date();
  for (let week = 0; week < 12; week += 1) {
    const monday = startOfWeek(today, -week);
    const days = week % 2 === 0 ? [0, 1, 2] : [0, 1, 2, 3, 4];
    sessions.push(...datesOnWeekdays(monday, days).map((date) => ({ date })));
    if (week === 4) sessions.push({ date: new Date(sessions[sessions.length - 1].date) });
  }

  const adherence = calculateSessionsAdherence(sessions, 3);
  assert.deepEqual(adherence, {
    perfectWeeks: 12,
    extraSessions: 12,
    baseSessions: 36,
  });
});
