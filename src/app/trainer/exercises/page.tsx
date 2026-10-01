"use client";
import BrandLogo from "@/components/BrandLogo";

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
  Sun,
  Moon,
} from "lucide-react";
import DumbbellLoading from "@/components/DumbbellLoading";
import { useTheme } from "@/components/providers/ThemeProvider";


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
  "Aquecimento e Mobilidade",
  "Outros",
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
  const { resolvedTheme, setTheme } = useTheme();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("todos");
  const [selectedEquipment, setSelectedEquipment] = useState("todos");

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  
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

  const getMuscleGroupStyle = (group: string) => {
    switch (group) {
      case "Peito": return "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/40";
      case "Costas": return "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/40";
      case "Pernas": return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40";
      case "Ombros": return "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40";
      case "Braços": return "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-900/40";
      case "Core": return "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-900/40";
      case "Cardio": return "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-900/40";
      case "Aquecimento e Mobilidade": return "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200/50 dark:border-teal-900/40";
      default: return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-700";
    }
  };

  const fetchExercises = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedMuscle) params.append("muscle", selectedMuscle);
      if (selectedEquipment) params.append("equipment", selectedEquipment);

      const response = await fetch(`/api/exercises?${params.toString()}`, { cache: 'no-store' });
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
    } catch {
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
    } catch {
      alert("Erro de conexão.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* Header com suporte a Safe Area */}
      <header 
        className="border-b border-[#E2E8F0]/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-40 pt-safe transition-colors"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo size={36} href="/trainer/dashboard" />

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/trainer/dashboard"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#94A3B8] dark:text-slate-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                Alunos
              </Link>
              <Link
                href="/trainer/exercises"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-[#151D2F] text-[#2563EB] dark:text-[#38BDF8] border border-[#E2E8F0] dark:border-slate-700"
              >
                Exercícios
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
                {session?.user?.name || "Professor"}
              </p>
              <p className="text-[10px] text-[#2563EB] dark:text-[#38BDF8] font-bold uppercase tracking-wider">
                Personal Trainer
              </p>
            </div>

            {/* Alternância Rápida de Tema */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#151D2F] hover:border-[#2563EB]/40 dark:hover:border-[#38BDF8]/40 text-[#64748B] dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-[#38BDF8] transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-2xs"
              title={resolvedTheme === "dark" ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              aria-label="Alternar tema de cores"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151D2F] hover:border-red-500/30 hover:bg-red-500/5 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer shadow-2xs"
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
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center bg-transparent text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
          >
            Alunos
          </Link>
          <Link
            href="/trainer/exercises"
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center bg-white dark:bg-[#151D2F] text-[#2563EB] dark:text-[#38BDF8] border border-slate-200 dark:border-slate-800 shadow-2xs"
          >
            Exercícios
          </Link>
        </div>

        {/* Section Title & Add Button */}
        <section className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Biblioteca de Exercícios</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Visualize, adicione ou edite os exercícios disponíveis para montagem de treino.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/15 active:scale-95"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3px]" />
            Adicionar Exercício
          </button>
        </section>

        {/* Filter Bar */}
        <section className="rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#151D2F] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome do exercício..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
            />
          </div>

          {/* Muscle Filter */}
          <div className="w-full md:w-48 flex flex-col gap-1">
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-[#2563EB] transition-all shadow-2xs"
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
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-[#2563EB] transition-all shadow-2xs"
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
          <DumbbellLoading text="Carregando biblioteca de exercícios..." subtext="Acessando banco com +300 movimentos cadastrados" />
        ) : exercises.length === 0 ? (
          <div className="rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#151D2F] border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Dumbbell className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
            <p className="text-base font-bold text-slate-900 dark:text-white">Nenhum exercício encontrado</p>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">Tente ajustar seus filtros de busca ou crie um novo exercício.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="rounded-2xl p-6 flex flex-col justify-between bg-white dark:bg-[#151D2F] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-[#2563EB]/40 dark:hover:border-[#38BDF8]/40 transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-display font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#2563EB] dark:group-hover:text-[#38BDF8] transition-colors">
                      {exercise.name}
                    </h3>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getMuscleGroupStyle(exercise.muscleGroup)}`}>
                      {exercise.muscleGroup}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {exercise.equipment}
                    </span>
                  </div>

                  {exercise.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                      {exercise.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800 mt-auto">
                  <div className="flex gap-2">
                    {(exercise.videoUrl || exercise.gifUrl) && (
                      <button
                        onClick={() => setActiveVideoUrl(exercise.gifUrl || exercise.videoUrl)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-[#00C2FF]/10 text-slate-600 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-[#38BDF8] transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="Ver demonstração"
                      >
                        <Tv className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Edit/Delete Actions (Only for professional users) */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEditModal(exercise)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#2563EB] dark:hover:text-[#38BDF8] transition-all cursor-pointer active:scale-95"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#151D2F] rounded-2xl p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="bg-cyan-50 dark:bg-cyan-950/40 p-2 rounded-lg text-[#2563EB] dark:text-[#38BDF8] border border-cyan-100 dark:border-cyan-900/40">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                {editingExercise ? "Editar Exercício" : "Adicionar Novo Exercício"}
              </h3>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs text-center">
                {modalError}
              </div>
            )}

            <div className="w-full">
              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Nome do Exercício
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Agachamento Livre, Supino Reto"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Grupo Muscular */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Grupo Muscular Primário
                    </label>
                    <select
                      value={muscleGroup}
                      onChange={(e) => setMuscleGroup(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-[#2563EB] transition-all shadow-2xs"
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
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Equipamento
                    </label>
                    <select
                      value={equipment}
                      onChange={(e) => setEquipment(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-[#2563EB] transition-all shadow-2xs"
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
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Instruções de Execução (Opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Instruções para posicionamento, execução, respiração, etc."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all resize-none shadow-2xs"
                  />
                </div>

                {/* URLs (Vídeo e GIF) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      URL do Vídeo Demonstrativo (Opcional)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      URL do GIF de Movimento (Opcional)
                    </label>
                    <input
                      type="url"
                      value={gifUrl}
                      onChange={(e) => setGifUrl(e.target.value)}
                      placeholder="https://exemplo.com/exercicio.gif"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-4 shadow-md shadow-blue-500/20 active:scale-95"
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
        </div>
      )}

      {/* Modal Player de Vídeo */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#151D2F] rounded-2xl p-4 shadow-2xl relative border border-slate-200 dark:border-slate-800">
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
                    <img src={getMediaUrl(activeVideoUrl)} alt="Execução" className="w-full h-full object-contain bg-black" />
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
