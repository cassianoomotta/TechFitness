"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Dumbbell,
  LogOut,
  Search,
  Plus,
  Loader2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  description: string | null;
}

interface WorkoutExerciseInput {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  restSeconds: number;
  method: string;
  recommendedRpe: number | null;
  recommendedWeight: number | null;
  notes: string;
}

const METHODS = ["Normal", "Drop Set", "Bi-Set", "Rest Pause", "Até a falha"];

export default function NewPlanPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const studentId = params.id as string;

  // Estados do Aluno
  const [studentName, setStudentName] = useState("");
  const [studentLoading, setStudentLoading] = useState(true);

  // Estados dos Exercícios da Biblioteca
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("todos");

  // Estados do Formulário de Treino
  const [workoutName, setWorkoutName] = useState("");
  const [description, setDescription] = useState("");
  const [division, setDivision] = useState("A");
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExerciseInput[]>([]);

  // Estados de Ações
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Carregar dados do aluno
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/trainer/students/${studentId}`);
        if (!response.ok) {
          router.push("/trainer/dashboard");
          return;
        }
        const data = await response.json();
        setStudentName(data.name);
      } catch (err) {
        console.error("Erro ao buscar dados do aluno:", err);
      } finally {
        setStudentLoading(false);
      }
    };

    if (studentId) {
      fetchStudent();
    }
  }, [studentId, router]);

  // Carregar biblioteca de exercícios
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedMuscle && selectedMuscle !== "todos") {
          params.append("muscle", selectedMuscle);
        }
        const response = await fetch(`/api/exercises?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setLibrary(data);
        }
      } catch (err) {
        console.error("Erro ao buscar exercícios:", err);
      } finally {
        setLibraryLoading(false);
      }
    };

    fetchLibrary();
  }, [searchQuery, selectedMuscle]);

  // Adicionar exercício à ficha ativa
  const handleAddExercise = (exercise: Exercise) => {
    // Evitar duplicar no mesmo treino se necessário, ou permitir se quiser prescrever bi-sets do mesmo.
    // Vamos apenas adicionar à lista.
    const newWorkoutExercise: WorkoutExerciseInput = {
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      sets: 4,
      reps: "10",
      restSeconds: 60,
      method: "Normal",
      recommendedRpe: null,
      recommendedWeight: null,
      notes: "",
    };

    setSelectedExercises([...selectedExercises, newWorkoutExercise]);
  };

  // Remover exercício da ficha ativa
  const handleRemoveExercise = (index: number) => {
    const updated = [...selectedExercises];
    updated.splice(index, 1);
    setSelectedExercises(updated);
  };

  // Atualizar parâmetro de um exercício adicionado
  const handleUpdateExerciseParam = (
    index: number,
    key: keyof WorkoutExerciseInput,
    value: any
  ) => {
    const updated = [...selectedExercises];
    updated[index] = {
      ...updated[index],
      [key]: value,
    };
    setSelectedExercises(updated);
  };

  // Enviar formulário
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExercises.length === 0) {
      setError("Adicione pelo menos um exercício ao treino.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`/api/trainer/students/${studentId}/workout-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workoutName,
          description,
          division,
          exercises: selectedExercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: Number(ex.sets),
            reps: ex.reps,
            restSeconds: Number(ex.restSeconds),
            method: ex.method,
            recommendedRpe: ex.recommendedRpe ? Number(ex.recommendedRpe) : null,
            recommendedWeight: ex.recommendedWeight ? Number(ex.recommendedWeight) : null,
            notes: ex.notes || null,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ocorreu um erro ao salvar o treino.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/trainer/dashboard");
      }, 1500);
    } catch (err) {
      setError("Erro de rede. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                <Dumbbell className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider uppercase text-white">
                Pulse<span className="text-emerald-400">SaaS</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/trainer/dashboard"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Alunos
              </Link>
              <Link
                href="/trainer/exercises"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Exercícios
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">
                {session?.user?.name || "Professor"}
              </p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Personal Trainer
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

      {/* Page Title Context */}
      <section className="bg-slate-900/40 border-b border-zinc-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/trainer/dashboard"
              className="p-2 rounded-lg border border-zinc-850 hover:border-zinc-750 text-zinc-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                {studentLoading ? "Carregando Aluno..." : `Prescrever Treino: ${studentName}`}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Monte um plano de treino focado em progressão.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Coluna Esquerda: Biblioteca de Exercícios */}
        <section className="w-full lg:w-5/12 flex flex-col gap-6">
          <div className="glass-card rounded-2xl p-5 border border-zinc-900">
            <h3 className="font-display font-semibold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" /> Biblioteca de Exercícios
            </h3>

            {/* Filtros rápidos da Biblioteca */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Pesquisar exercício..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-zinc-900 focus:border-emerald-500 outline-none text-xs text-white placeholder-zinc-650 transition-all"
                />
              </div>

              <select
                value={selectedMuscle}
                onChange={(e) => setSelectedMuscle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-zinc-900 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition-all"
              >
                <option value="todos">Todos os Músculos</option>
                <option value="Peito">Peito</option>
                <option value="Costas">Costas</option>
                <option value="Pernas">Pernas</option>
                <option value="Ombros">Ombros</option>
                <option value="Braços">Braços</option>
                <option value="Core">Core</option>
                <option value="Cardio">Cardio</option>
              </select>
            </div>

            {/* Lista dos Exercícios */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {libraryLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
                </div>
              ) : library.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-10">Nenhum exercício encontrado.</p>
              ) : (
                library.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex justify-between items-center p-3.5 rounded-xl bg-slate-950/40 border border-zinc-900/60 hover:border-zinc-800 transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white leading-tight">{exercise.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {exercise.muscleGroup}
                        </span>
                        <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          {exercise.equipment}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddExercise(exercise)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500/10 text-emerald-400 border border-zinc-800 hover:border-emerald-500/30 transition-all cursor-pointer"
                      title="Adicionar ao treino"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Coluna Direita: Ficha de Treino Ativa */}
        <section className="w-full lg:w-7/12 flex flex-col gap-6">
          <form onSubmit={handleSavePlan} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-zinc-900">
              
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-200 text-xs text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-xs text-center">
                  Treino salvo e atribuído com sucesso! Redirecionando...
                </div>
              )}

              {/* Informações Básicas do Treino */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Nome do Treino (Ficha)
                  </label>
                  <input
                    type="text"
                    required
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    placeholder="Ex: Treino A - Hipertrofia de Peito"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-zinc-900 focus:border-emerald-500 outline-none text-xs text-white placeholder-zinc-650 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Divisão
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-zinc-900 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="A">Treino A</option>
                    <option value="B">Treino B</option>
                    <option value="C">Treino C</option>
                    <option value="D">Treino D</option>
                    <option value="E">Treino E</option>
                    <option value="F">Treino F</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Descrição ou Foco do Treino (Opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Foco em força na fase concêntrica, descanso controlado"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-zinc-900 focus:border-emerald-500 outline-none text-xs text-white placeholder-zinc-650 transition-all"
                />
              </div>

              {/* Título Exercícios Ativos */}
              <div className="flex justify-between items-center mb-4 pt-4 border-t border-zinc-900">
                <h4 className="font-display font-semibold text-sm text-white">
                  Exercícios na Ficha ({selectedExercises.length})
                </h4>
              </div>

              {/* Lista dos Exercícios Adicionados */}
              {selectedExercises.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500">
                  <Info className="w-8 h-8 mx-auto text-zinc-700 mb-2" />
                  <p className="text-xs font-medium">Ficha vazia</p>
                  <p className="text-[10px] mt-0.5">Selecione exercícios na biblioteca à esquerda para começar.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {selectedExercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-950 border border-zinc-900 space-y-4 relative group"
                    >
                      {/* Título & Botão Remover */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h5 className="text-xs font-bold text-white">
                            {index + 1}. {exercise.name}
                          </h5>
                          <p className="text-[9px] text-zinc-500 mt-0.5">
                            {exercise.muscleGroup} • {exercise.equipment}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                          title="Remover exercício"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Parâmetros do Exercício */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Séries */}
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Séries</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={exercise.sets}
                            onChange={(e) =>
                              handleUpdateExerciseParam(index, "sets", Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-zinc-850 outline-none text-xs text-white text-center focus:border-emerald-500"
                          />
                        </div>

                        {/* Repetições */}
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Repetições</label>
                          <input
                            type="text"
                            required
                            value={exercise.reps}
                            onChange={(e) =>
                              handleUpdateExerciseParam(index, "reps", e.target.value)
                            }
                            placeholder="Ex: 8-10, 12, Falha"
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-zinc-850 outline-none text-xs text-white text-center focus:border-emerald-500"
                          />
                        </div>

                        {/* Descanso */}
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Descanso (s)</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={exercise.restSeconds}
                            onChange={(e) =>
                              handleUpdateExerciseParam(index, "restSeconds", Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-zinc-850 outline-none text-xs text-white text-center focus:border-emerald-500"
                          />
                        </div>

                        {/* Método */}
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Método</label>
                          <select
                            value={exercise.method}
                            onChange={(e) =>
                              handleUpdateExerciseParam(index, "method", e.target.value)
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-zinc-850 outline-none text-[10px] text-zinc-300 focus:border-emerald-500"
                          >
                            {METHODS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Parâmetros Opcionais (RPE, Carga, Notas) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-900/60">
                        {/* Carga Inicial */}
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Carga Sugerida (kg)</label>
                          <input
                            type="number"
                            step="any"
                            value={exercise.recommendedWeight || ""}
                            onChange={(e) =>
                              handleUpdateExerciseParam(
                                index,
                                "recommendedWeight",
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            placeholder="Opcional"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-zinc-850 outline-none text-xs text-white focus:border-emerald-500"
                          />
                        </div>

                        {/* RPE */}
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">RPE Recomendado (1-10)</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={exercise.recommendedRpe || ""}
                            onChange={(e) =>
                              handleUpdateExerciseParam(
                                index,
                                "recommendedRpe",
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            placeholder="Ex: 8"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-zinc-850 outline-none text-xs text-white focus:border-emerald-500"
                          />
                        </div>

                        {/* Observações específicas */}
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Instruções Extras</label>
                          <input
                            type="text"
                            value={exercise.notes}
                            onChange={(e) =>
                              handleUpdateExerciseParam(index, "notes", e.target.value)
                            }
                            placeholder="Ex: Pegada aberta"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-zinc-850 outline-none text-xs text-white focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={loading || success || selectedExercises.length === 0}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:pointer-events-none mt-8"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Salvar e Atribuir Treino
                    <CheckCircle className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
