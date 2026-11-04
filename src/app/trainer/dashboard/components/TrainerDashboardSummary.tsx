import { Activity, Award, BookOpen, UserRound, UserRoundMinus } from "lucide-react";
import { TrainerDashboardSummary as Summary } from "@/lib/trainer-dashboard";

interface TrainerDashboardSummaryProps {
  summary: Summary;
  periodLabel: string;
}

const cards = [
  { key: "linkedStudents", label: "Alunos na carteira", icon: UserRound, tone: "blue" },
  { key: "completedSessions", label: "Treinos registrados", icon: Activity, tone: "cyan" },
  { key: "studentsWithoutSessions", label: "Sem registro no período", icon: UserRoundMinus, tone: "amber" },
  { key: "activePlans", label: "Fichas ativas", icon: BookOpen, tone: "violet" },
] as const;

export default function TrainerDashboardSummary({ summary, periodLabel }: TrainerDashboardSummaryProps) {
  const toneClasses = {
    blue: "bg-blue-50 text-[#2563EB] border-blue-100 dark:bg-blue-950/40 dark:text-[#38BDF8] dark:border-blue-900/40",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900/40",
    amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40",
    violet: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-900/40",
  } as const;

  return (
    <section aria-label="Resumo da carteira do professor">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Visão geral da carteira</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Atividade nos últimos {periodLabel}</p>
        </div>
        <div className="hidden sm:flex min-h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#151D2F]/80 dark:text-slate-300">
          <Award className="h-4 w-4 text-violet-500" />
          {summary.weeklyPersonalRecords} recordes nesta semana
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.key} className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-md transition-all hover:border-[#2563EB]/30 dark:border-slate-800 dark:bg-[#151D2F]/85 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="max-w-[12rem] text-xs font-semibold leading-snug text-slate-500 dark:text-slate-400">{card.label}</p>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toneClasses[card.tone]}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">{summary[card.key]}</p>
            </article>
          );
        })}
      </div>
      <div className="mt-3 flex min-h-10 items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/80 px-3 text-xs font-semibold text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200 sm:hidden">
        <Award className="h-4 w-4 text-violet-500" />
        {summary.weeklyPersonalRecords} recordes nesta semana
      </div>
    </section>
  );
}
