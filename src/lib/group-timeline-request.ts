export type GroupTimelineRequestFailureCode = "TIMEOUT" | "HTTP_ERROR" | "NETWORK_ERROR";

export class GroupTimelineRequestError extends Error {
  constructor(
    readonly code: GroupTimelineRequestFailureCode,
    readonly status?: number,
  ) {
    super(code === "TIMEOUT" ? "A busca do mural excedeu o tempo limite." : "Não foi possível carregar o mural.");
    this.name = "GroupTimelineRequestError";
  }
}

export async function fetchGroupTimelinePage(
  input: RequestInfo | URL,
  fetcher: typeof fetch = fetch,
  timeoutMs = 10_000,
): Promise<{ response: Response; data: unknown }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(input, { signal: controller.signal });
    if (!response.ok) {
      throw new GroupTimelineRequestError("HTTP_ERROR", response.status);
    }
    const data: unknown = await response.json();
    return { response, data };
  } catch (error) {
    if (error instanceof GroupTimelineRequestError) throw error;
    if (controller.signal.aborted) {
      throw new GroupTimelineRequestError("TIMEOUT");
    }
    throw new GroupTimelineRequestError("NETWORK_ERROR");
  } finally {
    clearTimeout(timeoutId);
  }
}
