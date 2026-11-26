"use client";

import { useEffect, useState } from "react";
import { Activity, Loader2, Minus, TrendingDown, TrendingUp } from "lucide-react";
import ProgressLineChart, { type ProgressLinePoint } from "./ProgressLineChart";
import type { ExerciseProgressPoint, ExerciseProgressResponse, WorkoutProgressPoint } from "@/lib/exercise-progress";

export interface ExerciseProgressOption {
  id: string;
  name: string;
}

interface ExerciseProgressChartProps {
  planId: string;
  isOpen: boolean;
  exercises: ExerciseProgressOption[];
}

const numberFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function workoutPoint(point: WorkoutProgressPoint): ProgressLinePoint {
  const volume = point.volume > 0 ? ` · ${numberFormat.format(point.volume)} kg × reps` : "";
  return { ...point, value: point.reps, detail: `${point.reps} reps${volume}` };
}

function exercisePoint(point: ExerciseProgressPoint): ProgressLinePoint {
  const weight = point.weightKg > 0 ? `${numberFormat.format(point.weightKg)} kg × ` : "";
  return { ...point, detail: `${weight}${point.reps} reps` };
}

function getTrend(points: ProgressLinePoint[]) {
  if (points.length < 3) return null;

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  if (firstPoint.value <= 0) return null;

  const changePercent = ((lastPoint.value - firstPoint.value) / firstPoint.value) * 100;
  if (changePercent >= 5) return { label: "Evoluindo no histórico", icon: TrendingUp, positive: true, changePercent };
  if (changePercent <= -5) return { label: "Variação para baixo", icon: TrendingDown, positive: false, changePercent };
  return { label: "Estável no histórico", icon: Minus, positive: null, changePercent };
}

export default function ExerciseProgressChart({
  isOpen,
  planId,
  exercises,
}: ExerciseProgressChartProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [result, setResult] = useState<{
    key: string;
    data: ExerciseProgressResponse;
  } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const general = selectedExerciseId === "";
  const requestKey = new URLSearchParams(general ? { planId } : { exerciseId: selectedExerciseId }).toString();

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setErrorKey(null);
    fetch(`/api/student/exercise-progress?${requestKey}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Falha ao carregar evolução do exercício.");
        return response.json() as Promise<ExerciseProgressResponse>;
      })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setErrorKey(requestKey);
      });

    return () => controller.abort();
  }, [isOpen, requestKey]);

  const series = result?.key === requestKey ? result.data.exercises : [];
  const loading = isOpen && result?.key !== requestKey && errorKey !== requestKey;
  const error = errorKey === requestKey;
  const selectedExercise = exercises.find((exercise) => exercise.id === selectedExerciseId);
  const selectedSeries = series.find((item) => item.exerciseId === selectedExercise?.id);
  const points = general
    ? (result?.key === requestKey ? result.data.workout ?? [] : []).map(workoutPoint)
    : (selectedSeries?.points ?? []).map(exercisePoint);
  const weighted = !general && selectedSeries?.metric === "best_set_volume";
  const metricLabel = general ? "Repetições totais por sessão" : weighted ? "Volume da melhor série" : "Repetições na melhor série";
  const trend = getTrend(points);
  const TrendIcon = trend?.icon;

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-blue-900/40 dark:bg-[#151D2F]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Evolução do treino</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{general ? "Todas as séries da mesma ficha" : "Melhor série em cada sessão"}</p>
          </div>
        </div>
        {exercises.length > 0 && (
          <select
            aria-label="Escolher gráfico de evolução"
            value={selectedExerciseId}
            onChange={(event) => setSelectedExerciseId(event.target.value)}
            className="min-h-[44px] max-w-[48%] rounded-lg border border-slate-200 bg-slate-50 px-2 text-base text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 md:text-sm"
          >
            <option value="">Treino completo</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="mt-4 flex min-h-36 flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
          <span className="text-xs">Carregando histórico…</span>
        </div>
      ) : error ? (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Não foi possível carregar o gráfico agora. O treino foi salvo normalmente.
        </p>
      ) : points.length >= (general ? 1 : 2) ? (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-bold text-slate-800 dark:text-slate-100">
              {general ? "Treino completo" : selectedExercise?.name}
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
          <ProgressLineChart points={points} label={metricLabel} unit={weighted ? "kg × reps" : "reps"} />
          <p className="mt-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
            {general ? "Cada ponto soma as repetições de todas as séries da ficha em uma sessão." : weighted
              ? "O gráfico compara o volume da melhor série, não a última série do treino. Cada ponto informa a carga e as repetições registradas."
              : "O gráfico compara as repetições da melhor série em exercícios sem carga externa registrada."}
          </p>
        </>
      ) : (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/60">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Ainda falta histórico para comparar</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {general ? "Ainda não há sessões concluídas desta ficha." : selectedSeries?.points.length === 1
              ? "Este é o primeiro registro comparável. Ao repetir o exercício, o gráfico mostrará a evolução da melhor série."
              : "Registre carga e repetições nas séries para acompanhar este exercício."}
          </p>
        </div>
      )}
    </section>
  );
}
