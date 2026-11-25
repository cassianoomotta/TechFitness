import type { WorkoutProgressPoint } from "@/lib/exercise-progress";

const dateLabel = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const volumeLabel = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export default function WorkoutHistoryChart({ points }: { points: WorkoutProgressPoint[] }) {
  if (!points.length) return <p className="mt-4 text-xs text-slate-500">Ainda não há sessões concluídas desta ficha.</p>;
  const max = Math.max(1, ...points.map((point) => point.reps));
  return (
    <figure className="mt-4">
      <figcaption className="mb-3 text-xs font-semibold text-slate-700 dark:text-slate-200">Repetições totais por sessão</figcaption>
      <ol className="space-y-3">
        {points.map((point: WorkoutProgressPoint) => (
          <li key={point.sessionId} className="grid grid-cols-[3rem_1fr] items-center gap-2">
            <time dateTime={point.date} className="text-xs tabular-nums text-slate-500">{dateLabel.format(new Date(point.date))}</time>
            <div>
              <span className="text-xs font-bold tabular-nums">{point.reps} reps</span>
              {point.volume > 0 && <span className="ml-2 text-[10px] text-slate-500">Volume com carga · {volumeLabel.format(point.volume)} kg × reps</span>}
              <svg aria-hidden="true" viewBox="0 0 100 4" preserveAspectRatio="none" className="mt-1 h-2 w-full overflow-hidden rounded-full bg-blue-50 dark:bg-slate-800">
                <rect width={100 * point.reps / max} height="4" className="fill-blue-600 dark:fill-blue-400" />
              </svg>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
