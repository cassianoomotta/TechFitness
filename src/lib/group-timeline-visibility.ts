export interface TimelineGroup {
  id: string;
  name: string;
  icon: string;
}

export interface TimelineGroupMembership extends TimelineGroup {
  joinedAt: Date | string;
}

function readTargetGroupIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function filterVisibleTimelineGroups(
  groups: readonly TimelineGroupMembership[],
  sessionDate: Date | string,
  targetGroupIds: unknown
): TimelineGroup[] {
  const workoutTime = new Date(sessionDate).getTime();
  const targetIds = readTargetGroupIds(targetGroupIds);
  const includesAllGroups = targetIds.length === 0 || targetIds.includes("ALL");

  return groups
    .filter((group) => {
      const joinedAt = new Date(group.joinedAt).getTime();
      if (workoutTime < joinedAt) return false;
      return includesAllGroups || targetIds.includes(group.id);
    })
    .map(({ id, name, icon }) => ({ id, name, icon }));
}
