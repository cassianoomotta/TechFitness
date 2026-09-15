"use client";

import React, { useState, useRef } from "react";
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
}

export interface ParsedPlan {
  name: string;
  division: string;
  description: string;
  weekDays: string[];
  exercises: ParsedExercise[];
}

interface ImportWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanImported?: () => void;
  onPlanSelectedForTrainer?: (plan: ParsedPlan) => void;
  targetStudentId?: string;
}

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const parsedPlan = parsedPlans[activePlanIndex] || null;

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
        setParsedPlans(data.plans);
        setActivePlanIndex(0);
      } else if (data.plan) {
        setParsedPlans([data.plan]);
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

  const handleSavePlan = async () => {
    if (parsedPlans.length === 0) return;
    const current = parsedPlans[activePlanIndex];
    if (!current || current.exercises.length === 0) {
      setError("Adicione ao menos um exercício antes de salvar.");
      return;
    }

    // Se for o Treinador preenchendo o formulário de novo treino
    if (onPlanSelectedForTrainer) {
      onPlanSelectedForTrainer(current);
      handleResetAndClose();
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const endpoint = targetStudentId
        ? `/api/trainer/students/${targetStudentId}/workout-plans`
        : "/api/student/workout-plans";

      const payload = parsedPlans.length > 1 ? {
        plans: parsedPlans.map((p) => ({
          name: p.name,
          division: p.division,
          description: p.description,
          weekDays: p.weekDays,
          exercises: p.exercises.map((ex) => ({
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
      } : {
        name: current.name,
        division: current.division,
        description: current.description,
        weekDays: current.weekDays,
        exercises: current.exercises.map((ex) => ({
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
    onClose();
  };

  const handleUpdateExercise = (
    index: number,
    field: keyof ParsedExercise,
    value: string | number
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-scale-up">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/40">
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
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

              {/* Lista de Exercícios Extraídos */}
              <div className="space-y-2.5 max-h-[42vh] overflow-y-auto pr-1">
                {parsedPlan.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex items-start gap-3"
                  >
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
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => handleUpdateExercise(idx, "name", e.target.value)}
                          className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-full truncate"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="text-slate-300 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                          title="Remover exercício"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botões do Rodapé de Confirmação */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setParsedPlans([])}
                  disabled={saving}
                  className="py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={handleSavePlan}
                  disabled={saving || parsedPlan.exercises.length === 0}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{parsedPlans.length > 1 ? `Salvando ${parsedPlans.length} fichas...` : "Salvando ficha de treino..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>
                        {onPlanSelectedForTrainer
                          ? "Preencher no Treino"
                          : parsedPlans.length > 1
                          ? `Confirmar e Salvar ${parsedPlans.length} Fichas`
                          : "Confirmar e Salvar Ficha"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
