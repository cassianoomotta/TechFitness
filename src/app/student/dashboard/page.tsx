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
  Users,
  TrendingUp,
  User,
  ArrowRight,
  RefreshCw,
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

interface Partner {
  id: string;
  name: string;
  email: string;
}

interface ComparisonData {
  myInfo: {
    name: string;
    sessionsCount: number;
    setsCount: number;
  };
  partnerInfo: {
    name: string;
    sessionsCount: number;
    setsCount: number;
  };
  exerciseComparison: {
    exerciseName: string;
    myMax: number;
    partnerMax: number;
  }[];
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados da Aba e Duelo de Parceiros
  const [activeTab, setActiveTab] = useState<"fichas" | "dupla">("fichas");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

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

  // Buscar lista de parceiros ao carregar a aba de dupla
  useEffect(() => {
    if (activeTab === "dupla" && partners.length === 0) {
      const fetchPartners = async () => {
        try {
          const response = await fetch("/api/student/partner-comparison");
          if (response.ok) {
            const data = await response.json();
            setPartners(data);
          }
        } catch (error) {
          console.error("Erro ao buscar parceiros:", error);
        }
      };
      fetchPartners();
    }
  }, [activeTab, partners]);

  // Carregar dados de comparação ao selecionar um parceiro
  const handleSelectPartner = async (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    if (!partnerId) {
      setComparison(null);
      return;
    }

    setComparisonLoading(true);
    try {
      const response = await fetch("/api/student/partner-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId }),
      });
      if (response.ok) {
        const data = await response.json();
        setComparison(data);
      }
    } catch (error) {
      console.error("Erro ao buscar comparação:", error);
    } finally {
      setComparisonLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-emerald-500 to-lime-500 p-2 rounded-xl shadow-lg shadow-emerald-500/10">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider uppercase text-zinc-900">
              Tech<span className="text-emerald-500">Fitness</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-zinc-800">
                {session?.user?.name || "Aluno"}
              </p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                Atleta
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2.5 rounded-xl border border-zinc-200 hover:border-red-500/30 hover:bg-red-500/5 text-zinc-500 hover:text-red-600 transition-all cursor-pointer"
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-emerald-600 text-xs font-semibold mb-4 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-emerald-500/10" /> Hora do show
          </div>
          <h1 className="font-display text-3xl font-extrabold text-zinc-900 tracking-tight">
            Pronto para treinar hoje, <span className="text-emerald-600">{session?.user?.name?.split(" ")[0]}</span>?
          </h1>
          {trainer && (
            <p className="text-xs text-zinc-500 mt-2">
              Assessoria Esportiva: <span className="text-zinc-800 font-semibold">{trainer.name}</span>
            </p>
          )}
        </section>

        {/* Abas */}
        <div className="flex border-b border-zinc-200 mb-6">
          <button
            onClick={() => setActiveTab("fichas")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "fichas"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            Minhas Fichas
          </button>
          <button
            onClick={() => setActiveTab("dupla")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "dupla"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <Users className="w-4 h-4" />
            Treino em Dupla 🤝
          </button>
        </div>

        {/* Aba 1: Fichas de Treino */}
        {activeTab === "fichas" && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
                <p className="text-sm">Carregando seus treinos...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center text-zinc-500">
                <Dumbbell className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
                <p className="text-base font-semibold text-zinc-850">Nenhum treino atribuído</p>
                <p className="text-xs mt-1">Seu personal trainer ainda não cadastrou nenhuma ficha de treino para você.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="glass-card rounded-2xl p-6 border border-zinc-200/80 flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-display font-extrabold text-emerald-600">
                          {plan.division}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">
                            {plan.name}
                          </h4>
                          {plan.description && (
                            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{plan.description}</p>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] bg-zinc-100 border border-zinc-200 px-2 py-1 rounded font-bold text-zinc-600 w-fit sm:self-start">
                        {plan.exercises.length} Exercícios
                      </span>
                    </div>

                    {/* Exercícios Preview */}
                    <div className="space-y-2 mb-6 border-y border-zinc-200/60 py-4">
                      {plan.exercises.slice(0, 3).map((ex) => (
                        <div key={ex.id} className="flex justify-between items-center text-xs">
                          <span className="text-zinc-700 font-medium">{ex.name}</span>
                          <span className="text-zinc-500">
                            {ex.sets}x{ex.reps} • {ex.method}
                          </span>
                        </div>
                      ))}
                      {plan.exercises.length > 3 && (
                        <p className="text-[10px] text-zinc-400 text-center pt-1 font-semibold">
                          + {plan.exercises.length - 3} exercícios na ficha
                        </p>
                      )}
                    </div>

                    {/* Botão de Ação */}
                    <Link
                      href={`/student/workout-session/${plan.id}`}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
                    >
                      <Play className="w-4.5 h-4.5 fill-white stroke-[3px]" />
                      Iniciar Sessão de Treino
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Aba 2: Treino em Dupla (Comparação) */}
        {activeTab === "dupla" && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-zinc-200/80">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-emerald-500" /> Comparar Desempenho (Treino em Dupla)
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                Selecione um parceiro de treino da mesma assessoria para comparar seu volume, consistência e recordes de carga em tempo real!
              </p>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Escolha seu Parceiro de Treino</label>
                {partners.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Buscando parceiros cadastrados na assessoria...</p>
                ) : (
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => handleSelectPartner(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 transition-all"
                  >
                    <option value="">-- Selecionar Parceiro --</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Resultado da Comparação */}
            {comparisonLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
                <p className="text-xs">Consolidando dados do duelo...</p>
              </div>
            ) : comparison ? (
              <div className="space-y-6">
                
                {/* Duelo de Consistência e Volume */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Card Consistência */}
                  <div className="glass-card rounded-2xl p-5 border border-zinc-200/80">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-500" /> Presença (Treinos Concluídos)
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Você */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-zinc-800">Você</span>
                          <span className="text-emerald-600 font-mono">{comparison.myInfo.sessionsCount} treinos</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-3 rounded-lg overflow-hidden border border-zinc-200/40">
                          <div
                            className="bg-emerald-500 h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount) > 0
                                  ? (comparison.myInfo.sessionsCount / Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Parceiro */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-zinc-800">{comparison.partnerInfo.name}</span>
                          <span className="text-zinc-600 font-mono">{comparison.partnerInfo.sessionsCount} treinos</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-3 rounded-lg overflow-hidden border border-zinc-200/40">
                          <div
                            className="bg-zinc-800 h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount) > 0
                                  ? (comparison.partnerInfo.sessionsCount / Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Volume de Trabalho */}
                  <div className="glass-card rounded-2xl p-5 border border-zinc-200/80">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" /> Volume de Séries Concluídas
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Você */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-zinc-800">Você</span>
                          <span className="text-emerald-600 font-mono">{comparison.myInfo.setsCount} séries</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-3 rounded-lg overflow-hidden border border-zinc-200/40">
                          <div
                            className="bg-emerald-500 h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount) > 0
                                  ? (comparison.myInfo.setsCount / Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Parceiro */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-zinc-800">{comparison.partnerInfo.name}</span>
                          <span className="text-zinc-600 font-mono">{comparison.partnerInfo.setsCount} séries</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-3 rounded-lg overflow-hidden border border-zinc-200/40">
                          <div
                            className="bg-zinc-800 h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount) > 0
                                  ? (comparison.partnerInfo.setsCount / Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Duelo de Carga nos Exercícios Chave */}
                <div className="glass-card rounded-2xl p-6 border border-zinc-200/80">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Recordes de Carga Máxima (PRs)
                  </h4>

                  <div className="space-y-5">
                    {comparison.exerciseComparison.map((ex) => (
                      <div key={ex.exerciseName} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60">
                        <h5 className="text-xs font-bold text-zinc-800 mb-3">{ex.exerciseName}</h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Minha Carga */}
                          <div className="flex items-center justify-between border-r border-zinc-200 pr-4">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Você</span>
                            <span className="text-sm font-mono font-bold text-emerald-600">{ex.myMax}kg</span>
                          </div>

                          {/* Carga do Parceiro */}
                          <div className="flex items-center justify-between pl-4">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">{comparison.partnerInfo.name.split(" ")[0]}</span>
                            <span className="text-sm font-mono font-bold text-zinc-800">{ex.partnerMax}kg</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-zinc-400 border border-zinc-200 border-dashed rounded-2xl">
                <Users className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                <p className="text-xs">Selecione um parceiro de treino acima para ver o duelo de performance.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
