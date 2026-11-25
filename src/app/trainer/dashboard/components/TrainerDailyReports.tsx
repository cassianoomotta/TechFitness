"use client";

import { useState } from "react";
import type { TrainerDailyReport } from "@/lib/trainer-dashboard";

export default function TrainerDailyReports({ reports }: { reports: TrainerDailyReport[] }) {
  const [day, setDay] = useState("");
  const report = reports.find((item: TrainerDailyReport) => item.day === day) ?? reports[0];
  const label = (date: string) => date.split("-").reverse().join("/");
  const metrics = report ? [
    ["Treinos concluídos", report.sessions],
    ["Alunos sem treino em 7 dias", report.inactiveStudents],
    ["Fichas ativas com 30 dias ou mais", report.olderPlans],
    ["Vínculos iniciados", report.joined],
    ["Vínculos encerrados", report.departed],
  ] as const : [];

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-[#151D2F]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Resumo diário da turma</h2>
        {report && <select aria-label="Dia do resumo" value={report.day} onChange={(event) => setDay(event.target.value)}
          className="min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 text-base dark:border-slate-700 md:text-sm">
          {reports.map((item: TrainerDailyReport) => <option key={item.day} value={item.day}>{label(item.day)}</option>)}
        </select>}
      </div>
      {report ? <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map(([title, value]) => <div key={title}>
          <dt className="text-xs text-slate-500 dark:text-slate-400">{title}</dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-300">{value}</dd>
        </div>)}
      </dl> : <p className="mt-2 text-sm text-slate-500">Aguardando o primeiro fechamento diário.</p>}
    </section>
  );
}
