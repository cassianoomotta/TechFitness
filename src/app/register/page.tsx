"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, User, Lock, Mail, Loader2, ArrowRight, Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"TRAINER" | "STUDENT">("STUDENT");
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setApiError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setApiError(data.error || "Ocorreu um erro ao realizar o cadastro.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setApiError("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-50 relative overflow-hidden text-zinc-900">
      {/* Background gradients decorativos */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-lime-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg glass-card rounded-2xl p-6 md:p-10 shadow-2xl relative z-10 animate-fade-in transition-all">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="bg-gradient-to-tr from-emerald-500 to-lime-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/10">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-wider uppercase text-zinc-900">
            Tech<span className="text-emerald-500">Fitness</span>
          </span>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-semibold text-zinc-900 tracking-tight md:text-3xl">
            Crie sua conta
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Escolha seu perfil e junte-se à evolução inteligente.
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {apiError}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center animate-pulse">
            Conta criada com sucesso! Redirecionando para o login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seletor de Perfil (Cards Grandes) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
              Quem é você?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  role === "STUDENT"
                    ? "bg-zinc-100 border-emerald-500 text-emerald-600 shadow-md shadow-emerald-500/5"
                    : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300"
                }`}
              >
                <User className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-800">Aluno</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Quero treinar</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("TRAINER")}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  role === "TRAINER"
                    ? "bg-zinc-100 border-emerald-500 text-emerald-600 shadow-md shadow-emerald-500/5"
                    : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300"
                }`}
              >
                <Shield className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-800">Treinador</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Quero prescrever</p>
                </div>
              </button>
            </div>
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role[0]}</p>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-sm text-zinc-800 placeholder-zinc-400 transition-all"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-sm text-zinc-800 placeholder-zinc-400 transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
              Senha (min. 6 dígitos)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-sm text-zinc-800 placeholder-zinc-400 transition-all"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>
            )}
          </div>

          {/* Botão de envio */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Criar Minha Conta
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link para Login */}
        <div className="text-center mt-8 pt-6 border-t border-zinc-200">
          <p className="text-sm text-zinc-500">
            Já possui uma conta?{" "}
            <Link
              href="/login"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
