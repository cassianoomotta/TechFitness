"use client";
import BrandLogo from "@/components/BrandLogo";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Dumbbell, Lock, Mail, LogIn, Loader2 } from "lucide-react";

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
        router.push("/");
      }
    } catch (err) {
      setError("Erro interno de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-white relative overflow-hidden text-[#0F172A] min-h-screen">
      {/* Imagem de Fundo Premium */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
        style={{ backgroundImage: "url('/login_bg.png')" }}
      />
      {/* Background gradients decorativos */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#2563EB]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1E40AF]/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-2xl p-6 md:p-10 shadow-2xl relative z-10 animate-fade-in transition-all bg-white/95 backdrop-blur-sm border border-[#E2E8F0]/50">
        {/* Logo */}
        <BrandLogo className="justify-center mb-6" size={44} />

        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-semibold text-[#0F172A] tracking-tight md:text-3xl">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-[#94A3B8] mt-2">
            Insira suas credenciais para gerenciar seus treinos.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
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
                placeholder="nome@exemplo.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-sm text-[#0F172A] placeholder-zinc-400 transition-all"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Sua Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-sm text-[#0F172A] placeholder-zinc-400 transition-all"
              />
            </div>
          </div>

          {/* Botão de envio */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
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
        <div className="text-center mt-8 pt-6 border-t border-[#E2E8F0]">
          <p className="text-sm text-[#94A3B8]">
            Não possui uma conta ainda?{" "}
            <Link
              href="/register"
              className="text-[#2563EB] font-semibold hover:underline"
            >
              Criar Conta Grátis
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
