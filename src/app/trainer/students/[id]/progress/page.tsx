"use client";
import BrandLogo from "@/components/BrandLogo";

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
  ArrowRight,
  Clock,
  Cpu,
  Info,
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

  // Estados do Copilot IA
  const [copilotAnalysis, setCopilotAnalysis] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);

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

  // Função para chamar o Copilot IA
  const handleRequestCopilot = async () => {
    setCopilotLoading(true);
    setCopilotAnalysis("");
    try {
      const response = await fetch(`/api/trainer/students/${studentId}/copilot`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setCopilotAnalysis(data.analysis);
      }
    } catch (err) {
      console.error("Erro ao acionar o Copilot IA:", err);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Mini Renderizador Nativo de Markdown Estilizado
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="font-display font-extrabold text-sm text-[#0F172A] mt-5 mb-2.5 tracking-tight border-b border-[#E2E8F0] pb-1">
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-display font-bold text-xs text-[#2563EB] mt-4 mb-2">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("> [!NOTE]")) {
        return null;
      }
      if (line.startsWith("> ")) {
        return (
          <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 border border-[#2563EB]/20 text-[#475569] text-xs italic my-3 leading-relaxed">
            {line.replace("> ", "")}
          </div>
        );
      }
      if (line.startsWith("* ") || line.startsWith("- ")) {
        const cleanLine = line.replace(/^[\*\-]\s+/, "");
        return (
          <li key={idx} className="text-xs text-[#94A3B8] list-disc ml-5 mt-1">
            {cleanLine}
          </li>
        );
      }
      if (line.trim() === "") return <div key={idx} className="h-2" />;
      return (
        <p key={idx} className="text-xs text-[#94A3B8] leading-relaxed mt-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo size={36} />

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/trainer/dashboard"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#475569] hover:text-zinc-950 transition-colors"
              >
                Alunos
              </Link>
              <Link
                href="/trainer/exercises"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#475569] hover:text-zinc-950 transition-colors"
              >
                Exercícios
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0F172A]">
                {session?.user?.name || "Professor"}
              </p>
              <p className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider">
                Personal Trainer
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-red-500/30 hover:bg-red-550/5 text-[#475569] hover:text-red-600 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Header Contexto */}
      <section className="bg-white/60 border-b border-[#E2E8F0] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/trainer/dashboard"
              className="p-2 rounded-lg border border-[#E2E8F0] bg-white hover:border-zinc-300 text-[#475569] hover:text-zinc-950 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="font-display text-xl font-bold text-[#0F172A]">
                {loading ? "Carregando evolução..." : `Evolução de Cargas: ${studentName}`}
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">{studentEmail}</p>
            </div>
          </div>

          {/* Botão Copilot IA */}
          {!loading && (
            <button
              onClick={handleRequestCopilot}
              disabled={copilotLoading}
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/10 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {copilotLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analisando dados...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Análise Copilot IA
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8] py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
          <p className="text-sm">Buscando métricas de evolução...</p>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Sessão de exibição do Copilot IA */}
          {(copilotLoading || copilotAnalysis) && (
            <section className="animate-slide-down">
              <div className="glass-card rounded-2xl p-6 border border-[#2563EB]/30 bg-white relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-[#00C2FF]/10 text-[#2563EB]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#0F172A] uppercase tracking-wider">
                    TechFitness Copilot IA — Recomendação de Periodização
                  </h3>
                </div>

                {copilotLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-[#94A3B8]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mb-2" />
                    <p className="text-xs">O Copilot está analisando as dobras físicas, cargas e presenças do aluno...</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-w-none">
                    {renderMarkdown(copilotAnalysis)}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Bloco 1: Sugestões de Progressão Inteligente de Carga */}
          <section>
            <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563EB] fill-[#2563EB]/10" /> Recomendações de Carga Inteligentes
            </h3>

            {suggestions.length === 0 ? (
              <div className="glass-card rounded-2xl p-6 text-[#94A3B8] border border-[#E2E8F0] bg-white shadow-sm flex items-center gap-3">
                <Info className="w-5 h-5 text-[#2563EB]" />
                <p className="text-xs">
                  Sem recomendações de progressão ativas no momento. O aluno precisa bater o topo de repetições prescrito em 2 treinos seguidos para o algoritmo sugerir um aumento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((s) => (
                  <div
                    key={s.exerciseId}
                    className="glass-card rounded-2xl p-5 border border-[#E2E8F0] bg-white relative overflow-hidden shadow-sm hover:border-[#2563EB]/30 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#2563EB]/5 rounded-full blur-xl" />
                    
                    <h4 className="font-display font-semibold text-sm text-zinc-950 leading-tight mb-2">
                      {s.exerciseName}
                    </h4>

                    <div className="flex items-center gap-4 py-3 my-3 border-y border-[#E2E8F0]">
                      <div>
                        <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider block font-semibold">Carga Anterior</span>
                        <span className="text-base font-mono font-bold text-[#94A3B8]">{s.currentWeight}kg</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#2563EB] stroke-[3px] mt-3" />
                      <div>
                        <span className="text-[9px] text-[#2563EB] uppercase tracking-wider block font-semibold">Nova Carga Sugerida</span>
                        <span className="text-base font-mono font-bold text-[#2563EB]">{s.suggestedWeight}kg</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                      <strong>Motivo:</strong> {s.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Grid de Duas Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Coluna Direita / Frequência */}
            <section className="lg:col-span-4 space-y-6">
              <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2563EB]" /> Histórico de Presença
              </h3>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
                  <span className="text-xs font-semibold text-[#94A3B8]">Total de Treinos Feitos</span>
                  <span className="font-mono text-xs font-bold text-[#0F172A] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                    {totalSessions} treinos
                  </span>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {recentSessions.length === 0 ? (
                    <p className="text-xs text-[#94A3B8] text-center py-6">Nenhum treino concluído ainda.</p>
                  ) : (
                    recentSessions.map((session) => (
                      <div key={session.id} className="p-3 bg-zinc-50 rounded-xl flex items-center justify-between border border-[#E2E8F0] text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <span className="font-semibold text-[#0F172A]">
                            {new Date(session.date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-mono text-[10px] text-[#94A3B8] bg-zinc-200/50 px-1.5 py-0.5 rounded">
                            {session.durationMinutes} min
                          </span>
                          <span className="font-mono text-[10px] text-[#2563EB] bg-[#00C2FF]/10 px-1.5 py-0.5 rounded border border-cyan-900/50">
                            RPE {session.satisfaction}/10
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Coluna Esquerda / Histórico de Força por Exercício */}
            <section className="lg:col-span-8 space-y-6">
              <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2563EB]" /> Histórico de Progressão de Força
              </h3>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-6">
                {progressData.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] text-center py-12">Nenhum registro de progressão encontrado.</p>
                ) : (
                  <div className="space-y-6">
                    {progressData.map((exercise) => (
                      <div key={exercise.exerciseId} className="space-y-3 pb-6 border-b border-[#E2E8F0] last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-bold text-[#0F172A]">{exercise.name}</h4>
                            <span className="text-[9px] text-[#94A3B8] uppercase font-semibold">{exercise.muscleGroup}</span>
                          </div>
                          
                          {/* Recorde Histórico */}
                          {exercise.history.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                              <Award className="w-3.5 h-3.5" />
                              <span className="font-bold font-mono">
                                PR: {Math.max(...exercise.history.map(h => h.maxWeight))}kg
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Linha do Tempo de Peso */}
                        <div className="flex gap-2 overflow-x-auto py-2 pr-2">
                          {exercise.history.map((pt, ptIdx) => (
                            <div key={ptIdx} className="bg-zinc-50 border border-[#E2E8F0] rounded-xl p-3 flex flex-col min-w-24 text-center items-center justify-center flex-shrink-0">
                              <span className="text-[8px] text-[#94A3B8] font-semibold">{new Date(pt.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}</span>
                              <span className="text-sm font-mono font-bold text-[#0F172A] mt-1">{pt.maxWeight}kg</span>
                              <span className="text-[9px] text-[#94A3B8] font-medium font-mono mt-0.5">{pt.repsAtMaxWeight} reps</span>
                            </div>
                          ))}
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
