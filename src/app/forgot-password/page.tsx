"use client";

import React, { useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowLeft, Check, Loader2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

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
    <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-white relative overflow-hidden text-[#0F172A] min-h-screen">
      {/* Background gradients decorativos */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#2563EB]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1E40AF]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-2xl p-6 md:p-10 shadow-2xl relative z-10 animate-fade-in transition-all bg-white/95 backdrop-blur-sm border border-[#E2E8F0]/80">
        {/* Logo */}
        <BrandLogo className="justify-center mb-6" size={44} />

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-xs font-semibold mb-3">
            <KeyRound className="w-3.5 h-3.5" /> Recuperação de Acesso
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight md:text-3xl">
            Redefinir Senha
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
            Informe seu e-mail cadastrado e defina sua nova senha de acesso.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage} Redirecionando para o login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-mail */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] placeholder-zinc-400 transition-all"
              />
            </div>
          </div>

          {/* Nova Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] placeholder-zinc-400 transition-all"
              />
            </div>
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] placeholder-zinc-400 transition-all"
              />
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={loading || !!successMessage}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Salvar Nova Senha"
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center space-y-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o Login
          </Link>
          <p className="text-[11px] text-[#94A3B8]">
            Se preferir, seu Personal Trainer também pode redefinir sua senha diretamente.
          </p>
        </div>
      </div>
    </main>
  );
}
