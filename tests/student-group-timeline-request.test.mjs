import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { fetchGroupTimelinePage } = require("../.test-build/group-timeline-request.js");

test("timeline request aborts when the response exceeds its deadline", async () => {
  let wasAborted = false;
  const fetcher = (_input, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener("abort", () => {
      wasAborted = true;
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });

  await assert.rejects(
    fetchGroupTimelinePage("/api/student/groups/timeline", fetcher, 5),
    { code: "TIMEOUT" },
  );
  assert.equal(wasAborted, true);
});

test("timeline request treats non-success responses as failures", async () => {
  const fetcher = async () => new Response(null, { status: 503 });

  await assert.rejects(
    fetchGroupTimelinePage("/api/student/groups/timeline", fetcher, 50),
    { code: "HTTP_ERROR", status: 503 },
  );
});

test("timeline request returns a successful response", async () => {
  const expected = Response.json({ timeline: [] });
  const fetcher = async () => expected;
  const result = await fetchGroupTimelinePage("/api/student/groups/timeline", fetcher, 50);

  assert.equal(result.response, expected);
  assert.deepEqual(result.data, { timeline: [] });
});

test("timeline request keeps its deadline active while reading the response body", async () => {
  let wasAborted = false;
  const fetcher = async (_input, init) => {
    const body = new ReadableStream({
      start(controller) {
        init.signal.addEventListener("abort", () => {
          wasAborted = true;
          controller.error(new DOMException("Aborted", "AbortError"));
        }, { once: true });
      },
    });
    return new Response(body);
  };

  await assert.rejects(
    fetchGroupTimelinePage("/api/student/groups/timeline", fetcher, 5),
    { code: "TIMEOUT" },
  );
  assert.equal(wasAborted, true);
});
