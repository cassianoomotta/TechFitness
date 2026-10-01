"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Lock, Mail, LogIn, Loader2, Sun, Moon } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

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
        router.push("/");
      }
    } catch {
      setError("Erro interno de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-[#F8FAFC] dark:bg-[#0B0F19] relative overflow-hidden text-[#0F172A] dark:text-white min-h-screen transition-colors duration-200">
      {/* Botão Flutuante de Alternância Rápida de Tema */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#151D2F]/90 backdrop-blur-md hover:border-[#2563EB]/40 dark:hover:border-[#38BDF8]/40 text-slate-600 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-[#38BDF8] transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-sm"
          title={resolvedTheme === "dark" ? "Mudar para Modo Claro (Padrão)" : "Mudar para Modo Escuro"}
          aria-label="Alternar tema de cores"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Imagem de Fundo Premium */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-[0.04] pointer-events-none transition-opacity"
        style={{ backgroundImage: "url('/login_bg.png')" }}
      />
      {/* Background gradients decorativos */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#2563EB]/10 dark:bg-[#2563EB]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1E40AF]/10 dark:bg-[#00C2FF]/5 blur-[120px] pointer-events-none" />

      {/* Card Principal no Padrão TechFitness */}
      <div className="w-full max-w-md bg-white/95 dark:bg-[#151D2F]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative z-10 animate-fade-in transition-all">
        {/* Logo Oficial */}
        <BrandLogo className="justify-center mb-6" size={44} />

        <div className="text-center mb-7">
          <h1 className="font-display text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight sm:text-3xl">
            Bem-vindo de volta
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Insira suas credenciais para gerenciar seus treinos.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                required
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 outline-none text-base md:text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Sua Senha
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-[#2563EB] dark:text-[#38BDF8] hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 outline-none text-base md:text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 min-h-[48px] rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link para Cadastro */}
        <div className="text-center mt-7 pt-5 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Não possui uma conta ainda?{" "}
            <Link
              href="/register"
              className="text-[#2563EB] dark:text-[#38BDF8] font-bold hover:underline"
            >
              Criar Conta Grátis
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

