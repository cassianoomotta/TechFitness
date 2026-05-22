"use client";

import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Dumbbell,
  LogOut,
  Search,
  Plus,
  User,
  Mail,
  Loader2,
  Users,
  Activity,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X,
  Lock,
} from "lucide-react";

interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  workoutPlansCount: number;
  sessionsCount: number;
}

export default function TrainerDashboard() {
  const { data: session } = useSession();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal de Cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("123456"); // Senha padrão sugerida
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);

  // Buscar alunos
  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/trainer/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    setModalSuccess(false);

    try {
      const response = await fetch("/api/trainer/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudentName,
          email: newStudentEmail,
          password: newStudentPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalError(data.error || "Ocorreu um erro ao cadastrar o aluno.");
        return;
      }

      setModalSuccess(true);
      setNewStudentName("");
      setNewStudentEmail("");
      setNewStudentPassword("123456");
      
      // Atualizar lista
      fetchStudents();

      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess(false);
      }, 1500);
    } catch (err) {
      setModalError("Erro de conexão com o servidor.");
    } finally {
      setModalLoading(false);
    }
  };

  // Filtrar lista de alunos
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40">
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
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-900 text-cyan-400 border border-zinc-800"
              >
                Alunos
              </Link>
              <Link
                href="/trainer/exercises"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-500 hover:text-zinc-950 transition-colors"
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
              className="p-2.5 rounded-xl border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 text-zinc-500 hover:text-red-650 transition-all cursor-pointer"
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
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center bg-zinc-900 text-cyan-400 border border-zinc-800"
          >
            Alunos
          </Link>
          <Link
            href="/trainer/exercises"
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center bg-transparent text-zinc-500 border border-zinc-800"
          >
            Exercícios
          </Link>
        </div>

        {/* Info Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6 rounded-2xl bg-zinc-900 border border-zinc-800/85">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-500 text-sm font-medium">Alunos Ativos</span>
              <div className="bg-cyan-500/10 p-2.5 rounded-xl text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-zinc-100">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-500" /> : students.length}
            </p>
            <p className="text-xs text-zinc-500 mt-2">Vagas ocupadas no plano</p>
          </div>

          <div className="glass-card p-6 rounded-2xl bg-zinc-900 border border-zinc-800/85">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-500 text-sm font-medium">Fichas Prescritas</span>
              <div className="bg-cyan-500/10 p-2.5 rounded-xl text-cyan-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-zinc-100">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              ) : (
                students.reduce((acc, curr) => acc + curr.workoutPlansCount, 0)
              )}
            </p>
            <p className="text-xs text-zinc-500 mt-2">Planos de treino ativos</p>
          </div>

          <div className="glass-card p-6 rounded-2xl bg-zinc-900 border border-zinc-800/85">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-500 text-sm font-medium">Frequência Mensal</span>
              <div className="bg-cyan-500/10 p-2.5 rounded-xl text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-zinc-100">88.5%</p>
            <p className="text-xs text-zinc-500 mt-2">Presença geral dos alunos</p>
          </div>

          <div className="glass-card p-6 rounded-2xl bg-zinc-900 border border-zinc-800/85">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-500 text-sm font-medium">Recordes Batidos</span>
              <div className="bg-cyan-500/10 p-2.5 rounded-xl text-cyan-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-zinc-100">24</p>
            <p className="text-xs text-zinc-500 mt-2">PRs superados esta semana</p>
          </div>
        </section>

        {/* Section Header & Search */}
        <section className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-zinc-100">Seus Alunos</h2>
            <p className="text-sm text-zinc-500 mt-1">Gerencie a evolução e fichas de seus atletas.</p>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-500 outline-none text-sm text-zinc-200 placeholder-zinc-400 transition-all"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/10"
            >
              <Plus className="w-4.5 h-4.5 stroke-[3px]" />
              <span className="hidden sm:inline">Novo Aluno</span>
            </button>
          </div>
        </section>

        {/* Students List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-2" />
            <p className="text-sm">Carregando lista de alunos...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-zinc-500 bg-zinc-900">
            <Users className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
            <p className="text-base font-semibold text-zinc-200">Nenhum aluno encontrado</p>
            <p className="text-xs mt-1">Busque por outro termo ou cadastre um novo aluno no botão acima.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const initials = student.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div key={student.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between group transition-all duration-300 bg-zinc-900 border border-zinc-800/80 hover:border-cyan-500/30">
                  <div>
                    {/* Aluno Header */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-cyan-950/20 border border-cyan-900/50 flex items-center justify-center font-display font-extrabold text-cyan-400 tracking-wider">
                        {initials}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-base font-semibold text-zinc-100 truncate leading-tight group-hover:text-cyan-400 transition-colors">
                          {student.name}
                        </h4>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{student.email}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-900 mb-6">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Treinos Criados</span>
                        <span className="text-lg font-bold text-zinc-200 mt-1 block">
                          {student.workoutPlansCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Sessões Feitas</span>
                        <span className="text-lg font-bold text-zinc-200 mt-1 block">
                          {student.sessionsCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/trainer/students/${student.id}/new-plan`}
                      className="flex-1 py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/30 hover:bg-zinc-200/50 text-cyan-300 text-xs font-semibold text-center transition-all cursor-pointer"
                    >
                      Montar Treino
                    </Link>
                    <Link
                      href={`/trainer/students/${student.id}/progress`}
                      className="py-2 px-3 rounded-lg bg-transparent border border-zinc-800 hover:border-zinc-300 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-100 text-xs font-semibold flex items-center justify-center transition-all"
                      title="Ver Progresso"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Novo Aluno */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 shadow-2xl relative border border-zinc-800">
            {/* Fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg border border-zinc-850 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="bg-cyan-950/20 p-2 rounded-lg text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-zinc-100">Cadastrar Novo Aluno</h3>
            </div>

            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              O aluno será criado com o papel de Aluno (STUDENT) e ficará imediatamente vinculado ao seu perfil para prescrição de treinos.
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-750 text-xs text-center">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-cyan-300 text-xs text-center">
                Aluno cadastrado com sucesso!
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Nome do Aluno
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Ex: Pedro Henrique"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-500 outline-none text-xs text-zinc-200 placeholder-zinc-400 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  E-mail de Login
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="aluno@exemplo.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-500 outline-none text-xs text-zinc-200 placeholder-zinc-400 transition-all"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                  Senha Temporária (Mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={newStudentPassword}
                    onChange={(e) => setNewStudentPassword(e.target.value)}
                    placeholder="Defina a senha"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-cyan-500 outline-none text-xs text-zinc-200 placeholder-zinc-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={modalLoading || modalSuccess}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {modalLoading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    Confirmar Cadastro
                    <ArrowRight className="w-4 h-4" />
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
