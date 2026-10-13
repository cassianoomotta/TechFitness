export type CompletionLookupOutcome = "saved" | "not-found" | "unknown";

export interface CompletionLookupResult {
  ok: boolean;
  found?: unknown;
}

export function classifyCompletionLookup(result: CompletionLookupResult): CompletionLookupOutcome {
  if (!result.ok) return "unknown";
  if (result.found === true) return "saved";
  if (result.found === false) return "not-found";
  return "unknown";
}
