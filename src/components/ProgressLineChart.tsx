const CHART_WIDTH = 360;
const CHART_HEIGHT = 170;
const CHART_PADDING = { top: 16, right: 12, bottom: 28, left: 46 };

function formatPointDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatValue(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export interface ProgressLinePoint {
  sessionId: string;
  date: string;
  value: number;
  detail: string;
}

interface ProgressLineChartProps {
  points: ProgressLinePoint[];
  label: string;
  unit: string;
}

export default function ProgressLineChart({ points, label, unit }: ProgressLineChartProps) {
  const values = points.map((point) => point.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const valueRange = maximum - minimum || Math.max(maximum * 0.1, 1);
  const innerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const lowerBound = Math.max(0, minimum - valueRange * 0.2);
  const upperBound = maximum + valueRange * 0.2;
  const displayRange = upperBound - lowerBound || 1;

  const coordinates = points.map((point, index) => {
    const x = points.length === 1
      ? CHART_PADDING.left + innerWidth / 2
      : CHART_PADDING.left + (index / (points.length - 1)) * innerWidth;
    const y = CHART_PADDING.top + ((upperBound - point.value) / displayRange) * innerHeight;
    return { point, x, y };
  });

  const linePath = coordinates
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const gridValues = [upperBound, (upperBound + lowerBound) / 2, lowerBound];

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-medium">{unit}</span>
      </div>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={`${label} · histórico de sessões`}
      >
        {gridValues.map((value, index) => {
          const y = CHART_PADDING.top + (index / 2) * innerHeight;
          return (
            <g key={index}>
              <line
                x1={CHART_PADDING.left}
                y1={y}
                x2={CHART_WIDTH - CHART_PADDING.right}
                y2={y}
                stroke="currentColor"
                strokeDasharray="3 4"
                className="text-slate-200 dark:text-slate-700"
              />
              <text
                x={CHART_PADDING.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400 text-[9px] dark:fill-slate-500"
              >
                {formatValue(value)}
              </text>
            </g>
          );
        })}
        <path
          d={linePath}
          fill="none"
          stroke="#2563EB"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coordinates.map(({ point, x, y }) => (
          <g key={point.sessionId}>
            <title>
              {formatPointDate(point.date)} · {point.detail}
            </title>
            <circle cx={x} cy={y} r="8" fill="#2563EB" fillOpacity="0.14" />
            <circle cx={x} cy={y} r="4.5" fill="#2563EB" stroke="white" strokeWidth="2" />
            <text
              x={x}
              y={CHART_HEIGHT - 8}
              textAnchor="middle"
              className="fill-slate-500 text-[9px] dark:fill-slate-400"
            >
              {formatPointDate(point.date)}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
        {points.map((point) => (
          <span
            key={point.sessionId}
            className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {formatPointDate(point.date)}: {point.detail}
          </span>
        ))}
      </div>
    </div>
  );
}
