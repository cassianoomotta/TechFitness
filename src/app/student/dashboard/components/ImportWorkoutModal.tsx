"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  Trash2,
  Dumbbell,
  Check,
  MessageSquare,
  ArrowLeft,
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export interface ParsedExercise {
  order: number;
  extractedName: string;
  exerciseId: string | null;
  name: string;
  customName: string | null;
  muscleGroup: string;
  equipment: string;
  gifUrl: string | null;
  videoUrl: string | null;
  confidence: number;
  sets: number;
  reps: string;
  restSeconds: number;
  method: string;
  notes: string;
  selected?: boolean;
}

export interface ParsedPlan {
  name: string;
  division: string;
  description: string;
  weekDays: string[];
  exercises: ParsedExercise[];
}

export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  gifUrl: string | null;
  videoUrl: string | null;
  description?: string | null;
}

interface ImportWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanImported?: () => void;
  onPlanSelectedForTrainer?: (plan: ParsedPlan) => void;
  targetStudentId?: string;
}

const MUSCLE_FILTER_OPTIONS = [
  "Todos",
  "Peito",
  "Costas",
  "Pernas",
  "Ombros",
  "Braços",
  "Core",
  "Cardio",
  "Outros",
];

export default function ImportWorkoutModal({
  isOpen,
  onClose,
  onPlanImported,
  onPlanSelectedForTrainer,
  targetStudentId,
}: ImportWorkoutModalProps) {
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [pastedText, setPastedText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [parsedPlans, setParsedPlans] = useState<ParsedPlan[]>([]);
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [archivePrevious, setArchivePrevious] = useState(false);

  // Estados da Biblioteca de Exercícios
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [libraryExercises, setLibraryExercises] = useState<LibraryExercise[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerMuscle, setPickerMuscle] = useState("Todos");
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Estados de Ordenação e Animação Deslizante
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [animatingDirection, setAnimatingDirection] = useState<"up" | "down" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const parsedPlan = parsedPlans[activePlanIndex] || null;

  // Carregar exercícios da biblioteca quando o seletor for aberto ou filtros mudarem
  useEffect(() => {
    if (!isPickerOpen) return;

    let isMounted = true;
    const fetchLibrary = async () => {
      setLibraryLoading(true);
      try {
        const params = new URLSearchParams();
        if (pickerSearch.trim()) {
          params.append("search", pickerSearch.trim());
        }
        if (pickerMuscle && pickerMuscle !== "Todos") {
          params.append("muscle", pickerMuscle);
        }
        const res = await fetch(`/api/exercises?${params.toString()}`);
        if (res.ok && isMounted) {
          const data: LibraryExercise[] = await res.json();
          setLibraryExercises(data);
        }
      } catch (err) {
        console.error("Erro ao carregar exercícios:", err);
      } finally {
        if (isMounted) setLibraryLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchLibrary();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isPickerOpen, pickerSearch, pickerMuscle]);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    if (!selectedFile) return;

    if (selectedFile.size > 12 * 1024 * 1024) {
      setError("O arquivo selecionado é maior que o limite de 12MB.");
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleProcess = async () => {
    setError(null);

    const formData = new FormData();

    if (inputMode === "file") {
      if (!file) {
        setError("Selecione um arquivo de foto ou PDF primeiro.");
        return;
      }
      formData.append("file", file);
      setLoadingStep("Lendo arquivo com Inteligência Artificial...");
    } else {
      if (!pastedText.trim()) {
        setError("Cole o texto do seu treino antes de continuar.");
        return;
      }
      formData.append("text", pastedText.trim());
      setLoadingStep("Estruturando exercícios e séries...");
    }

    setLoading(true);

    try {
      setTimeout(() => {
        setLoadingStep("Identificando exercícios, séries e repetições...");
      }, 1000);

      setTimeout(() => {
        setLoadingStep("Vinculando exercícios e movimentos...");
      }, 2000);

      const response = await fetch("/api/student/workout-plans/import-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao processar treino com a IA.");
      }

      if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
        const mappedPlans: ParsedPlan[] = data.plans.map((p: ParsedPlan) => ({
          ...p,
          exercises: (p.exercises || []).map((ex: ParsedExercise) => ({
            ...ex,
            selected: true,
          })),
        }));
        setParsedPlans(mappedPlans);
        setActivePlanIndex(0);
      } else if (data.plan) {
        const mappedPlan: ParsedPlan = {
          ...data.plan,
          exercises: (data.plan.exercises || []).map((ex: ParsedExercise) => ({
            ...ex,
            selected: true,
          })),
        };
        setParsedPlans([mappedPlan]);
        setActivePlanIndex(0);
      } else {
        throw new Error("Não foi possível extrair os exercícios fornecidos.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao processar.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const totalSelectedAcrossAll = parsedPlans.reduce(
    (sum, p) => sum + p.exercises.filter((ex) => ex.selected !== false).length,
    0
  );

  const handleSavePlan = async () => {
    if (parsedPlans.length === 0) return;
    const current = parsedPlans[activePlanIndex];
    if (!current || current.exercises.length === 0) {
      setError("Adicione ao menos um exercício antes de salvar.");
      return;
    }

    // Filtrar apenas os exercícios que estão marcados para importação
    const exercisesToSave = current.exercises.filter((ex) => ex.selected !== false);
    const hasAnySelected = parsedPlans.length > 1
      ? totalSelectedAcrossAll > 0
      : exercisesToSave.length > 0;

    if (!hasAnySelected) {
      setError("Selecione ao menos um exercício marcado antes de salvar.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const endpoint = targetStudentId
        ? `/api/trainer/students/${targetStudentId}/workout-plans`
        : "/api/student/workout-plans";

      const payload = parsedPlans.length > 1 ? {
        archivePrevious,
        plans: parsedPlans
          .map((p) => ({
            name: p.name,
            division: p.division,
            description: p.description,
            weekDays: p.weekDays,
            exercises: p.exercises
              .filter((ex) => ex.selected !== false)
              .map((ex) => ({
                exerciseId: ex.exerciseId,
                name: ex.name,
                customName: ex.customName,
                muscleGroup: ex.muscleGroup,
                equipment: ex.equipment,
                sets: ex.sets,
                reps: ex.reps,
                restSeconds: ex.restSeconds,
                method: ex.method,
                notes: ex.notes,
              })),
          }))
          .filter((p) => p.exercises.length > 0)
      } : {
        name: current.name,
        division: current.division,
        description: current.description,
        weekDays: current.weekDays,
        archivePrevious,
        exercises: exercisesToSave.map((ex) => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          customName: ex.customName,
          muscleGroup: ex.muscleGroup,
          equipment: ex.equipment,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          method: ex.method,
          notes: ex.notes,
        })),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar a ficha de treino.");
      }

      setSuccess(true);
      setTimeout(() => {
        if (onPlanImported) onPlanImported();
        handleResetAndClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar treino.";
      setError(msg);
      setSaving(false);
    }
  };

  const handleResetAndClose = () => {
    setFile(null);
    setPreviewUrl(null);
    setPastedText("");
    setLoading(false);
    setError(null);
    setParsedPlans([]);
    setActivePlanIndex(0);
    setSaving(false);
    setSuccess(false);
    setArchivePrevious(false);
    setIsPickerOpen(false);
    setPickerSearch("");
    setPickerMuscle("Todos");
    setRecentlyAddedId(null);
    setAnimatingIndex(null);
    setAnimatingDirection(null);
    onClose();
  };

  const handleFillInForm = () => {
    if (parsedPlans.length === 0 || !onPlanSelectedForTrainer) return;
    const current = parsedPlans[activePlanIndex];
    if (!current) return;
    const exercisesToSave = current.exercises.filter((ex) => ex.selected !== false);
    if (exercisesToSave.length === 0) {
      setError("Selecione ao menos um exercício marcado para preencher no construtor.");
      return;
    }
    onPlanSelectedForTrainer({
      ...current,
      exercises: exercisesToSave,
    });
    handleResetAndClose();
  };

  const handleUpdateExercise = (
    index: number,
    field: keyof ParsedExercise,
    value: string | number | boolean
  ) => {
    if (parsedPlans.length === 0) return;
    const current = parsedPlans[activePlanIndex];
    const updatedExercises = [...current.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    const updatedPlans = [...parsedPlans];
    updatedPlans[activePlanIndex] = {
      ...current,
      exercises: updatedExercises,
    };
    setParsedPlans(updatedPlans);
  };

  const handleToggleExercise = (index: number) => {
    if (parsedPlans.length === 0) return;
    const current = parsedPlans[activePlanIndex];
    if (!current) return;
    const isSelected = current.exercises[index].selected !== false;
    handleUpdateExercise(index, "selected", !isSelected);
  };

  const handleToggleSelectAll = (select: boolean) => {
    if (parsedPlans.length === 0) return;
    const current = parsedPlans[activePlanIndex];
    if (!current) return;

    const updatedExercises = current.exercises.map((ex) => ({
      ...ex,
      selected: select,
    }));

    const updatedPlans = [...parsedPlans];
    updatedPlans[activePlanIndex] = {
      ...current,
      exercises: updatedExercises,
    };
    setParsedPlans(updatedPlans);
  };

  const handleAddExerciseFromLibrary = (exercise: LibraryExercise) => {
    if (parsedPlans.length === 0) return;
    const current = parsedPlans[activePlanIndex];
    if (!current) return;

    const newEx: ParsedExercise = {
      order: current.exercises.length + 1,
      extractedName: exercise.name,
      exerciseId: exercise.id,
      name: exercise.name,
      customName: null,
      muscleGroup: exercise.muscleGroup || "Geral",
      equipment: exercise.equipment || "Livre",
      gifUrl: exercise.gifUrl,
      videoUrl: exercise.videoUrl,
      confidence: 1,
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      method: "Normal",
      notes: "",
      selected: true,
    };

    const updatedPlans = [...parsedPlans];
    updatedPlans[activePlanIndex] = {
      ...current,
      exercises: [...current.exercises, newEx],
    };
    setParsedPlans(updatedPlans);
    setRecentlyAddedId(exercise.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1500);
  };

  const handleMoveExerciseUp = (index: number) => {
    if (parsedPlans.length === 0 || index === 0 || animatingIndex !== null) return;
    const current = parsedPlans[activePlanIndex];
    if (!current) return;

    setAnimatingIndex(index);
    setAnimatingDirection("up");

    setTimeout(() => {
      const updatedExercises = [...current.exercises];
      const temp = updatedExercises[index];
      updatedExercises[index] = updatedExercises[index - 1];
      updatedExercises[index - 1] = temp;

      const reordered = updatedExercises.map((ex, i) => ({
        ...ex,
        order: i + 1,
      }));

      const updatedPlans = [...parsedPlans];
      updatedPlans[activePlanIndex] = {
        ...current,
        exercises: reordered,
      };
      setParsedPlans(updatedPlans);
      setAnimatingIndex(null);
      setAnimatingDirection(null);
    }, 250);
  };

  const handleMoveExerciseDown = (index: number) => {
    if (parsedPlans.length === 0 || animatingIndex !== null) return;
    const current = parsedPlans[activePlanIndex];
    if (!current || index === current.exercises.length - 1) return;

    setAnimatingIndex(index);
    setAnimatingDirection("down");

    setTimeout(() => {
      const updatedExercises = [...current.exercises];
      const temp = updatedExercises[index];
      updatedExercises[index] = updatedExercises[index + 1];
      updatedExercises[index + 1] = temp;

      const reordered = updatedExercises.map((ex, i) => ({
        ...ex,
        order: i + 1,
      }));

      const updatedPlans = [...parsedPlans];
      updatedPlans[activePlanIndex] = {
        ...current,
        exercises: reordered,
      };
      setParsedPlans(updatedPlans);
      setAnimatingIndex(null);
      setAnimatingDirection(null);
    }, 250);
  };

  const getItemTransform = (index: number) => {
    if (animatingIndex === null || animatingDirection === null) return "none";

    if (animatingDirection === "up") {
      if (index === animatingIndex) {
        return "translateY(calc(-100% - 10px))";
      }
      if (index === animatingIndex - 1) {
        return "translateY(calc(100% + 10px))";
      }
    }

    if (animatingDirection === "down") {
      if (index === animatingIndex) {
        return "translateY(calc(100% + 10px))";
      }
      if (index === animatingIndex + 1) {
        return "translateY(calc(-100% - 10px))";
      }
    }

    return "none";
  };

  const handleRemoveExercise = (index: number) => {
    if (parsedPlans.length === 0) return;
    const current = parsedPlans[activePlanIndex];
    const filtered = current.exercises.filter((_, idx) => idx !== index);
    const updatedPlans = [...parsedPlans];
    updatedPlans[activePlanIndex] = {
      ...current,
      exercises: filtered,
    };
    setParsedPlans(updatedPlans);
  };

  const handleUpdatePlanMeta = (field: "name" | "division", val: string) => {
    if (parsedPlans.length === 0) return;
    const current = parsedPlans[activePlanIndex];
    const updatedPlans = [...parsedPlans];
    updatedPlans[activePlanIndex] = {
      ...current,
      [field]: val,
    };
    setParsedPlans(updatedPlans);
  };

  const currentTotal = parsedPlan ? parsedPlan.exercises.length : 0;
  const currentSelected = parsedPlan
    ? parsedPlan.exercises.filter((ex) => ex.selected !== false).length
    : 0;
  const isAllSelected = currentTotal > 0 && currentSelected === currentTotal;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[86vh] sm:max-h-[88vh] animate-scale-up relative">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Importar Treino com IA
              </h3>
              <p className="text-xs text-slate-500">
                Tire foto da ficha, envie um PDF ou cole o texto do WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            disabled={loading || saving}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0 relative">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-slide-down">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-scale-up">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Treino Importado com Sucesso!</h4>
              <p className="text-xs text-slate-500">
                Sua ficha já está pronta para treinar no aplicativo.
              </p>
            </div>
          ) : !parsedPlan ? (
            /* ETAPA 1: Seleção entre Arquivo/Foto OU Texto */
            <div className="space-y-4">
              {/* Seletor de Modo */}
              <div className="flex rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setInputMode("file")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    inputMode === "file"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  Foto ou PDF
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    inputMode === "text"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Colar Texto / WhatsApp
                </button>
              </div>

              {inputMode === "file" ? (
                /* Modo Arquivo */
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                      file
                        ? "border-blue-500 bg-blue-50/40"
                        : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/60"
                    }`}
                  >
                    {previewUrl ? (
                      <div className="relative w-full max-h-48 rounded-2xl overflow-hidden mb-3 border border-slate-200 shadow-sm">
                        <img
                          src={previewUrl}
                          alt="Prévia da ficha"
                          className="w-full h-full object-contain bg-slate-950"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                    )}

                    {file ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-blue-600 font-semibold">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • Clique para trocar
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">
                          Toque para escolher uma foto ou arquivo PDF
                        </p>
                        <p className="text-xs text-slate-400">
                          Fotos de fichas impressas, capturas de tela ou arquivos PDF
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      Tirar Foto Agora
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Procurar Arquivo
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                    }}
                  />
                </div>
              ) : (
                /* Modo Texto / WhatsApp */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    Cole a mensagem ou lista de exercícios:
                  </label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    rows={8}
                    placeholder={`Exemplo de mensagem:\nTreino A - Peito e Tríceps\n1. Supino reto com barra 4x10\n2. Supino inclinado halteres 3x12\n3. Peck deck (voador) 4x15\n4. Tríceps testa 4x10\n5. Tríceps corda 3x12`}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-none bg-slate-50/50 resize-none transition-colors"
                  />
                  <p className="text-[11px] text-slate-400">
                    A IA identifica automaticamente os exercícios, séries, repetições e tempos de descanso para você.
                  </p>
                </div>
              )}

              {/* Botão de Processar */}
              {((inputMode === "file" && file) || (inputMode === "text" && pastedText.trim())) && (
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{loadingStep || "Processando com IA..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Identificar Exercícios com IA</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            /* ETAPA 2: Conferência e Edição dos Exercícios */
            <div className="space-y-4 animate-fade-in">
              {/* Seletor de Abas quando houver múltiplos treinos */}
              {parsedPlans.length > 1 && (
                <div className="space-y-1.5 pb-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                    <span>{parsedPlans.length} treinos identificados:</span>
                    <span className="text-[11px] text-blue-600">Alterne para revisar cada um</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                    {parsedPlans.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePlanIndex(idx)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                          activePlanIndex === idx
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>{p.division ? `Divisão ${p.division}` : `Treino ${idx + 1}`}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                            activePlanIndex === idx
                              ? "bg-white/20 text-white"
                              : "bg-white text-slate-500"
                          }`}
                        >
                          {p.exercises.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cabeçalho do Treino Identificado */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Nome do Treino
                    </label>
                    <input
                      type="text"
                      value={parsedPlan.name}
                      onChange={(e) => handleUpdatePlanMeta("name", e.target.value)}
                      className="w-full text-base font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Divisão:</span>
                    <input
                      type="text"
                      value={parsedPlan.division}
                      maxLength={4}
                      onChange={(e) => handleUpdatePlanMeta("division", e.target.value.toUpperCase())}
                      className="w-12 text-center text-sm font-black text-blue-600 bg-blue-50 border border-blue-200 rounded-lg py-1 uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>
                    Identificados <strong>{parsedPlan.exercises.length} exercícios</strong> prontos para cadastro.
                  </span>
                </div>
              </div>

              {/* Barra de Ações: Seleção Rápida e Adicionar da Biblioteca */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-0.5 px-0.5">
                <button
                  type="button"
                  onClick={() => handleToggleSelectAll(!isAllSelected)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer select-none py-1.5 px-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      isAllSelected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : currentSelected > 0
                        ? "bg-blue-50 border-blue-400 text-blue-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    {!isAllSelected && currentSelected > 0 && (
                      <div className="w-2 h-0.5 bg-blue-600 rounded" />
                    )}
                  </div>
                  <span>{isAllSelected ? "Desmarcar todos" : "Selecionar todos"}</span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({currentSelected} de {currentTotal})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="py-2 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-blue-200/80 cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Adicionar Exercício</span>
                </button>
              </div>

              {/* Lista de Exercícios Extraídos */}
              <div className="space-y-2.5 pb-2">
                {parsedPlan.exercises.map((ex, idx) => {
                  const isSelected = ex.selected !== false;
                  const isCurrentlyMoving = animatingIndex === idx;
                  const isSwapTarget =
                    animatingDirection === "up"
                      ? animatingIndex !== null && idx === animatingIndex - 1
                      : animatingDirection === "down"
                      ? animatingIndex !== null && idx === animatingIndex + 1
                      : false;

                  return (
                    <div
                      key={idx}
                      style={{
                        transform: getItemTransform(idx),
                        transition:
                          isCurrentlyMoving || isSwapTarget
                            ? "transform 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms ease"
                            : "none",
                        zIndex: isCurrentlyMoving || isSwapTarget ? 20 : 1,
                      }}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative ${
                        isCurrentlyMoving || isSwapTarget
                          ? "shadow-lg border-blue-400 bg-blue-50/20"
                          : isSelected
                          ? "bg-white border-slate-200/90 shadow-sm hover:border-slate-300"
                          : "bg-slate-50/70 border-slate-200/60 opacity-60 hover:opacity-90"
                      }`}
                    >
                      {/* Checkbox de Seleção */}
                      <button
                        type="button"
                        onClick={() => handleToggleExercise(idx)}
                        aria-label={isSelected ? "Desmarcar exercício" : "Marcar exercício"}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer mt-3 ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                            : "bg-white border-slate-300 text-transparent hover:border-blue-400"
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 stroke-[3] transition-transform ${
                            isSelected ? "scale-100" : "scale-0"
                          }`}
                        />
                      </button>

                      {/* Miniatura do GIF se houver */}
                      <div className="w-12 h-12 rounded-xl bg-slate-900 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner">
                        {ex.gifUrl ? (
                          <img
                            src={`/api/media/${ex.gifUrl}`}
                            alt={ex.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Dumbbell className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      {/* Dados do Exercício */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={ex.name}
                              onChange={(e) => handleUpdateExercise(idx, "name", e.target.value)}
                              className={`text-xs sm:text-sm font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-full truncate transition-colors ${
                                isSelected ? "text-slate-800" : "text-slate-500 line-through"
                              }`}
                            />
                          </div>

                          {/* Ações: Setas Deslizantes e Excluir */}
                          <div className="flex items-center gap-1 shrink-0">
                            <div className="flex items-center bg-slate-100/90 rounded-xl p-0.5 border border-slate-200/80">
                              <button
                                type="button"
                                disabled={idx === 0 || animatingIndex !== null}
                                onClick={() => handleMoveExerciseUp(idx)}
                                className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white transition-all cursor-pointer disabled:opacity-25 disabled:pointer-events-none active:scale-90"
                                title="Mover exercício para cima"
                                aria-label="Mover exercício para cima"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-[1px] h-3 bg-slate-200 mx-0.5" />
                              <button
                                type="button"
                                disabled={
                                  idx === parsedPlan.exercises.length - 1 ||
                                  animatingIndex !== null
                                }
                                onClick={() => handleMoveExerciseDown(idx)}
                                className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white transition-all cursor-pointer disabled:opacity-25 disabled:pointer-events-none active:scale-90"
                                title="Mover exercício para baixo"
                                aria-label="Mover exercício para baixo"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveExercise(idx)}
                              className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remover exercício"
                              aria-label="Remover exercício"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600">
                            {ex.muscleGroup}
                          </span>

                          <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            <span>Séries:</span>
                            <input
                              type="number"
                              value={ex.sets}
                              min={1}
                              max={20}
                              onChange={(e) =>
                                handleUpdateExercise(idx, "sets", Number(e.target.value))
                              }
                              className="w-8 text-center font-bold text-slate-800 bg-white border border-slate-200 rounded px-0.5"
                            />
                          </div>

                          <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            <span>Reps:</span>
                            <input
                              type="text"
                              value={ex.reps}
                              onChange={(e) => handleUpdateExercise(idx, "reps", e.target.value)}
                              className="w-16 text-center font-bold text-slate-800 bg-white border border-slate-200 rounded px-1 text-[11px]"
                            />
                          </div>

                          {ex.exerciseId && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                              ✓ GIF Vinculado
                            </span>
                          )}

                          {!isSelected && (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/70 px-1.5 py-0.5 rounded">
                              Não será importado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Rodapé Fixo com Efeito Vidro (Sticky Glassmorphic Footer) - Etapa 2 */}
        {parsedPlan && !success && !isPickerOpen && (
          <div className="bg-white/95 backdrop-blur-xl border-t border-slate-100/90 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] shrink-0 z-10">
            <div className="px-4 py-2 border-b border-slate-100/80 bg-slate-50/60 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={archivePrevious}
                  onChange={(e) => setArchivePrevious(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span>Arquivar treinos anteriores automaticamente para não poluir a tela</span>
              </label>
            </div>
            <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setParsedPlans([])}
                  disabled={saving}
                  className="py-3 px-3.5 sm:px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                {onPlanSelectedForTrainer && (
                  <button
                    type="button"
                    onClick={handleFillInForm}
                    disabled={saving || currentSelected === 0}
                    className="py-3 px-3.5 sm:px-4 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[44px]"
                    title="Preencher divisão ativa no construtor de treino ao lado"
                  >
                    <span>Preencher no Construtor</span>
                  </button>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {parsedPlans.length > 1 ? (
                    <>
                      <strong className="text-slate-700">{totalSelectedAcrossAll}</strong> exercícios selecionados em{" "}
                      <strong className="text-slate-700">{parsedPlans.length}</strong> treinos
                    </>
                  ) : (
                    <>
                      {currentSelected}{" "}
                      {currentSelected === 1 ? "exercício selecionado" : "exercícios selecionados"}
                      {currentSelected !== currentTotal && ` (de ${currentTotal})`}
                    </>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSavePlan}
                disabled={saving || (parsedPlans.length > 1 ? totalSelectedAcrossAll === 0 : currentSelected === 0)}
                className="flex-1 sm:flex-initial sm:min-w-[240px] py-3 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>
                      {parsedPlans.length > 1
                        ? `Salvando ${parsedPlans.length} fichas no aluno...`
                        : "Salvando ficha no aluno..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    <span>
                      {targetStudentId
                        ? parsedPlans.length > 1
                          ? `Salvar ${parsedPlans.length} Fichas no Aluno`
                          : "Salvar Ficha no Aluno"
                        : parsedPlans.length > 1
                        ? `Confirmar e Salvar ${parsedPlans.length} Fichas`
                        : "Confirmar e Salvar Ficha"}
                    </span>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black shrink-0">
                      {parsedPlans.length > 1 ? totalSelectedAcrossAll : currentSelected}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Sub-tela Isolada: Seletor de Exercícios da Biblioteca */}
        {isPickerOpen && (
          <div className="absolute inset-0 z-50 bg-white rounded-3xl flex flex-col overflow-hidden animate-fade-in shadow-2xl">
            {/* Header do Seletor */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Adicionar da Biblioteca
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Mais de 300 exercícios com GIFs para adicionar ao treino
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros e Busca */}
            <div className="p-3 sm:p-4 border-b border-slate-100 space-y-3 bg-slate-50/50 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Buscar por nome (ex: Supino, Rosca, Puxada)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-base md:text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors shadow-2xs"
                />
                {pickerSearch && (
                  <button
                    type="button"
                    onClick={() => setPickerSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Pílulas de Grupos Musculares */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {MUSCLE_FILTER_OPTIONS.map((muscle) => (
                  <button
                    key={muscle}
                    type="button"
                    onClick={() => setPickerMuscle(muscle)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                      pickerMuscle === muscle
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                    }`}
                  >
                    {muscle}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Resultados da Biblioteca */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 min-h-0">
              {libraryLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs font-medium">Buscando exercícios...</span>
                </div>
              ) : libraryExercises.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                  <Dumbbell className="w-8 h-8 opacity-40" />
                  <p className="text-xs font-semibold text-slate-600">Nenhum exercício encontrado.</p>
                  <p className="text-[11px] text-slate-400">Tente buscar por outro termo ou grupo muscular.</p>
                </div>
              ) : (
                libraryExercises.map((libEx) => {
                  const isJustAdded = recentlyAddedId === libEx.id;

                  return (
                    <div
                      key={libEx.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200">
                          {libEx.gifUrl ? (
                            <img
                              src={`/api/media/${libEx.gifUrl}`}
                              alt={libEx.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Dumbbell className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {libEx.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {libEx.muscleGroup} • {libEx.equipment}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddExerciseFromLibrary(libEx)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                          isJustAdded
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 active:scale-95"
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Adicionado!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Adicionar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé Fixo do Seletor */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200/80 bg-slate-50/95 backdrop-blur-md flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs text-slate-600 font-semibold">
                  {parsedPlan?.exercises.length || 0} exercícios na ficha ativa
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/25 cursor-pointer min-h-[44px] flex items-center justify-center active:scale-95"
              >
                Concluir e Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
