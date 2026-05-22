"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Dumbbell,
  LogOut,
  Loader2,
  Calendar,
  Activity,
  Play,
  Award,
  Sparkles,
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  restSeconds: number;
  method: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  division: string;
  exercises: Exercise[];
}

interface TrainerInfo {
  name: string;
  email: string;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/student/workout-plans");
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans);
          setTrainer(data.trainer);
        }
      } catch (error) {
        console.error("Erro ao buscar treinos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider uppercase text-white">
              Pulse<span className="text-emerald-400">SaaS</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">
                {session?.user?.name || "Aluno"}
              </p>
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Atleta
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

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Block */}
        <section className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-zinc-800 text-cyan-400 text-xs font-semibold mb-4 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-cyan-400/20" /> Hora do show
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
            Pronto para treinar hoje, <span className="text-gradient">{session?.user?.name?.split(" ")[0]}</span>?
          </h1>
          {trainer && (
            <p className="text-sm text-zinc-500 mt-2">
              Seu Personal Trainer: <span className="text-zinc-300 font-semibold">{trainer.name}</span>
            </p>
          )}
        </section>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
            <p className="text-sm">Carregando seus treinos...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-zinc-400">
            <Dumbbell className="w-12 h-12 mx-auto text-zinc-700 mb-4 animate-pulse" />
            <p className="text-base font-semibold text-white">Nenhum treino atribuído</p>
            <p className="text-sm mt-1">Seu personal trainer ainda não cadastrou nenhuma ficha de treino para você.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">
              Fichas de Treino Disponíveis
            </h3>

            {plans.map((plan) => (
              <div
                key={plan.id}
                className="glass-card rounded-2xl p-6 border border-zinc-900 flex flex-col justify-between group hover:border-zinc-800 transition-all duration-300 relative overflow-hidden"
              >
                {/* Background decorative glow */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-display font-extrabold text-cyan-400">
                        {plan.division}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {plan.name}
                        </h4>
                        {plan.description && (
                          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{plan.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] bg-zinc-900 border border-zinc-850 px-2 py-1 rounded text-zinc-400 w-fit sm:self-start">
                    {plan.exercises.length} Exercícios
                  </span>
                </div>

                {/* Exercícios Preview */}
                <div className="space-y-2 mb-6 border-y border-zinc-900/60 py-4">
                  {plan.exercises.slice(0, 3).map((ex) => (
                    <div key={ex.id} className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-medium">{ex.name}</span>
                      <span className="text-zinc-500">
                        {ex.sets}x{ex.reps} • {ex.method}
                      </span>
                    </div>
                  ))}
                  {plan.exercises.length > 3 && (
                    <p className="text-[10px] text-zinc-500 text-center pt-1 font-semibold">
                      + {plan.exercises.length - 3} exercícios na ficha
                    </p>
                  )}
                </div>

                {/* Botão de Ação */}
                <Link
                  href={`/student/workout-session/${plan.id}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
                >
                  <Play className="w-4.5 h-4.5 fill-slate-950 stroke-[3px]" />
                  Iniciar Sessão de Treino
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
