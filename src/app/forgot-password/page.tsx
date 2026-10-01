"use client";

import React, { useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowLeft, Check, Loader2, KeyRound, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível redefinir a senha.");
      } else {
        setSuccessMessage(data.message || "Senha redefinida com sucesso!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setError("Erro de conexão com o servidor. Tente novamente.");
    } finally {
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

      {/* Background gradients decorativos */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#2563EB]/10 dark:bg-[#2563EB]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1E40AF]/10 dark:bg-[#00C2FF]/5 blur-[120px] pointer-events-none" />

      {/* Card Principal no Padrão TechFitness */}
      <div className="w-full max-w-md bg-white/95 dark:bg-[#151D2F]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative z-10 animate-fade-in transition-all">
        {/* Logo */}
        <BrandLogo className="justify-center mb-6" size={44} />

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[#2563EB] dark:text-[#38BDF8] text-xs font-bold mb-3 shadow-2xs">
            <KeyRound className="w-3.5 h-3.5" /> Recuperação de Acesso
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight sm:text-3xl">
            Redefinir Senha
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Informe seu e-mail cadastrado e defina sua nova senha de acesso.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage} Redirecionando para o login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-mail */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 outline-none text-base md:text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Nova Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 outline-none text-base md:text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full pl-10 pr-4 py-3 min-h-[48px] rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 focus:border-[#2563EB] dark:focus:border-[#00C2FF] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 outline-none text-base md:text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={loading || !!successMessage}
            className="w-full py-3.5 px-4 min-h-[48px] rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Salvar Nova Senha"
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#2563EB] dark:hover:text-[#38BDF8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o Login
          </Link>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Se preferir, seu Personal Trainer também pode redefinir sua senha diretamente.
          </p>
        </div>
      </div>
    </main>
  );
}
