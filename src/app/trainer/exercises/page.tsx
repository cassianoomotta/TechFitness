"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Dumbbell,
  LogOut,
  Search,
  Plus,
  Loader2,
  X,
  Edit2,
  Trash2,
  Tv,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  description: string | null;
  videoUrl: string | null;
  gifUrl: string | null;
  alternatives: string[];
}

const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Pernas",
  "Ombros",
  "Braços",
  "Core",
  "Cardio",
];

const EQUIPMENTS = [
  "Halteres",
  "Barra",
  "Máquina",
  "Polia",
  "Peso Corporal",
  "Outros",
];

export default function ExercisesPage() {
  const { data: session } = useSession();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("todos");
  const [selectedEquipment, setSelectedEquipment] = useState("todos");

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  
  // Campos do Formulário
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("Peito");
  const [equipment, setEquipment] = useState("Halteres");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchExercises = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedMuscle) params.append("muscle", selectedMuscle);
      if (selectedEquipment) params.append("equipment", selectedEquipment);

      const response = await fetch(`/api/exercises?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error("Erro ao buscar exercícios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [searchQuery, selectedMuscle, selectedEquipment]);

  const handleOpenCreateModal = () => {
    setEditingExercise(null);
    setName("");
    setMuscleGroup("Peito");
    setEquipment("Halteres");
    setDescription("");
    setVideoUrl("");
    setGifUrl("");
    setAlternatives([]);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setName(exercise.name);
    setMuscleGroup(exercise.muscleGroup);
    setEquipment(exercise.equipment);
    setDescription(exercise.description || "");
    setVideoUrl(exercise.videoUrl || "");
    setGifUrl(exercise.gifUrl || "");
    setAlternatives(exercise.alternatives || []);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    const url = editingExercise
      ? `/api/exercises/${editingExercise.id}`
      : "/api/exercises";
    const method = editingExercise ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          muscleGroup,
          equipment,
          description,
          videoUrl,
          gifUrl,
          alternatives,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalError(data.error || "Ocorreu um erro ao salvar o exercício.");
        return;
      }

      setIsModalOpen(false);
      fetchExercises();
    } catch (err) {
      setModalError("Erro de conexão.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm("Tem certeza de que deseja excluir este exercício?")) return;

    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erro ao deletar exercício.");
        return;
      }

      fetchExercises();
    } catch (error) {
      alert("Erro de conexão.");
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
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-900 text-emerald-400 border border-zinc-800"
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
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Mobile */}
        <div className="flex md:hidden gap-2 mb-6">
          <Link
            href="/trainer/dashboard"
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center bg-transparent text-zinc-400 border border-zinc-900"
          >
            Alunos
          </Link>
          <Link
            href="/trainer/exercises"
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center bg-zinc-900 text-emerald-400 border border-zinc-800"
          >
            Exercícios
          </Link>
        </div>

        {/* Section Title & Add Button */}
        <section className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Biblioteca de Exercícios</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Visualize, adicione ou edite os exercícios disponíveis para montagem de treino.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3px]" />
            Adicionar Exercício
          </button>
        </section>

        {/* Filter Bar */}
        <section className="glass-card rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por nome do exercício..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-zinc-900 focus:border-emerald-500 outline-none text-xs text-white placeholder-zinc-600 transition-all"
            />
          </div>

          {/* Muscle Filter */}
          <div className="w-full md:w-48 flex flex-col gap-1">
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-zinc-900 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition-all"
            >
              <option value="todos">Todos os Músculos</option>
              {MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Filter */}
          <div className="w-full md:w-48 flex flex-col gap-1">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-zinc-900 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition-all"
            >
              <option value="todos">Todos Equipamentos</option>
              {EQUIPMENTS.map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Exercises Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
            <p className="text-sm">Carregando biblioteca de exercícios...</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-zinc-400">
            <Dumbbell className="w-12 h-12 mx-auto text-zinc-700 mb-4 animate-pulse" />
            <p className="text-base font-semibold text-white">Nenhum exercício encontrado</p>
            <p className="text-sm mt-1">Tente ajustar seus filtros de busca ou crie um novo exercício.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 border border-zinc-900 hover:border-zinc-800"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-display font-semibold text-white leading-snug group-hover:text-emerald-400 transition-colors">
                      {exercise.name}
                    </h3>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/5">
                      {exercise.muscleGroup}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/5">
                      {exercise.equipment}
                    </span>
                  </div>

                  {exercise.description && (
                    <p className="text-xs text-zinc-400 line-clamp-3 mb-6 leading-relaxed">
                      {exercise.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-900 mt-auto">
                  <div className="flex gap-2">
                    {exercise.videoUrl && (
                      <a
                        href={exercise.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                        title="Ver vídeo demonstrativo"
                      >
                        <Tv className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Edit/Delete Actions (Only for professional users) */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEditModal(exercise)}
                      className="p-2 rounded-lg hover:bg-slate-900 text-zinc-500 hover:text-emerald-400 transition-all cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="p-2 rounded-lg hover:bg-slate-900 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 shadow-2xl relative border border-zinc-800 max-h-[90vh] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-white">
                {editingExercise ? "Editar Exercício" : "Adicionar Novo Exercício"}
              </h3>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-200 text-xs text-center">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Nome do Exercício
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Agachamento Livre, Supino Reto"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-zinc-800 focus:border-emerald-500 outline-none text-xs text-white placeholder-zinc-650 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Grupo Muscular */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Grupo Muscular Primário
                  </label>
                  <select
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-zinc-800 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition-all"
                  >
                    {MUSCLE_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Equipamento */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Equipamento
                  </label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-zinc-800 text-xs text-zinc-300 outline-none focus:border-emerald-500 transition-all"
                  >
                    {EQUIPMENTS.map((eq) => (
                      <option key={eq} value={eq}>
                        {eq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Instruções de Execução (Opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instruções para posicionamento, execução, respiração, etc."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-zinc-800 focus:border-emerald-500 outline-none text-xs text-white placeholder-zinc-650 transition-all resize-none"
                />
              </div>

              {/* URLs (Vídeo e GIF) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    URL do Vídeo Demonstrativo (Opcional)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-zinc-800 focus:border-emerald-500 outline-none text-xs text-white placeholder-zinc-650 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    URL do GIF de Movimento (Opcional)
                  </label>
                  <input
                    type="url"
                    value={gifUrl}
                    onChange={(e) => setGifUrl(e.target.value)}
                    placeholder="https://exemplo.com/exercicio.gif"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-zinc-800 focus:border-emerald-500 outline-none text-xs text-white placeholder-zinc-650 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-4"
              >
                {modalLoading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    {editingExercise ? "Salvar Alterações" : "Adicionar Exercício"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
