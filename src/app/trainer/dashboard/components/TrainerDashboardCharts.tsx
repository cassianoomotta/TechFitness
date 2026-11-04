"use client";

import { useMemo, type ReactNode } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import {
  TrainerDashboardOverview,
  TrainerDashboardPeriod,
  TrainerRelationshipPeriod,
} from "@/lib/trainer-dashboard";
import { createChartPoints, createPath, formatBucketLabel } from "./trainer-dashboard-chart-utils";

interface TrainerDashboardChartsProps {
  overview: TrainerDashboardOverview;
  period: TrainerDashboardPeriod;
  relationshipPeriod: TrainerRelationshipPeriod;
  onPeriodChange: (period: TrainerDashboardPeriod) => void;
  onRelationshipPeriodChange: (period: TrainerRelationshipPeriod) => void;
  onStudentSelect: (studentId: string) => void;
}

const periodOptions: Array<{ value: TrainerDashboardPeriod; label: string }> = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
];

const relationshipOptions: Array<{ value: TrainerRelationshipPeriod; label: string }> = [
  { value: "6m", label: "6 meses" },
  { value: "12m", label: "12 meses" },
];

function ChartCard({ title, description, children, className = "" }: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#151D2F]/85 sm:p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {children}
    </article>
  );
}

function SelectControl({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative inline-flex min-h-[44px] items-center">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[44px] appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs font-semibold text-slate-700 shadow-sm outline-none transition hover:border-[#2563EB]/40 focus:border-[#2563EB] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" aria-hidden="true" />
    </label>
  );
}

function LineChart({ values, labels, stroke, gradientId, unit }: {
  values: number[];
  labels: string[];
  stroke: string;
  gradientId: string;
  unit: string;
}) {
  const points = useMemo(() => createChartPoints(values, 640, 180, 12), [values]);
  const path = createPath(points);
  const maxValue = Math.max(...values, 0);
  const total = values.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return <div className="flex h-44 flex-col items-center justify-center rounded-xl bg-slate-50/70 text-center dark:bg-slate-900/40">
      <TrendingUp className="mb-2 h-6 w-6 text-slate-300 dark:text-slate-600" />
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ainda não há registros neste período</p>
      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Os dados aparecerão quando houver atividade.</p>
    </div>;
  }

  const areaPath = `${path} L 628 180 L 12 180 Z`;
  const labelIndexes = labels.length <= 7
    ? labels.map((_label, index) => index)
    : [0, Math.floor(labels.length / 2), labels.length - 1];

  return (
    <div>
      <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
        Total: <strong className="text-slate-800 dark:text-slate-200">{total} {unit}</strong>
        <span className="px-1.5 text-slate-300">·</span>
        Pico: <strong className="text-slate-800 dark:text-slate-200">{maxValue}</strong>
      </p>
      <div className="w-full overflow-hidden rounded-xl bg-slate-50/70 p-2 dark:bg-slate-900/40">
        <svg viewBox="0 0 640 190" className="h-40 w-full overflow-visible sm:h-44" role="img" aria-label={`${total} ${unit} registrados no período`}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[0, 1, 2].map((line) => <line key={line} x1="12" x2="628" y1={44 + line * 55} y2={44 + line * 55} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeDasharray="3 5" />)}
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={path} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => (
            <circle key={labels[index]} cx={point.x} cy={point.y} r={point.value > 0 ? 4 : 2} fill={stroke} stroke="white" strokeWidth="2">
              <title>{labels[index]}: {point.value} {unit}</title>
            </circle>
          ))}
        </svg>
        <div className="flex justify-between px-1 text-[10px] text-slate-400 dark:text-slate-500">
          {labelIndexes.map((index) => <span key={labels[index]}>{labels[index]}</span>)}
        </div>
      </div>
      <p className="sr-only">Resumo: {total} {unit} no período; maior valor em um intervalo: {maxValue}.</p>
    </div>
  );
}

export default function TrainerDashboardCharts({
  overview,
  period,
  relationshipPeriod,
  onPeriodChange,
  onRelationshipPeriodChange,
  onStudentSelect,
}: TrainerDashboardChartsProps) {
  const sessionLabels = overview.sessionSeries.map((row) => formatBucketLabel(row.bucket));
  const prLabels = overview.prSeries.map((row) => formatBucketLabel(row.bucket));
  const relationshipMax = Math.max(1, ...overview.relationshipSeries.flatMap((row) => [row.linked, row.unlinked]));
  const activityLabel = periodOptions.find((option) => option.value === period)?.label ?? "30 dias";
  const relationshipLabel = relationshipOptions.find((option) => option.value === relationshipPeriod)?.label ?? "6 meses";
  const mostActive = [...overview.rosterActivity]
    .sort((first, second) => second.sessionsInPeriod - first.sessionsInPeriod)
    .slice(0, 8);
  const studentMax = Math.max(1, ...mostActive.map((student) => student.sessionsInPeriod));

  return (
    <section className="space-y-4" aria-label="Gráficos de atividade da carteira">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ritmo da carteira</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Explore frequência, evolução e movimentações registradas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SelectControl label="Período de atividade" value={period} options={periodOptions} onChange={(value) => onPeriodChange(value as TrainerDashboardPeriod)} />
          <SelectControl label="Período de movimentações" value={relationshipPeriod} options={relationshipOptions} onChange={(value) => onRelationshipPeriodChange(value as TrainerRelationshipPeriod)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Treinos concluídos" description={`Frequência nos últimos ${activityLabel}`}>
          <LineChart values={overview.sessionSeries.map((row) => row.completedSessions)} labels={sessionLabels} stroke="#2563EB" gradientId="session-gradient" unit="treinos" />
        </ChartCard>
        <ChartCard title="Recordes pessoais" description="Novos máximos semanais por exercício">
          <LineChart values={overview.prSeries.map((row) => row.personalRecords)} labels={prLabels} stroke="#8B5CF6" gradientId="pr-gradient" unit="recordes" />
        </ChartCard>
        <ChartCard title="Entradas e saídas" description={`Movimentações registradas nos últimos ${relationshipLabel}`}>
          {overview.relationshipSeries.every((row) => row.linked === 0 && row.unlinked === 0) ? (
            <div className="flex h-44 items-center justify-center rounded-xl bg-slate-50/70 text-center text-xs text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">Ainda não há movimentações registradas neste intervalo.</div>
          ) : (
            <>
              <div className="mb-3 flex gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#2563EB]" />Entradas</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#F97316]" />Saídas</span>
              </div>
              <div className="flex h-36 items-end gap-1.5 rounded-xl bg-slate-50/70 px-2 pb-2 pt-4 dark:bg-slate-900/40 sm:gap-2">
                {overview.relationshipSeries.map((row) => (
                  <div key={row.bucket} className="flex h-full min-w-0 flex-1 items-end justify-center gap-0.5" title={`${formatBucketLabel(row.bucket, true)}: ${row.linked} entradas, ${row.unlinked} saídas`}>
                    <span className="w-2.5 rounded-t bg-[#2563EB] transition-all sm:w-3" style={{ height: `${Math.max(3, row.linked / relationshipMax * 100)}%` }} />
                    <span className="w-2.5 rounded-t bg-[#F97316] transition-all sm:w-3" style={{ height: `${Math.max(3, row.unlinked / relationshipMax * 100)}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400 dark:text-slate-500"><span>{formatBucketLabel(overview.relationshipSeries[0]?.bucket ?? "", true)}</span><span>{formatBucketLabel(overview.relationshipSeries.at(-1)?.bucket ?? "", true)}</span></div>
              <p className="sr-only">As barras mostram entradas e saídas mensais da carteira; vínculos antigos sem data não são incluídos.</p>
            </>
          )}
        </ChartCard>
        <ChartCard title="Frequência por aluno" description={`Selecione um aluno para abrir o progresso · ${activityLabel}`}>
          {mostActive.length === 0 ? (
            <div className="flex h-44 items-center justify-center rounded-xl bg-slate-50/70 text-xs text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">Adicione alunos à sua carteira para acompanhar a frequência.</div>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {mostActive.map((student) => (
                <button key={student.studentId} type="button" onClick={() => onStudentSelect(student.studentId)} className="group flex min-h-[44px] w-full items-center gap-2 rounded-lg px-1 text-left outline-none hover:bg-blue-50/70 focus-visible:ring-2 focus-visible:ring-[#2563EB] dark:hover:bg-blue-950/30">
                  <span className="w-24 shrink-0 truncate text-[11px] font-semibold text-slate-600 group-hover:text-[#2563EB] dark:text-slate-300 dark:group-hover:text-[#38BDF8] sm:w-32">{student.name}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <span className="block h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#00C2FF] transition-all" style={{ width: `${student.sessionsInPeriod / studentMax * 100}%` }} />
                  </span>
                  <span className="w-7 text-right text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200">{student.sessionsInPeriod}</span>
                </button>
              ))}
            </div>
          )}
          <p className="sr-only">Mostrando até oito alunos com maior número de treinos concluídos no período.</p>
        </ChartCard>
      </div>
    </section>
  );
}
