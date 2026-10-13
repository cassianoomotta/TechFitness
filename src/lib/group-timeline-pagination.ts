export interface CursorPage<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

export function splitCursorPage<T extends { id: string }>(
  rows: readonly T[],
  limit: number,
): CursorPage<T> {
  const items = rows.slice(0, limit);
  const hasMore = rows.length > limit;

  return {
    items,
    hasMore,
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
  };
}

export function mergeTimelinePage<T extends { id: string }>(
  current: readonly T[],
  next: readonly T[],
): T[] {
  const itemsById = new Map<string, T>();
  for (const item of current) itemsById.set(item.id, item);
  for (const item of next) itemsById.set(item.id, item);
  return Array.from(itemsById.values());
}
