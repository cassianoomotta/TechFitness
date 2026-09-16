"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import UserAvatar from "@/components/UserAvatar";
import EditProfilePhotoModal from "@/components/EditProfilePhotoModal";
import {
  ArrowLeft,
  Camera,
  Lock,
  Mail,
  User,
  Check,
  Loader2,
  Shield,
  KeyRound,
  AlertCircle,
  Trash2,
} from "lucide-react";

interface ProfileSettingsViewProps {
  backUrl: string;
  roleLabel: string;
}

export default function ProfileSettingsView({ backUrl, roleLabel }: ProfileSettingsViewProps) {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Dados Cadastrais
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // Alteração de Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Mensagens
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Modal de Foto
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Carregar dados atuais
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
          setImage(data.image || null);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Salvar Nome / Foto
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error || "Erro ao salvar dados.");
      } else {
        setProfileSuccess(data.message || "Dados cadastrais atualizados!");
        setTimeout(() => setProfileSuccess(""), 4000);
      }
    } catch {
      setProfileError("Erro de conexão com o servidor.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Alterar Senha
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("A nova senha e a confirmação não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Não foi possível alterar a senha.");
      } else {
        setPasswordSuccess(data.message || "Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(""), 4000);
      }
    } catch {
      setPasswordError("Erro de conexão ao alterar a senha.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cabeçalho de Navegação */}
        <div className="flex items-center justify-between">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#2563EB] bg-white border border-[#E2E8F0] px-3.5 py-2 rounded-xl shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Link>

          <BrandLogo size={32} />
        </div>

        {/* Título da Página */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => setIsPhotoModalOpen(true)}>
            <UserAvatar
              name={name}
              image={image}
              size="xl"
              className="border-4 border-white shadow-xl ring-2 ring-[#2563EB]/20"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPhotoModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 p-2 bg-[#2563EB] text-white rounded-full shadow-lg hover:bg-[#1E40AF] transition-colors cursor-pointer border-2 border-white"
              title="Alterar foto de perfil"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100 inline-block mb-1.5">
              {roleLabel}
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F172A] truncate">
              {name || "Meu Perfil"}
            </h1>
            <p className="text-xs text-[#94A3B8] truncate mt-0.5">{email}</p>

            {image && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm("Deseja remover sua foto de perfil?")) {
                    await fetch("/api/user/profile-photo", { method: "DELETE" });
                    setImage(null);
                  }
                }}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors border border-red-200/60 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remover foto de perfil
              </button>
            )}
          </div>
        </div>

        {/* Grid de Configurações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Dados Pessoais */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
              <User className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Dados Pessoais</h2>
            </div>

            {profileError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
                  />
                </div>
              </div>

              {/* E-mail (Bloqueado) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block">
                    Endereço de E-mail
                  </label>
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Bloqueado
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-[#64748B] cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-tight">
                  Por motivos de segurança e integridade, o e-mail não pode ser alterado.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2 shadow-sm"
              >
                {savingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Salvar Alterações"
                )}
              </button>
            </form>
          </div>

          {/* Card 2: Segurança & Senha */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
              <Shield className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Segurança & Senha</h2>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-3.5">
              {/* Senha Atual */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block">
                  Senha Atual
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Sua senha atual"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
                  />
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block">
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
                  />
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider block">
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2 shadow-sm"
              >
                {savingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Atualizar Senha"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Foto de Perfil */}
      <EditProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentImage={image}
        userName={name}
        onPhotoUpdated={(newUrl) => setImage(newUrl)}
      />
    </div>
  );
}
