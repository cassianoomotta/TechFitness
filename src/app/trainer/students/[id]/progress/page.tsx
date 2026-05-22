"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Dumbbell,
  LogOut,
  Loader2,
  ChevronLeft,
  Activity,
  Award,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowRight,
  TrendingDown,
  Clock,
} from "lucide-react";

interface SessionLog {
  id: string;
  date: string;
  durationMinutes: number;
  satisfaction: number;
}

interface ExerciseHistoryPoint {
  date: string;
  maxWeight: number;
  repsAtMaxWeight: number;
}

interface ExerciseProgress {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  history: ExerciseHistoryPoint[];
}

interface Suggestion {
  exerciseId: string;
  exerciseName: string;
  currentWeight: number;
  suggestedWeight: number;
  reason: string;
}

export default function StudentProgressPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const studentId = params.id as string;

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [totalSessions, setTotalSessions] = useState(0);
  const [recentSessions, setRecentSessions] = useState<SessionLog[]>([]);
  const [progressData, setProgressData] = useState<ExerciseProgress[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/trainer/students/${studentId}/progress`);
        if (!response.ok) {
          router.push("/trainer/dashboard");
          return;
        }

        const data = await response.json();
        setStudentName(data.studentName);
        setStudentEmail(data.studentEmail);
        setTotalSessions(data.totalSessionsCount);
        setRecentSessions(data.recentSessions);
        setProgressData(data.exerciseProgress);
        setSuggestions(data.progressionSuggestions);
      } catch (err) {
        console.error("Erro ao buscar progresso:", err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchProgress();
    }
  }, [studentId, router]);

  // Formatar Data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                <Dumbbell className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider uppercase text-white">
                Pulse<span className="text-emerald-400">SaaS</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/trainer/dashboard"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Alunos
              </Link>
              <Link
                href="/trainer/exercises"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Exercícios
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">
                {session?.user?.name || "Professor"}
              </p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Personal Trainer
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2.5 rounded-xl border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Header Contexto */}
      <section className="bg-slate-900/40 border-b border-zinc-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <Link
            href="/trainer/dashboard"
            className="p-2 rounded-lg border border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              {loading ? "Carregando evolução..." : `Evolução de Cargas: ${studentName}`}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">{studentEmail}</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
          <p className="text-sm">Buscando métricas de evolução...</p>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Bloco 1: Sugestões de Progressão Inteligente de Carga */}
          <section>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-500/10" /> Recomendações de Carga Inteligentes
            </h3>

            {suggestions.length === 0 ? (
              <div className="glass-card rounded-2xl p-6 text-zinc-400 border border-zinc-900 flex items-center gap-3">
                <InfoIcon className="w-5 h-5 text-emerald-500/80" />
                <p className="text-xs">
                  Sem recomendações de progressão ativas no momento. O aluno precisa bater o topo de repetições prescrito em 2 treinos seguidos para o algoritmo ativar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((s) => (
                  <div
                    key={s.exerciseId}
                    className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-br from-slate-900/60 to-emerald-950/5 relative overflow-hidden shadow-lg shadow-emerald-500/5"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
                    
                    <h4 className="font-display font-semibold text-sm text-white leading-tight mb-2">
                      {s.exerciseName}
                    </h4>

                    <div className="flex items-center gap-4 py-3 my-3 border-y border-zinc-900">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider block font-semibold">Carga Anterior</span>
                        <span className="text-base font-mono font-bold text-zinc-400">{s.currentWeight}kg</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-400 stroke-[3px] mt-3" />
                      <div>
                        <span className="text-[9px] text-emerald-400 uppercase tracking-wider block font-semibold">Nova Carga Sugerida</span>
                        <span className="text-base font-mono font-bold text-emerald-400">{s.suggestedWeight}kg</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      <strong>Motivo:</strong> {s.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Grid de Duas Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Coluna Direita / Frequência (4/12) */}
            <section className="lg:col-span-4 space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-zinc-900">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" /> Histórico de Presença
                </h3>

                <div className="flex items-center justify-between py-3 border-b border-zinc-900/60 mb-5">
                  <span className="text-xs text-zinc-400 font-medium">Sessões Realizadas</span>
                  <span className="text-base font-bold text-white">{totalSessions} no total</span>
                </div>

                {recentSessions.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">Nenhuma sessão registrada pelo aluno.</p>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-zinc-900"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="bg-zinc-900 p-2 rounded-lg text-zinc-400">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{formatDate(session.date)}</p>
                            <p className="text-[9px] text-zinc-500 mt-0.5">{session.durationMinutes} minutos de treino</p>
                          </div>
                        </div>

                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/5 px-2 py-0.5 rounded font-mono font-bold">
                          RPE {session.satisfaction}/10
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Coluna Esquerda / Histórico de Cargas (8/12) */}
            <section className="lg:col-span-8 space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-zinc-900">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Curva de Progressão por Exercício
                </h3>

                {progressData.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-12">O aluno ainda não registrou logs de cargas em nenhum exercício.</p>
                ) : (
                  <div className="space-y-6">
                    {progressData.map((exercise) => (
                      <div
                        key={exercise.exerciseId}
                        className="p-5 rounded-2xl bg-slate-950/40 border border-zinc-900/60"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xs font-bold text-white">{exercise.name}</h4>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block mt-1">
                              {exercise.muscleGroup}
                            </span>
                          </div>
                        </div>

                        {/* Barra de Evolução Gráfica Customizada */}
                        <div className="space-y-2">
                          {exercise.history.slice(-5).map((point, idx) => {
                            // Calcula largura da barra proporcional com base no maior valor de peso do histórico
                            const maxPossibleWeight = Math.max(...exercise.history.map((h) => h.maxWeight));
                            const percentage = maxPossibleWeight > 0 ? (point.maxWeight / maxPossibleWeight) * 100 : 0;

                            return (
                              <div key={idx} className="flex items-center gap-3 text-xs">
                                <span className="w-20 text-[10px] text-zinc-500">{formatDate(point.date)}</span>
                                <div className="flex-1 bg-slate-950 h-5.5 rounded-lg overflow-hidden border border-zinc-900/60 relative flex items-center px-2">
                                  <div
                                    className="bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 h-full rounded-lg absolute left-0 top-0 transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                  />
                                  <span className="relative z-10 font-mono text-[10px] font-bold text-white">
                                    {point.maxWeight}kg <span className="text-zinc-500 font-semibold">({point.repsAtMaxWeight} reps)</span>
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  );
}

// Pequeno ícone auxiliar
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
