"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import UserAvatar from "@/components/UserAvatar";
import {
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function WelcomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      // Sugerir um nome inicial a partir da primeira parte do e-mail se desejar
      const suggestedName = emailParam.split("@")[0].replace(/[._-]/g, " ");
      setName(suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1));
    }
  }, [emailParam]);

  // Função para comprimir foto no cliente via Canvas
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setImagePreview(compressedDataUrl);
        }
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Endereço de e-mail é obrigatório.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A confirmação de senha não confere.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/confirm-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
          image: imagePreview || undefined,
        }),
      });

      const data = await res.json() as { error?: string; success?: boolean; message?: string };

      if (!res.ok) {
        setError(data.error || "Não foi possível confirmar o acesso.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}`);
      }, 2500);
    } catch {
      setError("Erro ao se comunicar com o servidor. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#00C2FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="flex justify-center mb-5">
          <BrandLogo size={42} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Primeiro Acesso do Aluno
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Bem-vindo ao TechFitness!
        </h1>
        <p className="text-sm text-[#64748B] mt-2 max-w-sm mx-auto">
          Seu treinador preparou o seu acesso. Confirme seus dados e crie sua senha pessoal para começar a treinar.
        </p>
      </div>

      {success ? (
        <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-[#0F172A]">Conta Ativada com Sucesso!</h3>
          <p className="text-sm text-[#64748B] max-w-xs mx-auto">
            Sua senha e perfil foram configurados. Redirecionando você para o painel de acesso...
          </p>
          <div className="flex justify-center pt-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Foto de Perfil Opcional */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <UserAvatar
                name={name || "Aluno"}
                image={imagePreview}
                size="xl"
                expandable={false}
                className="border-4 border-blue-100 shadow-md group-hover:scale-105 transition-transform"
              />
              <div className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white group-hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-[#94A3B8] font-medium mt-2.5">
              {imagePreview ? "Foto selecionada! Clique para trocar." : "Adicione uma foto de perfil (opcional)"}
            </p>
          </div>

          {/* Dados do Aluno */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Seu Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Silva"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Endereço de E-mail
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <ShieldCheck className="w-3 h-3" /> E-mail Oficial
                </span>
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={email}
                  readOnly={!!emailParam}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className={`w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-xl text-sm font-medium transition-all ${
                    emailParam
                      ? "bg-slate-100 text-[#64748B] cursor-not-allowed opacity-90"
                      : "bg-[#F8FAFC] text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Senha e Confirmação */}
          <div className="space-y-4 pt-2 border-t border-[#E2E8F0]">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Criar Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua nova senha"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ativando sua conta...</span>
              </>
            ) : (
              <>
                <span>Ativar Minha Conta & Acessar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs font-bold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              Já possui senha de acesso? <span className="text-[#2563EB]">Fazer Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 relative">
      <Suspense
        fallback={
          <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center shadow-xl">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#64748B] font-medium">Carregando formulário de boas-vindas...</p>
          </div>
        }
      >
        <WelcomeContent />
      </Suspense>
    </div>
  );
}
