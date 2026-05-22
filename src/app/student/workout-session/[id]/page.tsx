"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Dumbbell,
  Loader2,
  Clock,
  Check,
  ChevronLeft,
  Tv,
  Info,
  ChevronRight,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

interface Exercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  description: string | null;
  videoUrl: string | null;
  sets: number;
  reps: string;
  restSeconds: number;
  method: string;
  recommendedRpe: number | null;
  recommendedWeight: number | null;
  notes: string | null;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  division: string;
  exercises: Exercise[];
}

interface SetState {
  weight: string;
  reps: string;
  completed: boolean;
}

export default function WorkoutSessionPlayer() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Tempo de Treino Geral
  const [totalSeconds, setTotalSeconds] = useState(0);

  // Estado das séries: Record<exerciseIndex, SetState[]>
  const [setsData, setSetsData] = useState<Record<number, SetState[]>>({});

  // Estado do Temporizador de Descanso
  const [restTime, setRestTime] = useState(0);
  const [initialRestTime, setInitialRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modal de Finalização
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [satisfaction, setSatisfaction] = useState(7); // RPE padrão 7
  const [finishLoading, setFinishLoading] = useState(false);
  const [finishSuccess, setFinishSuccess] = useState(false);
  const [finishError, setFinishError] = useState("");

  // Cronômetro Geral do Treino
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Buscar plano de treino
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/student/workout-plans/${planId}`);
        if (!response.ok) {
          router.push("/student/dashboard");
          return;
        }
        const data = await response.json();
        setPlan(data);

        // Inicializar os inputs de séries com os valores recomendados
        const initialSets: Record<number, SetState[]> = {};
        data.exercises.forEach((ex: Exercise, exIndex: number) => {
          initialSets[exIndex] = Array.from({ length: ex.sets }, () => ({
            weight: ex.recommendedWeight ? String(ex.recommendedWeight) : "",
            reps: isNaN(Number(ex.reps)) ? "10" : ex.reps, // fallbacks amigáveis
            completed: false,
          }));
        });
        setSetsData(initialSets);
      } catch (err) {
        console.error("Erro ao carregar treino:", err);
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId, router]);

  // Gerenciamento do Temporizador de Descanso
  useEffect(() => {
    if (isResting && restTime > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            clearInterval(restIntervalRef.current!);
            setIsResting(false);
            // Alerta sonoro / vibratório visual
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isResting, restTime]);

  const startRestTimer = (seconds: number) => {
    if (seconds <= 0) return;
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setInitialRestTime(seconds);
    setRestTime(seconds);
    setIsResting(true);
  };

  const handleToggleSetComplete = (exIndex: number, setIndex: number, restSeconds: number) => {
    const currentSets = [...(setsData[exIndex] || [])];
    const isCompleted = !currentSets[setIndex].completed;

    currentSets[setIndex] = {
      ...currentSets[setIndex],
      completed: isCompleted,
    };

    setSetsData({
      ...setsData,
      [exIndex]: currentSets,
    });

    // Se marcou como completo, inicia o descanso do exercício
    if (isCompleted) {
      startRestTimer(restSeconds);
    }
  };

  const handleUpdateSetField = (exIndex: number, setIndex: number, field: keyof SetState, value: any) => {
    const currentSets = [...(setsData[exIndex] || [])];
    currentSets[setIndex] = {
      ...currentSets[setIndex],
      [field]: value,
    };
    setSetsData({
      ...setsData,
      [exIndex]: currentSets,
    });
  };

  // Formatar tempo total
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Salvar sessão de treino
  const handleFinishWorkout = async () => {
    if (!plan) return;
    setFinishLoading(true);
    setFinishError("");
    setFinishSuccess(false);

    // Mapear todos os logs preenchidos para enviar ao backend
    const logsPayload: any[] = [];

    plan.exercises.forEach((ex, exIndex) => {
      const exerciseSets = setsData[exIndex] || [];
      exerciseSets.forEach((set, setIndex) => {
        // Envia apenas as séries que foram marcadas como concluídas
        if (set.completed) {
          logsPayload.push({
            exerciseId: ex.exerciseId,
            setNumber: setIndex + 1,
            weightUsed: Number(set.weight) || 0,
            repsPerformed: Number(set.reps) || 0,
            rpe: ex.recommendedRpe || null,
            failed: false,
          });
        }
      });
    });

    if (logsPayload.length === 0) {
      setFinishError("Conclua pelo menos uma série para finalizar o treino.");
      setFinishLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/student/workout-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMs: totalSeconds * 1000,
          satisfaction: Number(satisfaction),
          logs: logsPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFinishError(data.error || "Erro ao salvar o treino.");
        return;
      }

      setFinishSuccess(true);
      setTimeout(() => {
        router.push("/student/dashboard");
      }, 1500);
    } catch (err) {
      setFinishError("Erro de conexão ao salvar.");
    } finally {
      setFinishLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
        <p className="text-sm">Carregando player de treino...</p>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col max-w-md mx-auto relative border-x border-zinc-900 shadow-2xl">
      
      {/* Header Fixo */}
      <header className="border-b border-zinc-900 bg-slate-950/95 sticky top-0 z-30 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="p-2 rounded-lg border border-zinc-900 hover:border-zinc-800 text-zinc-400"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </Link>
          <div>
            <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded block w-fit">
              Treino {plan.division}
            </span>
            <h2 className="text-sm font-bold text-white mt-1 leading-none">{plan.name}</h2>
          </div>
        </div>

        {/* Cronômetro Geral do Treino */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono text-xs font-semibold">
          <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
          {formatTime(totalSeconds)}
        </div>
      </header>

      {/* Main Exercises List (Mobile-First scroll) */}
      <main className="flex-1 px-4 py-6 space-y-6 pb-28 overflow-y-auto">
        {plan.exercises.map((exercise, exIndex) => (
          <div
            key={exercise.id}
            className="glass-card rounded-2xl p-4 border border-zinc-900 space-y-4"
          >
            {/* Título do Exercício */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{exercise.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[8px] font-bold bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">
                    {exercise.equipment}
                  </span>
                  <span className="text-[8px] font-bold bg-zinc-950 border border-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded">
                    Descanso: {exercise.restSeconds}s
                  </span>
                  <span className="text-[8px] font-bold bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">
                    {exercise.method}
                  </span>
                </div>
              </div>

              {exercise.videoUrl && (
                <a
                  href={exercise.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-900 text-zinc-500 hover:text-white"
                  title="Ver vídeo demonstrativo"
                >
                  <Tv className="w-4 h-4" />
                </a>
              )}
            </div>

            {exercise.notes && (
              <p className="text-[10px] text-zinc-500 leading-relaxed bg-zinc-950 border border-zinc-900/50 p-2 rounded-lg">
                <strong>Obs:</strong> {exercise.notes}
              </p>
            )}

            {/* Listagem de Séries do Exercício */}
            <div className="space-y-2">
              {/* Cabeçalho das colunas */}
              <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-zinc-600 uppercase tracking-wider text-center">
                <span className="col-span-2 text-left">Série</span>
                <span className="col-span-4">Carga (kg)</span>
                <span className="col-span-4">Reps</span>
                <span className="col-span-2">Feito</span>
              </div>

              {/* Séries */}
              {(setsData[exIndex] || []).map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`grid grid-cols-12 gap-2 items-center text-xs p-1 rounded-lg transition-all ${
                    set.completed
                      ? "bg-emerald-950/20 border border-emerald-900/20"
                      : "bg-slate-900/10 border border-transparent"
                  }`}
                >
                  {/* Número */}
                  <span className="col-span-2 font-semibold text-zinc-500 text-center">
                    {setIndex + 1}ª
                  </span>

                  {/* Carga Real */}
                  <div className="col-span-4 flex items-center">
                    <input
                      type="number"
                      step="any"
                      placeholder="--"
                      value={set.weight}
                      disabled={set.completed}
                      onChange={(e) =>
                        handleUpdateSetField(exIndex, setIndex, "weight", e.target.value)
                      }
                      className="w-full text-center py-1.5 rounded-lg bg-slate-950 border border-zinc-900 disabled:opacity-50 text-white font-mono text-xs focus:border-cyan-500 outline-none"
                    />
                  </div>

                  {/* Repetições Reais */}
                  <div className="col-span-4 flex items-center">
                    <input
                      type="number"
                      placeholder="--"
                      value={set.reps}
                      disabled={set.completed}
                      onChange={(e) =>
                        handleUpdateSetField(exIndex, setIndex, "reps", e.target.value)
                      }
                      className="w-full text-center py-1.5 rounded-lg bg-slate-950 border border-zinc-900 disabled:opacity-50 text-white font-mono text-xs focus:border-cyan-500 outline-none"
                    />
                  </div>

                  {/* Checkbox */}
                  <div className="col-span-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleSetComplete(exIndex, setIndex, exercise.restSeconds)
                      }
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        set.completed
                          ? "bg-emerald-500 border-emerald-500 text-slate-950"
                          : "border-zinc-800 hover:border-zinc-700 bg-slate-900"
                      }`}
                    >
                      <Check className={`w-4 h-4 stroke-[3px] ${set.completed ? "scale-100" : "scale-0"} transition-transform`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Barra de Ação Flutuante na Base */}
      <footer className="border-t border-zinc-900 bg-slate-950/90 backdrop-blur-md fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 p-4 flex gap-3">
        <button
          onClick={() => setIsFinishModalOpen(true)}
          className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
        >
          Finalizar Treino
        </button>
      </footer>

      {/* Temporizador de Descanso Flutuante Overlay */}
      {isResting && (
        <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-40 animate-slide-up">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/10 p-2.5 rounded-xl text-cyan-400 animate-pulse">
                <Zap className="w-5 h-5 fill-cyan-400/20" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Tempo de Descanso</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Prepare-se para a próxima série.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="font-mono text-2xl font-bold text-cyan-400">
                {restTime}s
              </div>
              <button
                onClick={() => setIsResting(false)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Barra de Progresso do Descanso */}
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-2 border border-zinc-900">
            <div
              className="bg-cyan-500 h-full transition-all duration-1000"
              style={{ width: `${(restTime / initialRestTime) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Modal Finalizar Treino */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs glass-card rounded-2xl p-6 shadow-2xl relative border border-zinc-800 text-center">
            
            <button
              onClick={() => setIsFinishModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-emerald-500/10 p-3 rounded-full w-fit mx-auto text-emerald-400 mb-4 animate-bounce">
              <Dumbbell className="w-6 h-6" />
            </div>

            <h3 className="font-display font-semibold text-base text-white mb-2">Concluir Treino</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Como você avalia a intensidade e o esforço geral deste treino hoje?
            </p>

            {finishError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-200 text-[10px]">
                {finishError}
              </div>
            )}

            {finishSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-xs">
                Treino concluído com sucesso! Bom descanso!
              </div>
            )}

            <div className="space-y-4">
              {/* Escala de RPE */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] text-zinc-500 font-semibold px-1">
                  <span>Leve</span>
                  <span>Extremo</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={satisfaction}
                  onChange={(e) => setSatisfaction(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-900 rounded-lg h-2"
                />
                <span className="font-mono text-xl font-bold text-emerald-400 mt-1 block">
                  {satisfaction} / 10
                </span>
              </div>

              <button
                onClick={handleFinishWorkout}
                disabled={finishLoading || finishSuccess}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-4"
              >
                {finishLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirmar Conclusão"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
