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
  Camera,
  GripHorizontal,
  Volume2,
  VolumeX,
} from "lucide-react";
import WorkoutVictoryModal from "@/components/WorkoutVictoryModal";


interface Exercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  description: string | null;
  videoUrl: string | null;
  gifUrl: string | null;
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

interface UserGroupOption {
  id: string;
  name: string;
  icon: string;
  membersCount: number;
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
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Estado do Som/Apito do Cronômetro (persistido no dispositivo)
  const [timerSoundEnabled, setTimerSoundEnabled] = useState(true);

  // Restaurar preferência de som do cronômetro do localStorage
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem("workout_timer_sound");
      if (savedSound !== null) {
        setTimerSoundEnabled(savedSound === "true");
      }
    } catch {}
  }, []);

  const toggleTimerSound = () => {
    setTimerSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("workout_timer_sound", String(next));
      } catch {}
      return next;
    });
  };

  // Posição flutuante móvel do cronômetro de descanso (Draggable)
  const [timerPos, setTimerPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingTimer, setIsDraggingTimer] = useState(false);
  const timerDragRef = useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, initX: 0, initY: 0, hasMoved: false });
  const timerContainerRef = useRef<HTMLDivElement>(null);

  // Restaurar posição salva do cronômetro do localStorage
  useEffect(() => {
    try {
      const savedPos = localStorage.getItem("workout_timer_pos");
      if (savedPos) {
        const parsed = JSON.parse(savedPos);
        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          const minX = 8;
          const maxX = Math.max(minX, window.innerWidth - 84 - 8);
          const minY = 56;
          const maxY = Math.max(minY, window.innerHeight - 118 - 16);
          setTimerPos({
            x: Math.min(Math.max(parsed.x, minX), maxX),
            y: Math.min(Math.max(parsed.y, minY), maxY),
          });
        }
      }
    } catch {}
  }, []);

  // Persistir posição quando alterada
  useEffect(() => {
    if (timerPos) {
      try {
        localStorage.setItem("workout_timer_pos", JSON.stringify(timerPos));
      } catch {}
    }
  }, [timerPos]);

  // Início do arrasto (Touch ou Mouse)
  const handleTimerDragStart = (clientX: number, clientY: number) => {
    if (!timerContainerRef.current) return;
    const rect = timerContainerRef.current.getBoundingClientRect();
    timerDragRef.current = {
      startX: clientX,
      startY: clientY,
      initX: rect.left,
      initY: rect.top,
      hasMoved: false,
    };
    setIsDraggingTimer(true);
  };

  // Movimentação do arrasto com limites de viewport
  useEffect(() => {
    if (!isDraggingTimer) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - timerDragRef.current.startX;
      const deltaY = clientY - timerDragRef.current.startY;

      if (Math.hypot(deltaX, deltaY) > 4) {
        timerDragRef.current.hasMoved = true;
      }

      const rawX = timerDragRef.current.initX + deltaX;
      const rawY = timerDragRef.current.initY + deltaY;

      const widgetWidth = 84;
      const widgetHeight = 118;
      const minX = 8;
      const maxX = Math.max(minX, window.innerWidth - widgetWidth - 8);
      const minY = 56;
      const maxY = Math.max(minY, window.innerHeight - widgetHeight - 16);

      const clampedX = Math.min(Math.max(rawX, minX), maxX);
      const clampedY = Math.min(Math.max(rawY, minY), maxY);

      setTimerPos({ x: clampedX, y: clampedY });
    };

    const handlePointerEnd = () => {
      setIsDraggingTimer(false);
      setTimeout(() => {
        timerDragRef.current.hasMoved = false;
      }, 80);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerEnd);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerEnd);
    window.addEventListener("touchcancel", handlePointerEnd);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerEnd);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerEnd);
      window.removeEventListener("touchcancel", handlePointerEnd);
    };
  }, [isDraggingTimer]);

  // Chaves do localStorage para persistência do treino
  const STORAGE_KEY_SETS = `workout_sets_${planId}`;
  const STORAGE_KEY_REST = `workout_rest_end_${planId}`;
  const STORAGE_KEY_PLAN_CACHE = `workout_plan_cache_${planId}`;

  // Persistir setsData no localStorage sempre que mudar
  const updateSetsData = useCallback((newData: Record<number, SetState[]> | ((prev: Record<number, SetState[]>) => Record<number, SetState[]>)) => {
    setSetsData((prev) => {
      const resolved = typeof newData === "function" ? newData(prev) : newData;
      setsDataRef.current = resolved;
      try {
        localStorage.setItem(STORAGE_KEY_SETS, JSON.stringify(resolved));
      } catch {
        // localStorage pode falhar em modo privado/sem espaço
      }
      return resolved;
    });
  }, [STORAGE_KEY_SETS]);

  // Restaurar plano e sets salvos imediatamente do cache local (Cold Reload instantâneo 0ms)
  useEffect(() => {
    if (!planId) return;
    try {
      const cachedPlanRaw = localStorage.getItem(STORAGE_KEY_PLAN_CACHE);
      if (cachedPlanRaw) {
        const cachedPlan = JSON.parse(cachedPlanRaw) as WorkoutPlan;
        if (cachedPlan && Array.isArray(cachedPlan.exercises) && cachedPlan.exercises.length > 0) {
          setPlan(cachedPlan);
          setLoading(false);
        }
      }

      const savedSetsRaw = localStorage.getItem(STORAGE_KEY_SETS);
      if (savedSetsRaw) {
        const parsedSets = JSON.parse(savedSetsRaw) as Record<number, SetState[]>;
        if (parsedSets && typeof parsedSets === "object") {
          setSetsData(parsedSets);
          setsDataRef.current = parsedSets;
        }
      }
    } catch (e) {
      console.warn("Erro ao restaurar cache inicial da sessão:", e);
    }
  }, [planId, STORAGE_KEY_PLAN_CACHE, STORAGE_KEY_SETS]);

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
    } catch {
      // Ignorar erros de localStorage
    }
  }, [STORAGE_KEY_REST]);

  // Re-sincronizar estado e persistir imediatamente ao sair/voltar (Android/iOS)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Salvar imediatamente no localStorage antes que o Android congele ou mate o processo
        try {
          localStorage.setItem(STORAGE_KEY_SETS, JSON.stringify(setsDataRef.current));
        } catch {}
      } else if (document.visibilityState === "visible") {
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
        } catch {}
      }
    };

    const handlePageHide = () => {
      try {
        localStorage.setItem(STORAGE_KEY_SETS, JSON.stringify(setsDataRef.current));
      } catch {}
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [STORAGE_KEY_REST, STORAGE_KEY_SETS]);

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
    gifUrl: string | null;
  } | null>(null);
  const [suggestingFor, setSuggestingFor] = useState<number | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);


  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const clean = url.trim();
    if (clean.toLowerCase().startsWith("javascript:") || clean.toLowerCase().startsWith("data:")) {
      return null;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = clean.match(regExp);
    if (match && match[2] && match[2].length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(match[2])) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return null;
  };

  const getMediaUrl = (url: string | null) => {
    if (!url) return "";
    const clean = url.trim();
    if (clean.toLowerCase().startsWith("javascript:") || clean.toLowerCase().startsWith("data:")) {
      return "";
    }
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
      return clean;
    }
    if (clean.startsWith("videos/") || clean.startsWith("images/")) {
      return `/api/media/${clean}`;
    }
    return "";
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

  // Modal de Finalização & Comprovação de Foto
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [workoutPhoto, setWorkoutPhoto] = useState<string | null>(null);
  const [satisfaction, setSatisfaction] = useState(6); // RPE padrão 6 (Intensa)
  const [finishLoading, setFinishLoading] = useState(false);
  const [finishError, setFinishError] = useState("");
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Grupos do aluno para compartilhamento do check-in
  const [userGroups, setUserGroups] = useState<UserGroupOption[]>([]);
  const [userGroupsLoading, setUserGroupsLoading] = useState(false);
  const [postToAllGroups, setPostToAllGroups] = useState(true);
  const [selectedTargetGroupIds, setSelectedTargetGroupIds] = useState<string[]>([]);

  // Modal de Vitória Épica
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [victoryData, setVictoryData] = useState<any | null>(null);

  // Modal de Cancelamento de Treino
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleCancelWorkout = () => {
    try {
      localStorage.removeItem(`workout_start_time_${planId}`);
      localStorage.removeItem(STORAGE_KEY_SETS);
      localStorage.removeItem(STORAGE_KEY_REST);
      localStorage.removeItem(STORAGE_KEY_PLAN_CACHE);
    } catch {}
    router.push("/student/dashboard");
  };

  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFinishError("Selecione um arquivo de imagem válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.75);
          setWorkoutPhoto(compressed);
          setFinishError("");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Cronômetro Geral do Treino (Timestamp-based)
  useEffect(() => {
    let startTime = localStorage.getItem(`workout_start_time_${planId}`);
    if (!startTime || startTime === "undefined" || startTime === "null") {
      startTime = String(Date.now());
      localStorage.setItem(`workout_start_time_${planId}`, startTime);
    }
    
    const startTimestamp = Number(startTime) || Date.now();

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      setTotalSeconds(elapsed >= 0 ? elapsed : 0);
    };

    updateTimer(); // executado imediatamente

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [planId]);

  // Buscar grupos do aluno logado
  useEffect(() => {
    const fetchUserGroups = async () => {
      setUserGroupsLoading(true);
      try {
        const res = await fetch("/api/student/groups");
        if (res.ok) {
          const data = await res.json();
          const groups: UserGroupOption[] = (data.groups || []).map((g: { id: string; name: string; icon?: string; membersCount?: number }) => ({
            id: g.id,
            name: g.name,
            icon: g.icon || "🏋️",
            membersCount: g.membersCount || 0,
          }));
          setUserGroups(groups);
          setSelectedTargetGroupIds(groups.map((g: UserGroupOption) => g.id));
        }
      } catch (err) {
        console.error("Erro ao carregar grupos do aluno:", err);
      } finally {
        setUserGroupsLoading(false);
      }
    };
    fetchUserGroups();
  }, []);

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
          const updatedPlan = { ...plan, exercises: updatedExercises };
          setPlan(updatedPlan);
          try {
            localStorage.setItem(STORAGE_KEY_PLAN_CACHE, JSON.stringify(updatedPlan));
          } catch {}
        }
        setRenamingExercise(null);
      }
    } catch (err) {
      console.error("Erro ao renomear exercício:", err);
    } finally {
      setSavingRename(false);
    }
  };

  // Buscar plano de treino e mesclar de forma não-destrutiva com o progresso do aluno
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/student/workout-plans/${planId}`, { cache: "no-store" });
        if (!response.ok) {
          // Se a API falhar (ex: queda de rede no Android ou timeout), só redireciona se NÃO tiver cache local
          const hasLocalCache = !!localStorage.getItem(STORAGE_KEY_PLAN_CACHE);
          if (!hasLocalCache) {
            router.push("/student/dashboard");
          }
          return;
        }
        const data: WorkoutPlan = await response.json();
        setPlan(data);
        try {
          localStorage.setItem(STORAGE_KEY_PLAN_CACHE, JSON.stringify(data));
        } catch {}

        // Tentar obter dados salvos do localStorage
        let savedSets: Record<number, SetState[]> = {};
        try {
          const rawSets = localStorage.getItem(STORAGE_KEY_SETS);
          if (rawSets) {
            savedSets = JSON.parse(rawSets) as Record<number, SetState[]>;
          }
        } catch {}

        // Merge NÃO-DESTRUTIVO: cada série salva pelo aluno tem prioridade absoluta.
        // NUNCA descartar o progresso existente com validações do tipo "all-or-nothing".
        const mergedSets: Record<number, SetState[]> = {};
        data.exercises.forEach((ex: Exercise, exIndex: number) => {
          const savedForEx = savedSets[exIndex] || (savedSets as any)[String(exIndex)];
          mergedSets[exIndex] = Array.from({ length: ex.sets }, (_, setIndex) => {
            const existingSet = savedForEx?.[setIndex];
            if (existingSet) {
              return {
                weight: existingSet.weight !== undefined && existingSet.weight !== null
                  ? String(existingSet.weight)
                  : (ex.recommendedWeight ? String(ex.recommendedWeight) : ""),
                reps: existingSet.reps !== undefined && existingSet.reps !== null
                  ? String(existingSet.reps)
                  : (isNaN(Number(ex.reps)) ? "10" : String(ex.reps)),
                completed: Boolean(existingSet.completed),
              };
            }
            return {
              weight: ex.recommendedWeight ? String(ex.recommendedWeight) : "",
              reps: isNaN(Number(ex.reps)) ? "10" : ex.reps,
              completed: false,
            };
          });
        });

        updateSetsData(mergedSets);
      } catch (err) {
        console.error("Erro ao carregar treino da API (utilizando dados locais se disponíveis):", err);
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlan();
    }
  }, [planId, router, updateSetsData, STORAGE_KEY_PLAN_CACHE, STORAGE_KEY_SETS]);

  const playRestAlertSound = () => {
    // Alerta tátil: vibração esportiva sincronizada (dois pulsos: 150ms toque, 80ms pausa, 350ms chamada)
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([150, 80, 350]);
      }
    } catch {}

    // Se o som estiver desativado pelo aluno, mantém o cronômetro em silêncio
    if (!timerSoundEnabled) return;

    try {
      const AudioContextClass =
        typeof window !== "undefined"
          ? window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
          : undefined;

      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      // Função geradora de toque de apito esportivo (dual tone com trinado característico)
      const playWhistleBurst = (startTime: number, duration: number) => {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Frequências ressonantes de apito esportivo / árbitro
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(2850, startTime);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(3120, startTime);

        // Modulador rápido de frequência (32Hz) que emula o vibrato da bolinha interna do apito
        const flutterOsc = audioCtx.createOscillator();
        const flutterGain = audioCtx.createGain();
        flutterOsc.frequency.setValueAtTime(32, startTime);
        flutterGain.gain.setValueAtTime(90, startTime);
        flutterOsc.connect(osc1.frequency);
        flutterOsc.connect(osc2.frequency);

        // Envelope com ataque rápido e decaimento acústico natural
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.setValueAtTime(0.25, startTime + duration - 0.04);
        gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        flutterOsc.start(startTime);
        osc1.start(startTime);
        osc2.start(startTime);

        flutterOsc.stop(startTime + duration);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      // Padrão de apito duplo esportivo clássico ("Pi - Piii!")
      playWhistleBurst(now, 0.15); // Primeiro toque rápido
      playWhistleBurst(now + 0.23, 0.42); // Segundo toque firme de reinício
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
          try { localStorage.removeItem(STORAGE_KEY_REST); } catch {}
          playRestAlertSound();
        } else {
          setRestTime(remaining);
        }
      };

      updateRest();
      const timer = setInterval(updateRest, 1000);
      return () => clearInterval(timer);
    }
  }, [isResting, restEndTime, STORAGE_KEY_REST]);

  const startRestTimer = (seconds?: number | null) => {
    const validSeconds = seconds && Number(seconds) > 0 ? Number(seconds) : 60;
    const endTime = Date.now() + validSeconds * 1000;
    setInitialRestTime(validSeconds);
    setRestTime(validSeconds);
    setRestEndTime(endTime);
    setIsResting(true);
    try {
      localStorage.setItem(STORAGE_KEY_REST, String(endTime));
    } catch {
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

  const handleToggleSetComplete = (exIndex: number, setIndex: number, restSeconds?: number | null) => {
    const currentSets = setsDataRef.current[exIndex] || setsData[exIndex] || [];
    const isCurrentlyCompleted = Boolean(currentSets[setIndex]?.completed);
    const nextCompleted = !isCurrentlyCompleted;

    updateSetsData((prev) => {
      const sets = [...(prev[exIndex] || [])];
      if (!sets[setIndex]) return prev;
      sets[setIndex] = {
        ...sets[setIndex],
        completed: nextCompleted,
      };
      return {
        ...prev,
        [exIndex]: sets,
      };
    });

    // Se marcou como completo, inicia o descanso do exercício imediatamente
    if (nextCompleted) {
      startRestTimer(restSeconds || 60);
    }
  };

  const handleUpdateSetField = (exIndex: number, setIndex: number, field: keyof SetState, value: any) => {
    updateSetsData((prev) => {
      const currentSets = [...(prev[exIndex] || [])];
      if (!currentSets[setIndex]) return prev;
      currentSets[setIndex] = {
        ...currentSets[setIndex],
        [field]: value,
      };
      return {
        ...prev,
        [exIndex]: currentSets,
      };
    });
  };

  // Formatar tempo total
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Formatar tempo do descanso no cronômetro redondo
  const formatRestDisplay = (totalSecs: number) => {
    if (totalSecs >= 60) {
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      return `${mins}:${String(secs).padStart(2, "0")}`;
    }
    return `${totalSecs}s`;
  };

  // Salvar sessão de treino
  const handleFinishWorkout = async () => {
    if (!plan) return;
    setFinishLoading(true);
    setFinishError("");

    const logsPayload: any[] = [];

    plan.exercises.forEach((ex, exIndex) => {
      const exerciseSets = setsData[exIndex] || [];
      exerciseSets.forEach((set, setIndex) => {
        if (set.completed) {
          const parsedWeight = parseFloat(String(set.weight).replace(',', '.'));
          const parsedReps = parseInt(String(set.reps), 10);
          
          logsPayload.push({
            exerciseId: ex.exerciseId,
            setNumber: setIndex + 1,
            weightUsed: isNaN(parsedWeight) ? 0 : Math.max(0, parsedWeight),
            repsPerformed: isNaN(parsedReps) ? 0 : Math.max(0, parsedReps),
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

    if (!workoutPhoto) {
      setFinishError("A foto de comprovação do treino é obrigatória para validar a sessão!");
      setFinishLoading(false);
      return;
    }

    let targetGroupIdsPayload: string[] = ["ALL"];
    if (!postToAllGroups) {
      if (selectedTargetGroupIds.length === 0 && userGroups.length > 0) {
        setFinishError("Selecione pelo menos um grupo para compartilhar ou marque 'Postar para todos'.");
        setFinishLoading(false);
        return;
      }
      targetGroupIdsPayload = selectedTargetGroupIds;
    }

    try {
      const response = await fetch("/api/student/workout-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMs: Math.min(Math.max(0, Math.floor(totalSeconds * 1000)), 86400000),
          satisfaction: Number(satisfaction),
          photoUrl: workoutPhoto,
          targetGroupIds: targetGroupIdsPayload,
          logs: logsPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          console.error("Validation errors:", data.errors);
          setFinishError("Erro nos dados inseridos.");
        } else {
          setFinishError(data.error || "Erro ao salvar o treino.");
        }
        return;
      }

      // Limpar dados de sessão local e registrar última ficha concluída
      localStorage.removeItem(`workout_start_time_${planId}`);
      localStorage.removeItem(STORAGE_KEY_SETS);
      localStorage.removeItem(STORAGE_KEY_REST);
      localStorage.removeItem(STORAGE_KEY_PLAN_CACHE);
      try {
        localStorage.setItem("tf_last_completed_plan_id", planId);
      } catch {}

      // Dados para o modal de vitória
      setVictoryData({
        volumeKg: data.volumeKg || 0,
        tonnageComparison: data.tonnageComparison,
        photoUrl: workoutPhoto,
        xpEarned: data.xpEarned || 300,
        totalXp: data.totalXp,
        level: data.level,
        levelTitle: data.levelTitle,
        prsBeaten: data.prsBeaten || [],
        newAchievements: data.newAchievements || [],
      });

      if (data.newAchievements && data.newAchievements.length > 0) {
        setUnlockedAchievements(data.newAchievements);
      }

      setIsFinishModalOpen(false);
      setIsVictoryModalOpen(true);
    } catch {
      setFinishError("Erro de conexão ao salvar.");
    } finally {
      setFinishLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
        {/* Círculo visual que se completa (Progress Ring) */}
        <div className="relative w-18 h-18 flex items-center justify-center mb-4">
          <svg className="w-full h-full" viewBox="0 0 72 72">
            <defs>
              <linearGradient id="workout-loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#00C2FF" />
              </linearGradient>
            </defs>
            {/* Pista de fundo translúcida */}
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="4"
              className="opacity-70"
            />
            {/* Arco que se completa continuamente */}
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="url(#workout-loading-gradient)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray="188.5"
              className="animate-ring-fill"
            />
          </svg>

          {/* Ícone esportivo centralizado com micro-pulso */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-xl bg-blue-50/90 text-blue-600 flex items-center justify-center shadow-2xs">
              <Dumbbell className="w-4.5 h-4.5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Texto solicitado pelo usuário */}
        <p className="text-sm font-bold text-slate-800 tracking-tight">
          Carregando treino.
        </p>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="h-[100dvh] bg-[#F8FAFC] flex flex-col max-w-md mx-auto relative border-x border-[#E2E8F0] shadow-2xl text-[#0F172A]">
      
      {/* Header Fixo com suporte a Safe Area */}
      <header 
        className="border-b border-[#E2E8F0] bg-white/95 z-30 px-4 pb-4 flex items-center justify-between flex-none pt-safe"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
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

        {/* Controles de Cabeçalho: Cancelar e Cronômetro Geral à Direita */}
        <div className="flex items-center gap-2">
          {/* Botão Cancelar Treino */}
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="p-1.5 px-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
            title="Cancelar treino e descartar sessão"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cancelar</span>
          </button>

          {/* Cronômetro Geral do Treino (à direita) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] font-mono text-xs font-semibold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            {formatTime(totalSeconds)}
          </div>
        </div>
      </header>

      {/* Main Exercises List (Mobile-First scroll com folga inferior para widgets) */}
      <main
        className="flex-1 px-4 py-6 space-y-6 overflow-y-auto pb-40"
        onFocus={() => setIsInputFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsInputFocused(false);
          }
        }}
      >
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
                {(exercise.videoUrl || exercise.gifUrl) && (
                  <button
                    type="button"
                    onClick={() => setActiveVideoUrl(exercise.gifUrl || exercise.videoUrl || "")}
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
                    {(alternativeSuggestion.videoUrl || alternativeSuggestion.gifUrl) && (
                      <button
                        type="button"
                        onClick={() => setActiveVideoUrl(alternativeSuggestion.gifUrl || alternativeSuggestion.videoUrl || "")}
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

      {/* Cronômetro Redondo Flutuante Móvel (Stopwatch Ring Draggable) */}
      {isResting && (
        <div
          ref={timerContainerRef}
          style={
            timerPos
              ? { left: `${timerPos.x}px`, top: `${timerPos.y}px`, bottom: "auto", right: "auto" }
              : undefined
          }
          className={`fixed ${timerPos ? "" : "bottom-24 left-4"} z-40 flex flex-col items-center select-none touch-none animate-slide-up transition-shadow duration-200 ${
            isDraggingTimer ? "scale-105 opacity-95 cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={(e) => {
            if (e.button === 0) {
              handleTimerDragStart(e.clientX, e.clientY);
            }
          }}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleTimerDragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
        >
          {/* Botões Satélites (+30s, Som/Mudo, Alça de arrasto e Pular) */}
          <div className="flex items-center gap-1.5 mb-1.5 animate-fade-in">
            <button
              type="button"
              onClick={() => adjustRestTime(30)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="px-2.5 py-1 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white text-[11px] font-bold shadow-lg shadow-blue-500/25 border border-blue-400/40 cursor-pointer flex items-center gap-1 transition-transform"
              title="Adicionar 30 segundos de descanso"
            >
              <span>+30s</span>
            </button>
            <button
              type="button"
              onClick={toggleTimerSound}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className={`w-6 h-6 rounded-full flex items-center justify-center shadow border transition-all cursor-pointer active:scale-90 ${
                timerSoundEnabled
                  ? "bg-blue-600/90 hover:bg-blue-500 text-white border-blue-400/40 shadow-blue-500/30"
                  : "bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border-white/10"
              }`}
              title={
                timerSoundEnabled
                  ? "Apito ativado (Toque para silenciar)"
                  : "Apito silenciado (Toque para ativar som)"
              }
            >
              {timerSoundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
            <div
              className="w-5 h-5 flex items-center justify-center text-slate-400 opacity-60 hover:opacity-100 cursor-grab active:cursor-grabbing"
              title="Arraste para mover pela tela"
            >
              <GripHorizontal className="w-3.5 h-3.5" />
            </div>
            <button
              type="button"
              onClick={() => setIsResting(false)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-6 h-6 rounded-full bg-slate-900/90 hover:bg-slate-800 active:scale-90 text-slate-400 hover:text-white flex items-center justify-center shadow border border-white/10 cursor-pointer transition-colors"
              title="Pular descanso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Círculo do Cronômetro com Anel SVG (Levemente maior: 76px x 76px) */}
          <button
            type="button"
            onClick={() => {
              if (timerDragRef.current.hasMoved) return;
              setIsResting(false);
            }}
            className={`relative w-[76px] h-[76px] rounded-full bg-slate-950/95 backdrop-blur-xl border shadow-2xl flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition-all duration-300 ${
              restTime <= 5
                ? "border-amber-400/80 shadow-amber-500/25 animate-pulse ring-2 ring-amber-400/40"
                : isDraggingTimer
                ? "border-[#00C2FF] ring-2 ring-[#00C2FF]/40 shadow-blue-500/30"
                : "border-white/15 hover:border-[#00C2FF]/60 hover:shadow-blue-500/20"
            }`}
            title="Toque para pular o descanso ou arraste para mover"
          >
            {/* Anel de Progresso SVG */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 76 76">
              <defs>
                <linearGradient id="rest-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00C2FF" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
              {/* Trilha inativa */}
              <circle
                cx="38"
                cy="38"
                r="32"
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="4"
              />
              {/* Arco de progresso ativo */}
              <circle
                cx="38"
                cy="38"
                r="32"
                fill="none"
                stroke={restTime <= 5 ? "#F59E0B" : "url(#rest-ring-grad)"}
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={
                  initialRestTime > 0
                    ? (2 * Math.PI * 32) * (1 - Math.max(0, Math.min(1, restTime / initialRestTime)))
                    : 0
                }
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Tempo Digital no Centro */}
            <div className="relative z-10 flex flex-col items-center justify-center leading-none text-center">
              <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400 mb-0.5 group-hover:hidden">
                Tempo
              </span>
              <span className="text-[9px] font-bold tracking-wider uppercase text-red-400 mb-0.5 hidden group-hover:inline">
                Pular
              </span>
              <span
                className={`font-mono font-black text-base tracking-tight transition-colors ${
                  restTime <= 5 ? "text-amber-400" : "text-white"
                }`}
              >
                {formatRestDisplay(restTime)}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Modal de Confirmação de Cancelamento de Treino */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <X className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Cancelar Treino?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Se cancelar agora, as cargas e séries registradas nesta sessão serão descartadas.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelWorkout}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
              >
                Sim, Cancelar Treino
              </button>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Continuar Treinando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Finalizar Treino com Foto Obrigatória e Escolha de Grupos */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative border border-[#E2E8F0] text-center max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsFinishModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-xl hover:bg-slate-100 text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-[#00C2FF]/10 p-3 rounded-full w-fit mx-auto text-[#2563EB] mb-3 animate-bounce">
              <Dumbbell className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-lg text-zinc-950 mb-1">Concluir Treino</h3>
            <p className="text-xs text-[#94A3B8] mb-5 leading-relaxed">
              Tire sua foto de check-in para comprovar seu treino e registrar seus pontos!
            </p>

            {finishError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-left">
                {finishError}
              </div>
            )}

            <div className="space-y-4 text-left">
              {/* Seção 1: Foto Comprobatória (Obrigatória) */}
              <div>
                <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block mb-1.5">
                  1. Foto de Comprovação (Obrigatória):
                </label>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoCapture}
                />

                {workoutPhoto ? (
                  <div className="relative w-full max-w-[260px] sm:max-w-[300px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-950 shadow-md flex items-center justify-center">
                    <img
                      src={workoutPhoto}
                      alt="Foto de Comprovação"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3" /> Foto Anexada
                    </div>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Tirar Outra
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-[#2563EB]/40 bg-[#2563EB]/5 hover:bg-[#2563EB]/10 transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer group"
                  >
                    <div className="p-3 rounded-full bg-[#2563EB]/10 text-[#2563EB] group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">Tirar Selfie / Foto do Treino</p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">Formato vertical • Câmera ou galeria</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Seção 2: Intensidade (RPE) */}
              <div>
                <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block mb-1.5">
                  2. Intensidade do Treino:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Pouco Intensa", value: 3 },
                    { label: "Intensa", value: 6 },
                    { label: "Muito Intensa", value: 8 },
                    { label: "Exaustiva", value: 10 },
                  ].map((option) => {
                    const isSelected = satisfaction === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSatisfaction(option.value)}
                        className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? option.value === 3
                              ? "bg-blue-500 border-blue-500 text-white"
                              : option.value === 6
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : option.value === 8
                              ? "bg-amber-500 border-amber-500 text-white"
                              : "bg-red-500 border-red-500 text-white"
                            : `bg-white border-[#E2E8F0] text-[#475569] hover:bg-slate-50`
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seção 3: Compartilhar Check-in nos Grupos */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block">
                    3. Compartilhar Check-in nos Grupos:
                  </label>
                  {userGroups.length > 0 && (
                    <span className="text-[10px] text-[#2563EB] font-bold">
                      {userGroups.length} {userGroups.length === 1 ? "grupo" : "grupos"}
                    </span>
                  )}
                </div>

                {userGroupsLoading ? (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-2 text-xs text-[#94A3B8]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                    <span>Carregando seus grupos...</span>
                  </div>
                ) : userGroups.length === 0 ? (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-xs text-[#64748B]">
                      Você ainda não participa de grupos. O check-in ficará salvo no seu perfil!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Opção: Todos os Grupos */}
                    <button
                      type="button"
                      onClick={() => {
                        setPostToAllGroups(true);
                        setSelectedTargetGroupIds(userGroups.map((g: UserGroupOption) => g.id));
                      }}
                      className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        postToAllGroups
                          ? "bg-blue-50/70 border-[#2563EB] text-[#0F172A] shadow-2xs"
                          : "bg-white border-slate-200 text-[#64748B] hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          postToAllGroups ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-slate-300 bg-white"
                        }`}>
                          {postToAllGroups && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold block leading-tight text-[#0F172A]">
                            Postar para todos os meus grupos
                          </span>
                          <span className="text-[10px] text-[#64748B] leading-none">
                            Todos os seus amigos e turmas verão o check-in
                          </span>
                        </div>
                      </div>
                      <span className="text-xs">🌐</span>
                    </button>

                    {/* Opção: Escolher Grupos Específicos */}
                    <button
                      type="button"
                      onClick={() => setPostToAllGroups(false)}
                      className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        !postToAllGroups
                          ? "bg-blue-50/70 border-[#2563EB] text-[#0F172A] shadow-2xs"
                          : "bg-white border-slate-200 text-[#64748B] hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          !postToAllGroups ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-slate-300 bg-white"
                        }`}>
                          {!postToAllGroups && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold block leading-tight text-[#0F172A]">
                            Escolher grupos específicos
                          </span>
                          <span className="text-[10px] text-[#64748B] leading-none">
                            Selecione apenas as turmas desejadas
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#2563EB]">
                        {!postToAllGroups ? `${selectedTargetGroupIds.length}/${userGroups.length}` : ""}
                      </span>
                    </button>

                    {/* Lista de Checkboxes de Grupos quando customizado */}
                    {!postToAllGroups && (
                      <div className="p-2 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-1.5 max-h-36 overflow-y-auto pr-1 animate-in fade-in duration-150">
                        {userGroups.map((group: UserGroupOption) => {
                          const isChecked = selectedTargetGroupIds.includes(group.id);
                          return (
                            <div
                              key={group.id}
                              onClick={() => {
                                setSelectedTargetGroupIds((prev: string[]) =>
                                  prev.includes(group.id)
                                    ? prev.filter((id: string) => id !== group.id)
                                    : [...prev, group.id]
                                );
                              }}
                              className={`p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border ${
                                isChecked
                                  ? "bg-white border-blue-200 shadow-2xs"
                                  : "bg-transparent border-transparent hover:bg-slate-100/70"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base shrink-0">{group.icon || "🏋️"}</span>
                                <span className="text-xs font-semibold text-[#0F172A] truncate">
                                  {group.name}
                                </span>
                              </div>
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                isChecked
                                  ? "bg-[#2563EB] border-[#2563EB] text-white"
                                  : "border-slate-300 bg-white"
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botão de Finalização */}
              <button
                onClick={handleFinishWorkout}
                disabled={finishLoading || !workoutPhoto}
                className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2 shadow-lg shadow-blue-500/20"
              >
                {finishLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : workoutPhoto ? (
                  "Concluir e Salvar Treino"
                ) : (
                  "Tire uma foto para concluir"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vitória Épica */}
      {isVictoryModalOpen && victoryData && (
        <WorkoutVictoryModal
          isOpen={isVictoryModalOpen}
          onClose={() => {
            setIsVictoryModalOpen(false);
            router.push("/student/dashboard");
          }}
          volumeKg={victoryData.volumeKg}
          tonnageComparison={victoryData.tonnageComparison}
          photoUrl={victoryData.photoUrl}
          xpEarned={victoryData.xpEarned}
          totalXp={victoryData.totalXp}
          level={victoryData.level}
          levelTitle={victoryData.levelTitle}
          prsBeaten={victoryData.prsBeaten}
          newAchievements={victoryData.newAchievements}
        />
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
                if (activeVideoUrl.endsWith('.gif')) {
                  return (
                    <img src={getMediaUrl(activeVideoUrl)} alt="Execução do exercício" className="w-full h-full object-contain bg-black" />
                  );
                }
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
                  <video src={getMediaUrl(activeVideoUrl)} controls className="w-full h-full" autoPlay />
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
