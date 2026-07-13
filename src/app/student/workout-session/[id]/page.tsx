"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dumbbell,
  Loader2,
  Clock,
  Check,
  ChevronLeft,
  Tv,
  X,
  Zap,
  Shuffle,
  Edit,
  Trophy,
  Play,
  Scale,
  Flame,
  Shield,
  Award,
  Sparkles,
  Crown,
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
  previousWorkoutSets?: { setNumber: number; weightUsed: number; repsPerformed: number }[];
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
  const setsDataRef = useRef(setsData);

  // Estado do Temporizador de Descanso
  const [restTime, setRestTime] = useState(0);
  const [initialRestTime, setInitialRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restEndTime, setRestEndTime] = useState<number | null>(null);

  // Chaves do localStorage para persistência do treino
  const STORAGE_KEY_SETS = `workout_sets_${planId}`;
  const STORAGE_KEY_REST = `workout_rest_end_${planId}`;

  // Persistir setsData no localStorage sempre que mudar
  const updateSetsData = useCallback((newData: Record<number, SetState[]> | ((prev: Record<number, SetState[]>) => Record<number, SetState[]>)) => {
    setSetsData((prev) => {
      const resolved = typeof newData === "function" ? newData(prev) : newData;
      setsDataRef.current = resolved;
      try {
        localStorage.setItem(`workout_sets_${planId}`, JSON.stringify(resolved));
      } catch (e) {
        // localStorage pode falhar em modo privado/sem espaço
      }
      return resolved;
    });
  }, [planId]);

  // Restaurar estado do rest timer do localStorage ao montar
  useEffect(() => {
    try {
      const savedRestEnd = localStorage.getItem(STORAGE_KEY_REST);
      if (savedRestEnd) {
        const endTime = Number(savedRestEnd);
        const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
        if (remaining > 0) {
          setRestEndTime(endTime);
          setInitialRestTime(remaining);
          setRestTime(remaining);
          setIsResting(true);
        } else {
          localStorage.removeItem(STORAGE_KEY_REST);
        }
      }
    } catch (e) {
      // Ignorar erros de localStorage
    }
  }, [STORAGE_KEY_REST]);

  // Re-sincronizar estado ao voltar de tela bloqueada (Android/iOS)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Re-sincronizar rest timer
        try {
          const savedRestEnd = localStorage.getItem(STORAGE_KEY_REST);
          if (savedRestEnd) {
            const endTime = Number(savedRestEnd);
            const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
            if (remaining > 0) {
              setRestEndTime(endTime);
              setRestTime(remaining);
              setIsResting(true);
            } else {
              setIsResting(false);
              setRestTime(0);
              setRestEndTime(null);
              localStorage.removeItem(STORAGE_KEY_REST);
            }
          }
        } catch (e) {}
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [STORAGE_KEY_REST]);

  // Estado para renomear exercício
  const [renamingExercise, setRenamingExercise] = useState<Exercise | null>(null);
  const [newCustomName, setNewCustomName] = useState("");
  const [savingRename, setSavingRename] = useState(false);

  // Estado de sugestão de alternativa
  const [alternativeSuggestion, setAlternativeSuggestion] = useState<{
    forExerciseIndex: number;
    name: string;
    equipment: string;
    description: string | null;
    videoUrl: string | null;
  } | null>(null);
  const [suggestingFor, setSuggestingFor] = useState<number | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);


  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url;
  };

  const handleSuggestAlternative = async (exerciseId: string, exIndex: number) => {
    setSuggestingFor(exIndex);
    setAlternativeSuggestion(null);
    try {
      const response = await fetch("/api/exercises/suggest-alternative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.suggestion) {
          setAlternativeSuggestion({
            forExerciseIndex: exIndex,
            ...data.suggestion,
          });
        } else {
          setAlternativeSuggestion(null);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar alternativa:", err);
    } finally {
      setSuggestingFor(null);
    }
  };

  // Modal de Finalização
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [satisfaction, setSatisfaction] = useState(6); // RPE padrão 6 (Intensa)
  const [finishLoading, setFinishLoading] = useState(false);
  const [finishSuccess, setFinishSuccess] = useState(false);
  const [finishError, setFinishError] = useState("");
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Cronômetro Geral do Treino (Timestamp-based)
  useEffect(() => {
    let startTime = localStorage.getItem(`workout_start_time_${planId}`);
    if (!startTime) {
      startTime = String(Date.now());
      localStorage.setItem(`workout_start_time_${planId}`, startTime);
    }
    
    const startTimestamp = Number(startTime);

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      setTotalSeconds(elapsed >= 0 ? elapsed : 0);
    };

    updateTimer(); // executado imediatamente

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [planId]);

  const handleRenameExercise = async () => {
    if (!renamingExercise) return;
    setSavingRename(true);
    try {
      const response = await fetch(`/api/student/workout-plan-exercises/${renamingExercise.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customName: newCustomName }),
      });
      if (response.ok) {
        if (plan) {
          const updatedExercises = plan.exercises.map((ex) =>
            ex.id === renamingExercise.id
              ? { ...ex, name: newCustomName.trim() !== "" ? newCustomName.trim() : renamingExercise.name }
              : ex
          );
          setPlan({ ...plan, exercises: updatedExercises });
        }
        setRenamingExercise(null);
      }
    } catch (err) {
      console.error("Erro ao renomear exercício:", err);
    } finally {
      setSavingRename(false);
    }
  };

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

        // Tentar restaurar dados salvos do localStorage (sobrevive bloqueio de tela)
        let restored = false;
        try {
          const savedSets = localStorage.getItem(`workout_sets_${planId}`);
          if (savedSets) {
            const parsed = JSON.parse(savedSets) as Record<number, SetState[]>;
            // Validar se a estrutura salva corresponde ao plano atual
            const isValid = data.exercises.every((_: Exercise, exIndex: number) =>
              parsed[exIndex] && Array.isArray(parsed[exIndex])
            );
            if (isValid) {
              updateSetsData(parsed);
              restored = true;
            }
          }
        } catch (e) {
          // Se falhar, inicializar normalmente
        }

        // Se não restaurou do localStorage, inicializar com valores recomendados
        if (!restored) {
          const initialSets: Record<number, SetState[]> = {};
          data.exercises.forEach((ex: Exercise, exIndex: number) => {
            initialSets[exIndex] = Array.from({ length: ex.sets }, () => ({
              weight: ex.recommendedWeight ? String(ex.recommendedWeight) : "",
              reps: isNaN(Number(ex.reps)) ? "10" : ex.reps, // fallbacks amigáveis
              completed: false,
            }));
          });
          updateSetsData(initialSets);
        }
      } catch (err) {
        console.error("Erro ao carregar treino:", err);
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId, router, updateSetsData]);

  const playRestAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);

      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6
        gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.25);
      }, 150);
    } catch (e) {
      console.warn("AudioContext não suportado ou bloqueado:", e);
    }
  };

  // Gerenciamento do Temporizador de Descanso (Timestamp-based)
  useEffect(() => {
    if (isResting && restEndTime !== null) {
      const updateRest = () => {
        const remaining = Math.max(0, Math.round((restEndTime - Date.now()) / 1000));
        if (remaining <= 0) {
          setIsResting(false);
          setRestTime(0);
          setRestEndTime(null);
          try { localStorage.removeItem(STORAGE_KEY_REST); } catch (e) {}
          playRestAlertSound();
        } else {
          setRestTime(remaining);
        }
      };

      updateRest();
      const timer = setInterval(updateRest, 1000);
      return () => clearInterval(timer);
    }
  }, [isResting, restEndTime]);

  const startRestTimer = (seconds: number) => {
    if (seconds <= 0) return;
    const endTime = Date.now() + seconds * 1000;
    setInitialRestTime(seconds);
    setRestTime(seconds);
    setRestEndTime(endTime);
    setIsResting(true);
    try {
      localStorage.setItem(STORAGE_KEY_REST, String(endTime));
    } catch (e) {
      // Ignorar
    }
  };

  const adjustRestTime = (amountSeconds: number) => {
    if (restEndTime === null) return;
    const newEndTime = restEndTime + (amountSeconds * 1000);
    if (newEndTime <= Date.now()) {
      setIsResting(false);
      setRestTime(0);
      setRestEndTime(null);
    } else {
      setRestEndTime(newEndTime);
      const newRemaining = Math.round((newEndTime - Date.now()) / 1000);
      setInitialRestTime((prev) => Math.max(prev, newRemaining));
      setRestTime(newRemaining);
    }
  };

  const handleToggleSetComplete = (exIndex: number, setIndex: number, restSeconds: number) => {
    const currentSets = [...(setsData[exIndex] || [])];
    const isCompleted = !currentSets[setIndex].completed;

    currentSets[setIndex] = {
      ...currentSets[setIndex],
      completed: isCompleted,
    };

    updateSetsData({
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
    updateSetsData({
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

    const logsPayload: any[] = [];

    plan.exercises.forEach((ex, exIndex) => {
      const exerciseSets = setsData[exIndex] || [];
      exerciseSets.forEach((set, setIndex) => {
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
      // Limpar todos os dados de sessão do localStorage
      localStorage.removeItem(`workout_start_time_${planId}`);
      localStorage.removeItem(`workout_sets_${planId}`);
      localStorage.removeItem(STORAGE_KEY_REST);
      if (data.newAchievements && data.newAchievements.length > 0) {
        setUnlockedAchievements(data.newAchievements);
        setShowCelebration(true);
        setIsFinishModalOpen(false);
      } else {
        setTimeout(() => {
          router.push("/student/dashboard");
        }, 1500);
      }
    } catch (err) {
      setFinishError("Erro de conexão ao salvar.");
    } finally {
      setFinishLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-[#94A3B8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
        <p className="text-sm">Carregando player de treino...</p>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="h-[100dvh] bg-[#F8FAFC] flex flex-col max-w-md mx-auto relative border-x border-[#E2E8F0] shadow-2xl text-[#0F172A]">
      
      {/* Header Fixo */}
      <header className="border-b border-[#E2E8F0] bg-white/95 z-30 px-4 py-4 flex items-center justify-between flex-none">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-white text-[#94A3B8]"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </Link>
          <div>
            <span className="text-[9px] font-bold text-[#2563EB] bg-[#00C2FF]/10 px-1.5 py-0.5 rounded block w-fit">
              Treino {plan.division}
            </span>
            <h2 className="text-sm font-bold text-[#0F172A] mt-1 leading-none">{plan.name}</h2>
          </div>
        </div>

        {/* Cronômetro Geral do Treino */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] font-mono text-xs font-semibold">
          <Clock className="w-4 h-4 text-emerald-655 animate-pulse" />
          {formatTime(totalSeconds)}
        </div>
      </header>

      {/* Main Exercises List (Mobile-First scroll) */}
      <main className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {plan.exercises.map((exercise, exIndex) => (
          <div
            key={exercise.id}
            className="glass-card rounded-2xl p-4 border border-[#E2E8F0] bg-white space-y-4 shadow-sm"
          >
            {/* Título do Exercício */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-[#0F172A] leading-tight">{exercise.name}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setRenamingExercise(exercise);
                      setNewCustomName(exercise.name);
                    }}
                    className="p-1 rounded text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#2563EB]/5 transition-colors cursor-pointer"
                    title="Renomear exercício para este treino"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[8px] font-bold bg-[#00C2FF]/10 text-[#2563EB] px-1.5 py-0.5 rounded">
                    {exercise.equipment}
                  </span>
                  <span className="text-[8px] font-bold bg-white border border-[#E2E8F0] text-[#94A3B8] px-1.5 py-0.5 rounded">
                    Descanso: {exercise.restSeconds}s
                  </span>
                  <span className="text-[8px] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                    {exercise.method}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSuggestAlternative(exercise.exerciseId, exIndex)}
                  disabled={suggestingFor === exIndex}
                  className="p-1.5 rounded-lg bg-white text-[#94A3B8] hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
                  title="Sugerir exercício alternativo"
                >
                  {suggestingFor === exIndex ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shuffle className="w-4 h-4" />
                  )}
                </button>
                {exercise.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveVideoUrl(exercise.videoUrl)}
                    className="p-1.5 rounded-lg bg-white text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#00C2FF]/10 transition-colors cursor-pointer"
                    title="Ver vídeo demonstrativo"
                  >
                    <Tv className="w-4 h-4" />
                  </button>
                )}

              </div>
            </div>

            {/* Painel de Sugestão de Alternativa */}
            {alternativeSuggestion && alternativeSuggestion.forExerciseIndex === exIndex && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-2 animate-slide-down">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">Sugestão de alternativa</p>
                    <p className="text-xs font-bold text-[#0F172A] mt-0.5">{alternativeSuggestion.name}</p>
                    <p className="text-[9px] text-[#94A3B8] mt-0.5">{alternativeSuggestion.equipment}</p>
                  </div>
                  <div className="flex gap-1">
                    {alternativeSuggestion.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setActiveVideoUrl(alternativeSuggestion.videoUrl)}
                        className="p-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Ver vídeo"
                      >
                        <Tv className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSuggestAlternative(exercise.exerciseId, exIndex)}
                      className="p-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                      title="Outra sugestão"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlternativeSuggestion(null)}
                      className="p-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                      title="Fechar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {alternativeSuggestion.description && (
                  <p className="text-[10px] text-amber-800/70 leading-relaxed">{alternativeSuggestion.description}</p>
                )}
              </div>
            )}

            {exercise.notes && (
              <p className="text-[10px] text-[#94A3B8] leading-relaxed bg-zinc-50 border border-[#E2E8F0] p-2 rounded-lg">
                <strong>Obs:</strong> {exercise.notes}
              </p>
            )}

            {/* Listagem de Séries do Exercício */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider text-center">
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
                      ? "bg-[#00C2FF]/10 border border-emerald-200/50"
                      : "bg-zinc-50/50 border border-transparent"
                  }`}
                >
                  {/* Número */}
                  <span className="col-span-2 font-semibold text-[#94A3B8] text-center">
                    {setIndex + 1}ª
                  </span>

                  {/* Carga Real */}
                  <div className="col-span-4 flex flex-col items-center">
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="--"
                      value={set.weight}
                      disabled={set.completed}
                      onChange={(e) =>
                        handleUpdateSetField(exIndex, setIndex, "weight", e.target.value)
                      }
                      className="w-full text-center py-1 rounded-lg bg-white border border-[#E2E8F0] disabled:opacity-50 text-[#0F172A] font-mono text-base sm:text-xs focus:border-[#2563EB] outline-none transition-all"
                    />
                    {/* ... */}
                    {(() => {
                      const prevSet = exercise.previousWorkoutSets?.[setIndex];
                      if (!prevSet) return null;
                      return (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSetField(exIndex, setIndex, "weight", String(prevSet.weightUsed))
                          }
                          className="text-[9px] text-amber-600 font-semibold mt-1 hover:underline cursor-pointer bg-amber-50 hover:bg-amber-100 px-1 rounded transition-colors"
                          title="Usar carga anterior"
                        >
                          Ant: {prevSet.weightUsed}kg
                        </button>
                      );
                    })()}
                  </div>

                  {/* Repetições Reais */}
                  <div className="col-span-4 flex flex-col items-center">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="--"
                      value={set.reps}
                      disabled={set.completed}
                      onChange={(e) =>
                        handleUpdateSetField(exIndex, setIndex, "reps", e.target.value)
                      }
                      className="w-full text-center py-1 rounded-lg bg-white border border-[#E2E8F0] disabled:opacity-50 text-[#0F172A] font-mono text-base sm:text-xs focus:border-[#2563EB] outline-none transition-all"
                    />
                    {/* ... */}
                    {(() => {
                      const prevSet = exercise.previousWorkoutSets?.[setIndex];
                      if (!prevSet) return null;
                      return (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSetField(exIndex, setIndex, "reps", String(prevSet.repsPerformed))
                          }
                          className="text-[9px] text-amber-600 font-semibold mt-1 hover:underline cursor-pointer bg-amber-50 hover:bg-amber-100 px-1 rounded transition-colors"
                          title="Usar repetições anteriores"
                        >
                          Ant: {prevSet.repsPerformed}
                        </button>
                      );
                    })()}
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
                          ? "bg-[#2563EB] border-[#2563EB] text-white"
                          : "border-[#E2E8F0] hover:border-zinc-350 bg-white"
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

      {/* Barra de Ação na Base */}
      <footer className="border-t border-[#E2E8F0] bg-white/90 backdrop-blur-md p-4 pb-[calc(1.0rem+safe-area-inset-bottom)] flex gap-3 z-30 flex-none">
        <button
          onClick={() => setIsFinishModalOpen(true)}
          className="flex-1 py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-[0.98]"
        >
          Finalizar Treino
        </button>
      </footer>

      {/* Temporizador de Descanso Flutuante Overlay */}
      {isResting && (
        <div className="absolute bottom-20 left-4 right-4 z-40 animate-slide-up">
          <div className="bg-white border border-[#2563EB]/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#00C2FF]/10 p-2.5 rounded-xl text-[#2563EB] animate-pulse">
                <Zap className="w-5 h-5 fill-[#2563EB]/10" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0F172A]">Tempo de Descanso</h4>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">Prepare-se para a próxima série.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustRestTime(-30)}
                className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-[#0F172A] text-[10px] font-bold transition-all cursor-pointer"
                title="Reduzir 30 segundos"
              >
                -30s
              </button>
              <div className="font-mono text-2xl font-bold text-[#2563EB]">
                {restTime}s
              </div>
              <button
                type="button"
                onClick={() => adjustRestTime(30)}
                className="px-2 py-1 rounded bg-[#2563EB] hover:bg-[#1E40AF] text-white text-[10px] font-bold transition-all cursor-pointer"
                title="Aumentar 30 segundos"
              >
                +30s
              </button>
              <button
                onClick={() => setIsResting(false)}
                className="p-1 rounded bg-white hover:bg-zinc-200 text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Barra de Progresso do Descanso */}
          <div className="w-full bg-white h-1.5 rounded-full overflow-hidden mt-2 border border-[#E2E8F0]/50">
            <div
              className="bg-[#2563EB] h-full transition-all duration-1000"
              style={{ width: `${(restTime / initialRestTime) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Modal Finalizar Treino */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl p-6 shadow-2xl relative border border-[#E2E8F0] text-center">
            
            <button
              onClick={() => setIsFinishModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-white text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-[#00C2FF]/10 p-3 rounded-full w-fit mx-auto text-[#2563EB] mb-4 animate-bounce">
              <Dumbbell className="w-6 h-6" />
            </div>

            <h3 className="font-display font-semibold text-base text-zinc-950 mb-2">Concluir Treino</h3>
            <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
              Como você avalia a intensidade e o esforço geral deste treino hoje?
            </p>

            {finishError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[10px]">
                {finishError}
              </div>
            )}

            {finishSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-[#00C2FF]/10 border border-[#2563EB]/30 text-[#1E40AF] text-xs">
                Treino concluído com sucesso! Bom descanso!
              </div>
            )}
            
            <div className="space-y-4">
              {/* Escala de RPE qualitativa */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block text-left">
                  Selecione a Intensidade:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Pouco Intensa", value: 3 },
                    { label: "Intensa", value: 6 },
                    { label: "Muito Intensa", value: 8 },
                    { label: "Exaustiva", value: 10 }
                  ].map((option) => {
                    const isSelected = satisfaction === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSatisfaction(option.value)}
                        className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? option.value === 3
                              ? "bg-blue-500 border-blue-500 text-white"
                              : option.value === 6
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : option.value === 8
                              ? "bg-amber-500 border-amber-500 text-white"
                              : "bg-red-500 border-red-500 text-white"
                            : `bg-white border-[#E2E8F0] text-[#475569] hover:bg-zinc-50`
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleFinishWorkout}
                disabled={finishLoading || finishSuccess}
                className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-4"
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

      {/* Modal de Celebração de Conquista Desbloqueada */}
      {showCelebration && (
        <div className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-zinc-950 rounded-3xl p-6 w-full max-w-sm border border-amber-500/30 shadow-2xl shadow-amber-500/10 text-center space-y-6 relative overflow-hidden animate-scale-up">
            
            {/* Sparkles / Brilho do Topo */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
            
            <div className="flex flex-col items-center pt-4">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 blur opacity-75 animate-pulse" />
                <div className="relative p-4 rounded-full bg-slate-800 border-2 border-amber-400/50 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              
              <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-300 tracking-wider mt-5">
                CONQUISTA ALCANÇADA!
              </h2>
              <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest mt-1">
                Jornada de Evolução
              </p>
            </div>

            {/* Listagem de Conquistas Obtidas */}
            <div className="space-y-4 py-2">
              {unlockedAchievements.map((achievement) => {
                const IconComponent = () => {
                  const props = { className: "w-8 h-8 text-amber-400" };
                  switch (achievement.icon) {
                    case "Play":
                      return <Play {...props} className={props.className + " fill-current"} />;
                    case "Zap":
                      return <Zap {...props} className={props.className + " fill-current"} />;
                    case "Scale":
                      return <Scale {...props} />;
                    case "Flame":
                      return <Flame {...props} className={props.className + " fill-current"} />;
                    case "ShieldAlert":
                      return <Shield {...props} />;
                    case "Crown":
                      return <Crown {...props} />;
                    case "Award":
                      return <Award {...props} />;
                    default:
                      return <Trophy {...props} />;
                  }
                };

                return (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-2xl bg-slate-850/60 border border-amber-500/20 flex flex-col items-center gap-3 relative"
                  >
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/20">
                      <IconComponent />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {achievement.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-normal mt-1 max-w-[240px] mx-auto">
                        {achievement.description}
                      </p>
                    </div>
                    
                    {/* Recompensa XP */}
                    <div className="mt-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-md shadow-amber-500/25">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      +{achievement.xpReward} XP Recompensa
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCelebration(false);
                router.push("/student/dashboard");
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer active:scale-[0.98]"
            >
              Continuar para o Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Modal para Renomear Exercício */}
      {renamingExercise && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-[#E2E8F0] shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Renomear Exercício</h3>
                <p className="text-xs text-[#94A3B8] mt-1">Dê um apelido ou mude o nome para esta ficha.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setRenamingExercise(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 text-[#94A3B8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <input
              type="text"
              value={newCustomName}
              onChange={(e) => setNewCustomName(e.target.value)}
              placeholder={renamingExercise.name}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:border-[#2563EB] outline-none transition-all"
            />
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRenamingExercise(null)}
                className="flex-1 py-2 px-4 rounded-xl border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRenameExercise}
                disabled={savingRename}
                className="flex-1 py-2 px-4 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1E40AF] disabled:opacity-50"
              >
                {savingRename ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Player de Vídeo */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-4 shadow-2xl relative border border-[#E2E8F0]">
            <button
              onClick={() => setActiveVideoUrl(null)}
              className="absolute -top-12 right-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <X className="w-4 h-4" /> Fechar
            </button>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
              {(() => {
                const embedUrl = getYouTubeEmbedUrl(activeVideoUrl);
                if (embedUrl && (embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be"))) {
                  return (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  );
                }
                return (
                  <video src={activeVideoUrl} controls className="w-full h-full" autoPlay />
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
