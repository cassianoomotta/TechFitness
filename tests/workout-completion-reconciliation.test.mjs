import test from "node:test";
import assert from "node:assert/strict";
import completionReconciliation from "../.test-build/workout-completion-reconciliation.js";

const { classifyCompletionLookup } = completionReconciliation;

test("only an authoritative found response confirms a saved completion", () => {
  assert.equal(classifyCompletionLookup({ ok: true, found: true }), "saved");
});

test("only an authoritative not-found response permits workout continuation", () => {
  assert.equal(classifyCompletionLookup({ ok: true, found: false }), "not-found");
});

test("HTTP errors, missing fields, and invalid response values remain unknown", () => {
  assert.equal(classifyCompletionLookup({ ok: false, found: false }), "unknown");
  assert.equal(classifyCompletionLookup({ ok: true }), "unknown");
  assert.equal(classifyCompletionLookup({ ok: true, found: "false" }), "unknown");
});
