import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { filterVisibleTimelineGroups } = require("../.test-build/group-timeline-visibility.js");

const groups = [
  { id: "group-1", name: "Grupo 1", icon: "🏋️", joinedAt: new Date("2026-10-10T00:00:00.000Z") },
  { id: "group-2", name: "Grupo 2", icon: "💪", joinedAt: new Date("2026-10-01T00:00:00.000Z") },
];

test("timeline hides a group joined after workout date", () => {
  assert.deepEqual(
    filterVisibleTimelineGroups(groups, new Date("2026-10-05T00:00:00.000Z"), []),
    [{ id: "group-2", name: "Grupo 2", icon: "💪" }]
  );
});

test("timeline respects selected target groups", () => {
  assert.deepEqual(
    filterVisibleTimelineGroups(groups, new Date("2026-10-12T00:00:00.000Z"), ["group-1"]),
    [{ id: "group-1", name: "Grupo 1", icon: "🏋️" }]
  );
});

test("empty target list includes all common groups", () => {
  assert.deepEqual(
    filterVisibleTimelineGroups(groups, new Date("2026-10-12T00:00:00.000Z"), []),
    groups.map(({ id, name, icon }) => ({ id, name, icon }))
  );
});
