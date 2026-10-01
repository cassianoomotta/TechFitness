"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { User, Lock, Mail, Loader2, ArrowRight, Shield, Sun, Moon } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useTheme } from "@/components/providers/ThemeProvider";

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

      // Auto-login imediato sem fricção (Pilar 4 aprovado pelo Conselho)
      try {
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.ok) {
          if (role === "TRAINER") {
            router.push("/trainer/dashboard");
          } else {
            router.push("/student/dashboard");
          }
          return;
        }
      } catch (loginErr) {
        console.error("Erro no auto-login pós cadastro:", loginErr);
      }

      // Fallback
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setApiError("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  const { resolvedTheme, setTheme } = useTheme();

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

      {/* Background gradients decorativos */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#2563EB]/10 dark:bg-[#2563EB]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1E40AF]/10 dark:bg-[#00C2FF]/5 blur-[120px] pointer-events-none" />

      {/* Card Principal no Padrão TechFitness */}
      <div className="w-full max-w-lg bg-white/95 dark:bg-[#151D2F]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative z-10 animate-fade-in transition-all">
        {/* Logo */}
        <BrandLogo className="justify-center mb-6" size={44} />

        <div className="text-center mb-7">
          <h1 className="font-display text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight sm:text-3xl">
            Crie sua conta
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Escolha seu perfil e junte-se à evolução inteligente.
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold text-center">
            {apiError}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-center animate-pulse">
            Conta criada com sucesso! Redirecionando para o login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Seletor de Perfil (Cards Grandes) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Quem é você?
            </label>
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                  role === "STUDENT"
                    ? "bg-blue-50/70 dark:bg-blue-950/40 border-[#2563EB] dark:border-[#38BDF8] text-[#2563EB] dark:text-[#38BDF8] shadow-md shadow-blue-500/5 ring-1 ring-[#2563EB]/20 dark:ring-[#38BDF8]/20"
                    : "bg-white dark:bg-[#0B0F19] border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <User className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-sm font-bold text-[#0F172A] dark:text-white">Aluno</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Quero treinar</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("TRAINER")}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                  role === "TRAINER"
                    ? "bg-blue-50/70 dark:bg-blue-950/40 border-[#2563EB] dark:border-[#38BDF8] text-[#2563EB] dark:text-[#38BDF8] shadow-md shadow-blue-500/5 ring-1 ring-[#2563EB]/20 dark:ring-[#38BDF8]/20"
                    : "bg-white dark:bg-[#0B0F19] border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <Shield className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-sm font-bold text-[#0F172A] dark:text-white">Treinador</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Quero prescrever</p>
                </div>
              </button>
            </div>
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role[0]}</p>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 outline-none text-base md:text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>
            )}
          </div>

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
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Senha (mínimo 6 dígitos)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 outline-none text-base md:text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>
            )}
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 px-4 min-h-[48px] rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Criar Minha Conta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link para Login */}
        <div className="text-center mt-7 pt-5 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Já possui uma conta?{" "}
            <Link
              href="/login"
              className="text-[#2563EB] dark:text-[#38BDF8] font-bold hover:underline"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
