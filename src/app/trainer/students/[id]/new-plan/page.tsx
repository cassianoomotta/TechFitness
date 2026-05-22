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
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-cyan-500 to-indigo-500 p-2 rounded-xl shadow-lg shadow-cyan-500/10">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider uppercase text-zinc-100">
                Tech<span className="text-cyan-500">Fitness</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/trainer/dashboard"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-550 hover:text-zinc-950 transition-colors"
              >
                Alunos
              </Link>
              <Link
                href="/trainer/exercises"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-550 hover:text-zinc-950 transition-colors"
              >
                Exercícios
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-zinc-200">
                {session?.user?.name || "Professor"}
              </p>
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Personal Trainer
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2.5 rounded-xl border border-zinc-800 hover:border-red-500/30 hover:bg-red-550/5 text-zinc-550 hover:text-red-600 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Header Contexto */}
      <section className="bg-zinc-900/60 border-b border-zinc-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <Link
            href="/trainer/dashboard"
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-300 text-zinc-550 hover:text-zinc-950 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="font-display text-xl font-bold text-zinc-100">
              {studentLoading ? "Carregando..." : `Prescrever Treino: ${studentName}`}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Monte uma ficha de exercícios personalizada.</p>
          </div>
        </div>
      </section>

      {studentLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 py-20">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-2" />
          <p className="text-sm">Carregando dados do aluno...</p>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
          
          {/* Coluna Esquerda: Biblioteca de Exercícios */}
          <section className="w-full lg:w-5/12 flex flex-col gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-zinc-350 uppercase tracking-widest">
                Biblioteca de Exercícios
              </h3>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs focus:border-cyan-500 outline-none text-zinc-200 transition-all placeholder-zinc-400"
                  />
                </div>
                <select
                  value={selectedMuscle}
                  onChange={(e) => setSelectedMuscle(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-650 outline-none focus:border-cyan-500 transition-all"
                >
                  <option value="todos">Todos Músculos</option>
                  <option value="Peito">Peito</option>
                  <option value="Costas">Costas</option>
                  <option value="Pernas">Pernas</option>
                  <option value="Ombros">Ombros</option>
                  <option value="Braços">Braços</option>
                  <option value="Core">Core</option>
                </select>
              </div>

              {/* Lista */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {libraryLoading ? (
                  <div className="flex items-center justify-center py-10 text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-500 mr-2" />
                    <span className="text-xs">Carregando biblioteca...</span>
                  </div>
                ) : library.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-10">Nenhum exercício encontrado.</p>
                ) : (
                  library.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="p-3 bg-zinc-50 border border-zinc-800 rounded-xl flex items-center justify-between gap-4 hover:border-cyan-500/30 transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-100 truncate group-hover:text-cyan-400 transition-colors">
                          {exercise.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {exercise.muscleGroup} • {exercise.equipment}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddExercise(exercise)}
                        className="p-1.5 rounded-lg border border-zinc-800 hover:border-cyan-500 hover:bg-cyan-950/20 hover:text-cyan-400 text-zinc-500 transition-all cursor-pointer flex-shrink-0"
                        title="Adicionar à ficha"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Coluna Direita: Construtor da Ficha */}
          <section className="w-full lg:w-7/12">
            <form onSubmit={handleSavePlan} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-xs font-bold text-zinc-350 uppercase tracking-widest">
                Estrutura do Treino
              </h3>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-750 text-xs text-center font-semibold">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-cyan-300 text-xs text-center font-semibold animate-pulse">
                  Ficha criada e vinculada com sucesso! Redirecionando...
                </div>
              )}

              {/* Informações Básicas da Ficha */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Nome do Treino / Ficha</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Treino A - Peito & Tríceps"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-500 outline-none text-xs text-zinc-200 placeholder-zinc-400 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Divisão (Letra)</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-750 outline-none focus:border-cyan-500 transition-all"
                  >
                    {["A", "B", "C", "D", "E", "F"].map((l) => (
                      <option key={l} value={l}>
                        Ficha {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Descrição / Foco do Treino (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Foco em hipertrofia de peitoral, ênfase em porção superior."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-500 outline-none text-xs text-zinc-200 placeholder-zinc-400 transition-all"
                />
              </div>

              {/* Lista de Exercícios Selecionados */}
              <div className="space-y-4">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Exercícios Adicionados ({selectedExercises.length})</span>
                
                {selectedExercises.length === 0 ? (
                  <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 bg-zinc-50">
                    <Info className="w-6 h-6 mx-auto text-zinc-350 mb-2" />
                    <p className="text-xs">Nenhum exercício adicionado ainda.</p>
                    <p className="text-[10px] mt-0.5 text-zinc-500">Selecione exercícios na biblioteca ao lado.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {selectedExercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="p-4 bg-zinc-50 border border-zinc-800 rounded-xl space-y-3 relative group"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          className="absolute right-4 top-4 p-1.5 rounded-lg border border-zinc-850 hover:border-red-400 hover:bg-red-50 text-zinc-500 hover:text-red-650 transition-all cursor-pointer"
                          title="Remover exercício"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="pr-10">
                          <p className="text-xs font-bold text-zinc-100">{exercise.name}</p>
                          <p className="text-[9px] text-zinc-500 mt-0.5 uppercase font-semibold">
                            {exercise.muscleGroup} • {exercise.equipment}
                          </p>
                        </div>

                        {/* Parâmetros do Exercício */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-zinc-500 uppercase block">Séries</label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => handleUpdateExerciseParam(index, "sets", Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 outline-none text-xs text-zinc-200 font-mono font-bold focus:border-cyan-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-zinc-500 uppercase block">Reps</label>
                            <input
                              type="text"
                              value={exercise.reps}
                              onChange={(e) => handleUpdateExerciseParam(index, "reps", e.target.value)}
                              placeholder="Ex: 8-12, Falha"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 outline-none text-xs text-zinc-200 font-mono font-bold focus:border-cyan-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-zinc-500 uppercase block">Descanso (s)</label>
                            <input
                              type="number"
                              value={exercise.restSeconds}
                              onChange={(e) => handleUpdateExerciseParam(index, "restSeconds", Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 outline-none text-xs text-zinc-200 font-mono font-bold focus:border-cyan-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-zinc-500 uppercase block">Método</label>
                            <select
                              value={exercise.method}
                              onChange={(e) => handleUpdateExerciseParam(index, "method", e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 outline-none text-xs text-zinc-350 focus:border-cyan-500"
                            >
                              {METHODS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Parâmetros Avançados (Peso / RPE recomendados e notas) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-zinc-500 uppercase block">Peso Sugerido (kg)</label>
                            <input
                              type="number"
                              step="any"
                              placeholder="Ex: 24"
                              value={exercise.recommendedWeight || ""}
                              onChange={(e) => handleUpdateExerciseParam(index, "recommendedWeight", e.target.value ? Number(e.target.value) : null)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 outline-none text-xs text-zinc-200 font-mono focus:border-cyan-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-zinc-500 uppercase block">RPE Alvo (1-10)</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              placeholder="Ex: 8"
                              value={exercise.recommendedRpe || ""}
                              onChange={(e) => handleUpdateExerciseParam(index, "recommendedRpe", e.target.value ? Number(e.target.value) : null)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 outline-none text-xs text-zinc-200 font-mono focus:border-cyan-500"
                            />
                          </div>
                          <div className="space-y-1 col-span-2 sm:col-span-1">
                            <label className="text-[8px] font-bold text-zinc-500 uppercase block">Anotação Rápida</label>
                            <input
                              type="text"
                              placeholder="Foco na cadência..."
                              value={exercise.notes}
                              onChange={(e) => handleUpdateExerciseParam(index, "notes", e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 outline-none text-xs text-zinc-200 focus:border-cyan-500"
                            />
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão Salvar Treino */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Salvar e Atribuir Treino
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </section>

        </main>
      )}
    </div>
  );
}
