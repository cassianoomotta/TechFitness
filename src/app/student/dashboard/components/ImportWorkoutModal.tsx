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
  Plus,
  Play,
  ArrowRight,
  Dumbbell,
  Check,
} from "lucide-react";

interface ParsedExercise {
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

interface ParsedPlan {
  name: string;
  division: string;
  description: string;
  weekDays: string[];
  exercises: ParsedExercise[];
}

interface ImportWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanImported: () => void;
}

export default function ImportWorkoutModal({
  isOpen,
  onClose,
  onPlanImported,
}: ImportWorkoutModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [parsedPlan, setParsedPlan] = useState<ParsedPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const handleProcessFile = async () => {
    if (!file) {
      setError("Selecione um arquivo de foto ou PDF primeiro.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep("Lendo arquivo com IA do Gemini...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setTimeout(() => {
        setLoadingStep("Identificando exercícios, séries e repetições...");
      }, 1500);

      setTimeout(() => {
        setLoadingStep("Cruzando com a biblioteca de 1.470 animações...");
      }, 3000);

      const response = await fetch("/api/student/workout-plans/import-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao processar arquivo com a IA.");
      }

      if (data.plan) {
        setParsedPlan(data.plan);
      } else {
        throw new Error("Não foi possível extrair os exercícios deste arquivo.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao processar.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!parsedPlan || parsedPlan.exercises.length === 0) {
      setError("Adicione ao menos um exercício antes de salvar.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/student/workout-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: parsedPlan.name,
          division: parsedPlan.division,
          description: parsedPlan.description,
          weekDays: parsedPlan.weekDays,
          exercises: parsedPlan.exercises.map((ex) => ({
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar a ficha de treino.");
      }

      setSuccess(true);
      setTimeout(() => {
        onPlanImported();
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
    setLoading(false);
    setError(null);
    setParsedPlan(null);
    setSaving(false);
    setSuccess(false);
    onClose();
  };

  const handleUpdateExercise = (
    index: number,
    field: keyof ParsedExercise,
    value: string | number
  ) => {
    if (!parsedPlan) return;
    const updated = [...parsedPlan.exercises];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setParsedPlan({
      ...parsedPlan,
      exercises: updated,
    });
  };

  const handleRemoveExercise = (index: number) => {
    if (!parsedPlan) return;
    const filtered = parsedPlan.exercises.filter((_, idx) => idx !== index);
    setParsedPlan({
      ...parsedPlan,
      exercises: filtered,
    });
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
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                Importar Treino com IA
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Gemini Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tire foto da ficha da academia ou envie um PDF
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            disabled={loading || saving}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
            /* ETAPA 1: Upload e Seleção de Arquivo */
            <div className="space-y-4">
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
                      Suporta fotos de fichas impressas, capturas de tela ou documentos PDF
                    </p>
                  </div>
                )}
              </div>

              {/* Botões de Ação Rápida */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  Tirar Foto Agora
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Procurar Arquivo
                </button>
              </div>

              {/* Inputs Ocultos */}
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

              {/* Barra de Ação de Envio */}
              {file && (
                <button
                  type="button"
                  onClick={handleProcessFile}
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
                      <span>Escanear Ficha com IA</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            /* ETAPA 2: Conferência e Edição dos Exercícios */
            <div className="space-y-4 animate-fade-in">
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
                      onChange={(e) =>
                        setParsedPlan({ ...parsedPlan, name: e.target.value })
                      }
                      className="w-full text-base font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Divisão:</span>
                    <input
                      type="text"
                      value={parsedPlan.division}
                      maxLength={4}
                      onChange={(e) =>
                        setParsedPlan({ ...parsedPlan, division: e.target.value.toUpperCase() })
                      }
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
                          className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
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
                  onClick={() => setParsedPlan(null)}
                  disabled={saving}
                  className="py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
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
                      <span>Salvando ficha de treino...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Confirmar e Salvar Ficha</span>
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
