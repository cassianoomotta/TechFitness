/** Conta PRs semanais apenas quando já existe uma carga anterior positiva. */
export function countWeeklyPersonalRecords(
  recentMaxes: ReadonlyMap<string, number>,
  previousMaxes: ReadonlyMap<string, number>
): number {
  let weeklyPRs = 0;

  for (const [key, recentMax] of recentMaxes) {
    const previousMax = previousMaxes.get(key) ?? 0;
    if (recentMax > previousMax && previousMax > 0) {
      weeklyPRs += 1;
    }
  }

  return weeklyPRs;
}
