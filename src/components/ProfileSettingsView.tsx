"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
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
  LogOut,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ProfileSettingsViewProps {
  backUrl: string;
  roleLabel: string;
}

export default function ProfileSettingsView({ backUrl, roleLabel }: ProfileSettingsViewProps) {
  const { theme, setTheme } = useTheme();
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
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] pb-6 sm:py-10 px-4 sm:px-6 lg:px-8 pt-safe transition-colors duration-200"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.5rem)" }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cabeçalho de Navegação */}
        <div className="flex items-center justify-between">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-[#38BDF8] bg-white dark:bg-[#151D2F] border border-[#E2E8F0] dark:border-[#27354A] px-3.5 py-2 rounded-xl shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-[#1E293B] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Link>

          <BrandLogo size={32} href={backUrl} />
        </div>

        {/* Título da Página */}
        <div className="bg-white dark:bg-[#151D2F] border border-[#E2E8F0] dark:border-[#27354A] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 transition-colors">
          <div className="relative group cursor-pointer" onClick={() => setIsPhotoModalOpen(true)}>
            <UserAvatar
              name={name}
              image={image}
              size="xl"
              expandable={false}
              className="border-4 border-white dark:border-[#1E293B] shadow-xl ring-2 ring-[#2563EB]/20"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPhotoModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 p-2 bg-[#2563EB] text-white rounded-full shadow-lg hover:bg-[#1E40AF] transition-colors cursor-pointer border-2 border-white dark:border-[#1E293B]"
              title="Alterar foto de perfil"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-800 inline-block mb-1.5">
              {roleLabel}
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white truncate">
              {name || "Meu Perfil"}
            </h1>
            <p className="text-xs text-[#94A3B8] dark:text-slate-400 truncate mt-0.5">{email}</p>

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
          <div className="bg-white dark:bg-[#151D2F] border border-[#E2E8F0] dark:border-[#27354A] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#27354A]">
              <User className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Dados Pessoais</h2>
            </div>

            {profileError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] dark:text-slate-300 uppercase tracking-wider block">
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
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#27354A] focus:border-[#2563EB] dark:focus:border-[#38BDF8] outline-none text-base md:text-sm text-[#0F172A] dark:text-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* E-mail (Bloqueado) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#475569] dark:text-slate-300 uppercase tracking-wider block">
                    Endereço de E-mail
                  </label>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Bloqueado
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-base md:text-sm text-[#64748B] dark:text-slate-400 cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[10px] text-[#94A3B8] dark:text-slate-500 leading-tight">
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

          {/* Card 2: Aparência e Tema */}
          <div className="bg-white dark:bg-[#151D2F] border border-[#E2E8F0] dark:border-[#27354A] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#27354A]">
                <Moon className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Aparência e Tema</h2>
              </div>

              <p className="text-xs text-[#475569] dark:text-slate-400 mt-3 leading-relaxed">
                Escolha o modo de exibição ideal para o seu treino. O tema escuro reduz a fadiga visual e economiza bateria em telas OLED.
              </p>

              <div className="grid grid-cols-3 gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`min-h-[52px] p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    theme === "light"
                      ? "border-[#2563EB] bg-blue-50/80 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 shadow-2xs"
                      : "border-[#E2E8F0] dark:border-[#27354A] bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span>Claro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`min-h-[52px] p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    theme === "dark"
                      ? "border-[#2563EB] bg-blue-50/80 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 shadow-2xs"
                      : "border-[#E2E8F0] dark:border-[#27354A] bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Moon className="w-5 h-5 text-blue-500" />
                  <span>Escuro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`min-h-[52px] p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    theme === "system"
                      ? "border-[#2563EB] bg-blue-50/80 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 shadow-2xs"
                      : "border-[#E2E8F0] dark:border-[#27354A] bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Laptop className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span>Sistema</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Tema ativo no momento: <strong className="text-slate-700 dark:text-slate-300 capitalize">{theme === "system" ? "Automático (Sistema)" : theme === "dark" ? "Modo Escuro" : "Modo Claro"}</strong>
              </span>
            </div>
          </div>

          {/* Card 3: Segurança e Senha */}
          <div className="bg-white dark:bg-[#151D2F] border border-[#E2E8F0] dark:border-[#27354A] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#27354A]">
              <Shield className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Segurança e Senha</h2>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-3.5">
              {/* Senha Atual */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] dark:text-slate-300 uppercase tracking-wider block">
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
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#27354A] focus:border-[#2563EB] dark:focus:border-[#38BDF8] outline-none text-base md:text-sm text-[#0F172A] dark:text-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] dark:text-slate-300 uppercase tracking-wider block">
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
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#27354A] focus:border-[#2563EB] dark:focus:border-[#38BDF8] outline-none text-base md:text-sm text-[#0F172A] dark:text-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#475569] dark:text-slate-300 uppercase tracking-wider block">
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
                    className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#27354A] focus:border-[#2563EB] dark:focus:border-[#38BDF8] outline-none text-base md:text-sm text-[#0F172A] dark:text-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-2 shadow-sm"
              >
                {savingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Atualizar Senha"
                )}
              </button>
            </form>
          </div>

          {/* Card 4: Sessão e Desconexão da Conta */}
          <div className="bg-white dark:bg-[#151D2F] border border-[#E2E8F0] dark:border-[#27354A] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#27354A]">
              <LogOut className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Encerrar Sessão</h2>
            </div>

            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Deseja desconectar sua conta deste dispositivo? Você precisará inserir suas credenciais novamente para acessar seus treinos e métricas.
            </p>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full sm:w-auto px-5 py-3 min-h-[44px] rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/40 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Minha Conta</span>
            </button>
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
