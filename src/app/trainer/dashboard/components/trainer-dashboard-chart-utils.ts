export interface ChartPoint {
  x: number;
  y: number;
  value: number;
}

export function createChartPoints(values: number[], width: number, height: number, padding = 12): ChartPoint[] {
  if (values.length === 0) return [];
  const max = Math.max(...values, 1);
  const innerWidth = Math.max(0, width - padding * 2);
  const innerHeight = Math.max(0, height - padding * 2);
  return values.map((value, index) => ({
    x: values.length === 1 ? width / 2 : padding + (index / (values.length - 1)) * innerWidth,
    y: height - padding - (value / max) * innerHeight,
    value,
  }));
}

export function createPath(points: ChartPoint[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function formatBucketLabel(bucket: string, monthly = false): string {
  const date = monthly ? new Date(`${bucket}-01T00:00:00Z`) : new Date(`${bucket}T00:00:00Z`);
  return date.toLocaleDateString("pt-BR", monthly
    ? { month: "short", timeZone: "UTC" }
    : { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}
