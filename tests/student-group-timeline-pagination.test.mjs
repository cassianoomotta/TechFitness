import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { splitCursorPage, mergeTimelinePage } = require("../.test-build/group-timeline-pagination.js");

test("timeline paginates without losing the cursor for the next page", () => {
  const rows = Array.from({ length: 4 }, (_value, index) => ({
    id: `post-${index + 1}`,
  }));

  assert.deepEqual(splitCursorPage(rows, 3), {
    items: rows.slice(0, 3),
    hasMore: true,
    nextCursor: "post-3",
  });
});

test("timeline marks the last page without inventing a cursor", () => {
  const rows = [{ id: "post-1" }, { id: "post-2" }];

  assert.deepEqual(splitCursorPage(rows, 3), {
    items: rows,
    hasMore: false,
    nextCursor: null,
  });
});

test("timeline appends older pages without duplicating posts", () => {
  const current = [{ id: "newer" }, { id: "shared" }];
  const next = [{ id: "shared" }, { id: "older" }];

  assert.deepEqual(mergeTimelinePage(current, next), [
    { id: "newer" },
    { id: "shared" },
    { id: "older" },
  ]);
});
