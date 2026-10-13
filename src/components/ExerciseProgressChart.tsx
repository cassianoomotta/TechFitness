"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Loader2, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ExerciseProgressResponse, ExerciseProgressSeries } from "@/lib/exercise-progress";

export interface ExerciseProgressOption {
  id: string;
  name: string;
}

interface ExerciseProgressChartProps {
  isOpen: boolean;
  exercises: ExerciseProgressOption[];
}

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

function ExerciseProgressLineChart({
  series,
}: {
  series: ExerciseProgressSeries;
}) {
  const values = series.points.map((point) => point.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const valueRange = maximum - minimum || Math.max(maximum * 0.1, 1);
  const innerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const lowerBound = Math.max(0, minimum - valueRange * 0.2);
  const upperBound = maximum + valueRange * 0.2;
  const displayRange = upperBound - lowerBound || 1;

  const coordinates = series.points.map((point, index) => {
    const x = series.points.length === 1
      ? CHART_PADDING.left + innerWidth / 2
      : CHART_PADDING.left + (index / (series.points.length - 1)) * innerWidth;
    const y = CHART_PADDING.top + ((upperBound - point.value) / displayRange) * innerHeight;
    return { point, x, y };
  });

  const linePath = coordinates
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const gridValues = [upperBound, (upperBound + lowerBound) / 2, lowerBound];
  const unitLabel = series.metric === "best_set_volume" ? "kg × reps" : "reps";

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-[10px] text-slate-500 dark:text-slate-400">
        <span>{series.metric === "best_set_volume" ? "Volume da melhor série" : "Repetições na melhor série"}</span>
        <span className="font-medium">{unitLabel}</span>
      </div>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={`Gráfico de evolução das últimas ${series.points.length} sessões do exercício`}
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
              {`${formatPointDate(point.date)}: ${point.weightKg > 0 ? `${formatValue(point.weightKg)} kg × ` : ""}${point.reps} repetições`}
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
        {series.points.map((point) => (
          <span
            key={point.sessionId}
            className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {formatPointDate(point.date)}: {point.weightKg > 0 ? `${formatValue(point.weightKg)} kg × ` : ""}{point.reps} reps
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ExerciseProgressChart({
  isOpen,
  exercises,
}: ExerciseProgressChartProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0]?.id ?? "");
  const [result, setResult] = useState<{
    key: string;
    exercises: ExerciseProgressSeries[];
  } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const requestKey = exercises.map((exercise) => exercise.id).join(",");

  useEffect(() => {
    if (!isOpen || exercises.length === 0) return;

    const controller = new AbortController();
    const query = new URLSearchParams();
    exercises.forEach((exercise) => query.append("exerciseId", exercise.id));

    fetch(`/api/student/exercise-progress?${query.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Falha ao carregar evolução do exercício.");
        return response.json() as Promise<ExerciseProgressResponse>;
      })
      .then((data) => {
        setResult({ key: requestKey, exercises: data.exercises });
      })
      .catch(() => {
        if (!controller.signal.aborted) setErrorKey(requestKey);
      });

    return () => controller.abort();
  }, [isOpen, exercises, requestKey]);

  const series = result?.key === requestKey ? result.exercises : [];
  const loading = isOpen && exercises.length > 0 && result?.key !== requestKey && errorKey !== requestKey;
  const error = errorKey === requestKey;
  const selectedExercise = exercises.find((exercise) => exercise.id === selectedExerciseId)
    ?? exercises[0];
  const selectedSeries = series.find((item) => item.exerciseId === selectedExercise?.id);
  const trend = useMemo(() => {
    if (!selectedSeries || selectedSeries.points.length < 3) return null;

    const firstPoint = selectedSeries.points[0];
    const lastPoint = selectedSeries.points[selectedSeries.points.length - 1];
    if (firstPoint.value <= 0) return null;

    const changePercent = ((lastPoint.value - firstPoint.value) / firstPoint.value) * 100;
    if (changePercent >= 5) return { label: "Evoluindo no histórico", icon: TrendingUp, positive: true, changePercent };
    if (changePercent <= -5) return { label: "Variação para baixo", icon: TrendingDown, positive: false, changePercent };
    return { label: "Estável no histórico", icon: Minus, positive: null, changePercent };
  }, [selectedSeries]);

  if (exercises.length === 0) return null;

  const TrendIcon = trend?.icon;

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-900/40 dark:bg-[#151D2F]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Evolução dos exercícios</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Melhor série em cada sessão</p>
          </div>
        </div>
        {selectedExercise && exercises.length > 1 && (
          <select
            aria-label="Escolher exercício para ver a evolução"
            value={selectedExercise.id}
            onChange={(event) => setSelectedExerciseId(event.target.value)}
            className="min-h-[44px] max-w-[48%] rounded-lg border border-slate-200 bg-slate-50 px-2 text-base text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 md:text-sm"
          >
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="mt-4 flex min-h-36 flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
          <span className="text-xs">Carregando histórico do exercício...</span>
        </div>
      ) : error ? (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Não foi possível carregar o gráfico agora. O treino foi salvo normalmente.
        </p>
      ) : selectedSeries && selectedSeries.points.length >= 2 ? (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-bold text-slate-800 dark:text-slate-100">
              {selectedExercise?.name}
            </p>
            {trend && TrendIcon && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                trend.positive === true
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : trend.positive === false
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}>
                <TrendIcon className="h-3.5 w-3.5" />
                {trend.label} · {trend.changePercent > 0 ? "+" : ""}{trend.changePercent.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
              </span>
            )}
          </div>
          <ExerciseProgressLineChart series={selectedSeries} />
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
            {selectedSeries.metric === "best_set_volume"
              ? "O gráfico compara o volume da melhor série, não a última série do treino. Cada ponto informa a carga e as repetições registradas."
              : "O gráfico compara as repetições da melhor série em exercícios sem carga externa registrada."}
          </p>
        </>
      ) : (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/60">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Ainda falta histórico para comparar</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {selectedSeries?.points.length === 1
              ? "Este é o primeiro registro comparável. Ao repetir o exercício, o gráfico mostrará a evolução da melhor série."
              : "Registre carga e repetições nas séries para acompanhar este exercício."}
          </p>
        </div>
      )}
    </section>
  );
}
