import test from "node:test";
import assert from "node:assert/strict";

let measurementTools;
try {
  measurementTools = await import("../scripts/measure-student-dashboard.mjs");
} catch {
  measurementTools = null;
}

test("summarizes request durations with count, median, minimum, and maximum", () => {
  assert.equal(typeof measurementTools?.summarizeDurations, "function");
  assert.deepEqual(measurementTools.summarizeDurations([90, 10, 40, 70]), {
    count: 4,
    medianMs: 55,
    minMs: 10,
    maxMs: 90,
  });
});

test("removes query strings and identifiers from recorded routes", () => {
  assert.equal(typeof measurementTools?.safeRouteLabel, "function");
  assert.equal(
    measurementTools.safeRouteLabel("https://example.test/api/student/workout-sessions/abc123/photo?email=private@example.test"),
    "/api/student/workout-sessions/:id/photo"
  );
});

test("redacts emails and URLs from local diagnostics", () => {
  assert.equal(typeof measurementTools?.safeDiagnosticMessage, "function");
  assert.equal(
    measurementTools.safeDiagnosticMessage("Falha para aluno@exemplo.com em https://example.test/api?token=private"),
    "Falha para [email] em [url]"
  );
});

test("reports cold and warm readiness medians separately", () => {
  assert.equal(typeof measurementTools?.buildReport, "function");
  const report = measurementTools.buildReport("student-home", [
    { kind: "fria", contentReadyMs: 1200, rankingReadyMs: 600, photoFeedReadyMs: 1200, requests: [] },
    { kind: "fria", contentReadyMs: 1000, rankingReadyMs: 500, photoFeedReadyMs: 1000, requests: [] },
    { kind: "aquecida", contentReadyMs: 300, rankingReadyMs: 100, photoFeedReadyMs: 300, requests: [] },
    { kind: "aquecida", contentReadyMs: 200, rankingReadyMs: 80, photoFeedReadyMs: 200, requests: [] },
  ]);

  assert.match(report, /execução fria: mediana 1100 ms/);
  assert.match(report, /execução aquecida: mediana 250 ms/);
  assert.match(report, /Classificação em execução fria: mediana 550 ms; aquecida: 90 ms/);
  assert.match(report, /Mural de fotos em execução fria: mediana 1100 ms; aquecida: 250 ms/);
});
