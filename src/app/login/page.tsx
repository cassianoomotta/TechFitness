"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Dumbbell, Lock, Mail, LogIn, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("E-mail ou senha incorretos.");
        setLoading(false);
        return;
      }

      // Buscar a sessão para identificar o cargo (role) e redirecionar corretamente
      const session = await getSession();

      if (session?.user?.role === "TRAINER") {
        router.push("/trainer/dashboard");
      } else if (session?.user?.role === "STUDENT") {
        router.push("/student/dashboard");
      } else {
        // Fallback genérico caso role seja indefinido
        router.push("/");
      }
    } catch (err) {
      setError("Erro interno de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-950 relative overflow-hidden">
      {/* Background gradients decorativos */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-2xl p-6 md:p-10 shadow-2xl relative z-10 animate-fade-in transition-all">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-6 h-6 text-slate-950" />
          </div>
          <span className="font-display font-bold text-2xl tracking-wider uppercase text-white">
            Pulse<span className="text-emerald-400">SaaS</span>
          </span>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight md:text-3xl">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Insira suas credenciais para gerenciar seus treinos.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-500/30 text-red-200 text-sm text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/40 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-white placeholder-slate-500 transition-all"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Sua Senha
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/40 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm text-white placeholder-slate-500 transition-all"
              />
            </div>
          </div>

          {/* Botão de envio */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Entrar no Sistema
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link para Cadastro */}
        <div className="text-center mt-8 pt-6 border-t border-zinc-900">
          <p className="text-sm text-slate-400">
            Não possui uma conta ainda?{" "}
            <Link
              href="/register"
              className="text-emerald-400 font-semibold hover:underline"
            >
              Criar Conta Grátis
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
