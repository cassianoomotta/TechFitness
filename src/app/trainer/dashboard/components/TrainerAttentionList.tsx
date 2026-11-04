import Link from "next/link";
import { ArrowUpRight, CalendarClock, ClipboardList, Dumbbell, UserRoundSearch } from "lucide-react";
import { TrainerDashboardOverview } from "@/lib/trainer-dashboard";

interface TrainerAttentionListProps {
  overview: TrainerDashboardOverview;
  periodLabel: string;
}

function formatDate(value: string | null): string {
  if (!value) return "Sem sessão registrada";
  return new Date(value).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
}

function ageLabel(days: number): string {
  if (days === 0) return "Criada hoje";
  if (days === 1) return "1 dia";
  return `${days} dias`;
}

export default function TrainerAttentionList({ overview, periodLabel }: TrainerAttentionListProps) {
  const studentsWithoutSessions = overview.rosterActivity
    .filter((student) => student.sessionsInPeriod === 0)
    .sort((first, second) => {
      if (first.lastSessionAt === null) return second.lastSessionAt === null ? first.name.localeCompare(second.name) : -1;
      if (second.lastSessionAt === null) return 1;
      return new Date(first.lastSessionAt).getTime() - new Date(second.lastSessionAt).getTime();
    })
    .slice(0, 8);
  const plans = overview.rosterActivity
    .flatMap((student) => student.activePlans.map((plan) => ({ student, plan })))
    .sort((first, second) => second.plan.ageDays - first.plan.ageDays)
    .slice(0, 8);

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Acompanhamento dos alunos e fichas">
      <article className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#151D2F]/85 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Precisam de um check-in</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sem treino concluído nos últimos {periodLabel}.</p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"><UserRoundSearch className="h-4 w-4" /></span>
        </div>

        {studentsWithoutSessions.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-xl bg-emerald-50/70 px-4 text-center dark:bg-emerald-950/20">
            <Dumbbell className="mb-2 h-6 w-6 text-emerald-500" />
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">Todos têm registro neste período</p>
            <p className="mt-1 text-[11px] text-emerald-700/75 dark:text-emerald-300/70">Continue acompanhando a rotina de cada aluno.</p>
          </div>
        ) : (
          <ul className="max-h-[24rem] space-y-2 overflow-y-auto pr-1">
            {studentsWithoutSessions.map((student) => (
              <li key={student.studentId}>
                <Link href={`/trainer/students/${student.studentId}/progress`} className="group flex min-h-[58px] items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/70 px-3 py-2 transition-all hover:border-[#2563EB]/30 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-blue-950/20">
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-800 group-hover:text-[#2563EB] dark:text-slate-200 dark:group-hover:text-[#38BDF8]">{student.name}</span>
                    <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400"><CalendarClock className="h-3 w-3" />Último registro: {formatDate(student.lastSessionAt)}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#2563EB]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {overview.summary.studentsWithoutSessions > studentsWithoutSessions.length && <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">Mais {overview.summary.studentsWithoutSessions - studentsWithoutSessions.length} aluno(s) sem registro no período.</p>}
      </article>

      <article className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#151D2F]/85 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Idade das fichas ativas</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tempo desde a criação para ajudar na revisão.</p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-[#38BDF8]"><ClipboardList className="h-4 w-4" /></span>
        </div>
        {plans.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-xl bg-slate-50/80 px-4 text-center dark:bg-slate-900/40">
            <ClipboardList className="mb-2 h-6 w-6 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nenhuma ficha ativa cadastrada</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">As fichas aparecerão aqui após serem criadas.</p>
          </div>
        ) : (
          <ul className="max-h-[24rem] space-y-2 overflow-y-auto pr-1">
            {plans.map(({ student, plan }) => (
              <li key={plan.id}>
                <Link href={`/trainer/students/${student.studentId}/new-plan`} className="group flex min-h-[58px] items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/70 px-3 py-2 transition-all hover:border-[#2563EB]/30 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-blue-950/20">
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-800 group-hover:text-[#2563EB] dark:text-slate-200 dark:group-hover:text-[#38BDF8]">{plan.name}</span>
                    <span className="mt-1 block truncate text-[10px] text-slate-500 dark:text-slate-400">{student.name} · criada em {formatDate(plan.createdAt)}</span>
                  </span>
                  <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#2563EB] dark:bg-blue-950/50 dark:text-[#38BDF8]">{ageLabel(plan.ageDays)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {overview.summary.activePlans > plans.length && <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">Exibindo até oito fichas da carteira.</p>}
      </article>
    </section>
  );
}
