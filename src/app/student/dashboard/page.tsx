"use client";
import BrandLogo from "@/components/BrandLogo";

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
  Edit,
  X,
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
  weekDays: string | null;
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

  // Estados para edição de Ficha (Divisão & Dias)
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [editDivision, setEditDivision] = useState("");
  const [editWeekDays, setEditWeekDays] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const handleOpenEdit = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    setEditDivision(plan.division);
    setEditWeekDays(plan.weekDays ? plan.weekDays.split(",") : []);
    setEditError("");
  };

  const handleToggleEditDay = (day: string) => {
    if (editWeekDays.includes(day)) {
      setEditWeekDays(editWeekDays.filter((d) => d !== day));
    } else {
      setEditWeekDays([...editWeekDays, day]);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    if (!editDivision.trim()) {
      setEditError("A divisão não pode ser vazia.");
      return;
    }
    
    setSavingEdit(true);
    setEditError("");
    try {
      const response = await fetch(`/api/student/workout-plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          division: editDivision,
          weekDays: editWeekDays.length > 0 ? editWeekDays.join(",") : null,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setPlans(plans.map((p) => p.id === editingPlan.id ? { ...p, division: updated.division, weekDays: updated.weekDays } : p));
        setEditingPlan(null);
      } else {
        const data = await response.json();
        setEditError(data.error || "Erro ao salvar alterações.");
      }
    } catch (err) {
      setEditError("Erro ao salvar alterações.");
    } finally {
      setSavingEdit(false);
    }
  };

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      {/* Header */}
      <header className="border-b border-[#E2E8F0]/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <BrandLogo size={36} />

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0F172A]">
                {session?.user?.name || "Aluno"}
              </p>
              <p className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider">
                Atleta
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-red-500/30 hover:bg-red-500/5 text-[#94A3B8] hover:text-red-600 transition-all cursor-pointer"
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0]/80 text-[#2563EB] text-xs font-semibold mb-4 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-[#2563EB]/10" /> Hora do show
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Pronto para treinar hoje, <span className="text-[#2563EB]">{session?.user?.name?.split(" ")[0]}</span>?
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
            {trainer && (
              <p className="text-xs text-[#94A3B8]">
                Assessoria Esportiva: <span className="text-[#0F172A] font-semibold">{trainer.name}</span>
              </p>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1E40AF] hover:to-[#6D28D9] text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-purple-500/10 w-fit"
              title="Em breve: gerar treino personalizado com inteligência artificial"
            >
              <Sparkles className="w-4 h-4" />
              Criar treino com IA
            </button>
          </div>
        </section>

        {/* Abas */}
        <div className="flex border-b border-[#E2E8F0] mb-6">
          <button
            onClick={() => setActiveTab("fichas")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "fichas"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#94A3B8]"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            Minhas Fichas
          </button>
          <button
            onClick={() => setActiveTab("dupla")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "dupla"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#94A3B8]"
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
              <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
                <p className="text-sm">Carregando seus treinos...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center text-[#94A3B8]">
                <Dumbbell className="w-12 h-12 mx-auto text-[#475569] mb-4" />
                <p className="text-base font-semibold text-zinc-850">Nenhum treino atribuído</p>
                <p className="text-xs mt-1">Seu personal trainer ainda não cadastrou nenhuma ficha de treino para você.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80 flex flex-col justify-between group hover:border-[#2563EB]/30 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="min-w-10 h-10 px-2 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center font-display font-extrabold text-[#2563EB] text-xs whitespace-nowrap">
                          {plan.division}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                              {plan.name}
                            </h4>
                            <button
                              onClick={() => handleOpenEdit(plan)}
                              className="p-1 rounded-lg text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#2563EB]/5 transition-all cursor-pointer"
                              title="Editar divisão e dias"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {plan.description && (
                            <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">{plan.description}</p>
                          )}
                          {plan.weekDays && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {plan.weekDays.split(",").map((day) => (
                                <span
                                  key={day}
                                  className="text-[9px] font-bold bg-[#2563EB]/5 text-[#2563EB] px-1.5 py-0.5 rounded border border-[#2563EB]/10"
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                          )}
                          {!plan.weekDays && (
                            <p className="text-[10px] text-[#94A3B8] mt-1.5 italic">Nenhum dia da semana definido</p>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] bg-white border border-[#E2E8F0] px-2 py-1 rounded font-bold text-[#94A3B8] w-fit sm:self-start">
                        {plan.exercises.length} Exercícios
                      </span>
                    </div>

                    {/* Exercícios Preview */}
                    <div className="space-y-2 mb-6 border-y border-[#E2E8F0]/60 py-4">
                      {plan.exercises.slice(0, 3).map((ex) => (
                        <div key={ex.id} className="flex justify-between items-center text-xs">
                          <span className="text-[#475569] font-medium">{ex.name}</span>
                          <span className="text-[#94A3B8]">
                            {ex.sets}x{ex.reps} • {ex.method}
                          </span>
                        </div>
                      ))}
                      {plan.exercises.length > 3 && (
                        <p className="text-[10px] text-[#94A3B8] text-center pt-1 font-semibold">
                          + {plan.exercises.length - 3} exercícios na ficha
                        </p>
                      )}
                    </div>

                    {/* Botão de Ação */}
                    <Link
                      href={`/student/workout-session/${plan.id}`}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-[0.98]"
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
            <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#2563EB]" /> Comparar Desempenho (Treino em Dupla)
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Selecione um parceiro de treino da mesma assessoria para comparar seu volume, consistência e recordes de carga em tempo real!
              </p>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Escolha seu Parceiro de Treino</label>
                {partners.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic">Buscando parceiros cadastrados na assessoria...</p>
                ) : (
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => handleSelectPartner(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
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
              <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
                <p className="text-xs">Consolidando dados do duelo...</p>
              </div>
            ) : comparison ? (
              <div className="space-y-6">
                
                {/* Duelo de Consistência e Volume */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Card Consistência */}
                  <div className="glass-card rounded-2xl p-5 border border-[#E2E8F0]/80">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#2563EB]" /> Presença (Treinos Concluídos)
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Você */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#0F172A]">Você</span>
                          <span className="text-[#2563EB] font-mono">{comparison.myInfo.sessionsCount} treinos</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                          <div
                            className="bg-[#2563EB] h-full rounded-lg transition-all duration-1000"
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
                          <span className="text-[#0F172A]">{comparison.partnerInfo.name}</span>
                          <span className="text-[#94A3B8] font-mono">{comparison.partnerInfo.sessionsCount} treinos</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
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
                  <div className="glass-card rounded-2xl p-5 border border-[#E2E8F0]/80">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#2563EB]" /> Volume de Séries Concluídas
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Você */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#0F172A]">Você</span>
                          <span className="text-[#2563EB] font-mono">{comparison.myInfo.setsCount} séries</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                          <div
                            className="bg-[#2563EB] h-full rounded-lg transition-all duration-1000"
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
                          <span className="text-[#0F172A]">{comparison.partnerInfo.name}</span>
                          <span className="text-[#94A3B8] font-mono">{comparison.partnerInfo.setsCount} séries</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
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
                <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80">
                  <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-5 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2563EB]" /> Recordes de Carga Máxima (PRs)
                  </h4>

                  <div className="space-y-5">
                    {comparison.exerciseComparison.map((ex) => (
                      <div key={ex.exerciseName} className="p-4 rounded-xl bg-zinc-50 border border-[#E2E8F0]/60">
                        <h5 className="text-xs font-bold text-[#0F172A] mb-3">{ex.exerciseName}</h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Minha Carga */}
                          <div className="flex items-center justify-between border-r border-[#E2E8F0] pr-4">
                            <span className="text-[10px] text-[#94A3B8] font-bold uppercase">Você</span>
                            <span className="text-sm font-mono font-bold text-[#2563EB]">{ex.myMax}kg</span>
                          </div>

                          {/* Carga do Parceiro */}
                          <div className="flex items-center justify-between pl-4">
                            <span className="text-[10px] text-[#94A3B8] font-bold uppercase">{comparison.partnerInfo.name.split(" ")[0]}</span>
                            <span className="text-sm font-mono font-bold text-[#0F172A]">{ex.partnerMax}kg</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-[#94A3B8] border border-[#E2E8F0] border-dashed rounded-2xl">
                <Users className="w-8 h-8 mx-auto text-[#475569] mb-2" />
                <p className="text-xs">Selecione um parceiro de treino acima para ver o duelo de performance.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Edição de Ficha */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative border border-[#E2E8F0] animate-scale-up">
            {/* Fechar */}
            <button
              onClick={() => setEditingPlan(null)}
              className="absolute top-4 right-4 p-2 rounded-lg border border-[#E2E8F0] text-[#94A3B8] hover:text-[#0F172A] hover:bg-zinc-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display text-lg font-bold text-[#0F172A] mb-2 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#2563EB]" /> Editar Divisão e Dias
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-6">
              Ajuste o nome/letra da divisão de treino e marque quais dias da semana você pretende realizá-lo.
            </p>

            {editError && (
              <p className="text-xs font-semibold text-red-500 bg-red-500/5 border border-red-500/20 p-3 rounded-xl mb-4">
                {editError}
              </p>
            )}

            <div className="space-y-5">
              {/* Campo Divisão */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Letra / Nome da Divisão
                </label>
                <input
                  type="text"
                  value={editDivision}
                  onChange={(e) => setEditDivision(e.target.value)}
                  placeholder="Ex: A, B, Superior, Push"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
                />
              </div>

              {/* Dias da Semana */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Dias da Semana Planejados
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => {
                    const isSelected = editWeekDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleEditDay(day)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-[#2563EB] border-[#2563EB] text-white shadow-sm shadow-blue-500/10"
                            : "bg-white border-[#E2E8F0] text-[#475569] hover:border-zinc-300"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-3 border-t border-[#E2E8F0] mt-6">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#E2E8F0] hover:bg-zinc-100/50 text-[#475569] font-bold text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] disabled:bg-opacity-50 disabled:pointer-events-none text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
