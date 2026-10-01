"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Check,
  ArrowRight,
  Award,
  Sparkles,
  Share2,
  RotateCw,
  Flame,
  Zap,
  Copy,
  Info,
} from "lucide-react";
import type { TonnageCuriosity, TonnageCuriosityCategory } from "@/lib/gamification";

interface PRBeaten {
  exerciseName: string;
  weight: number;
  previousWeight: number;
}

interface NewAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  tier: number;
}

interface WorkoutVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  volumeKg: number;
  tonnageComparison?: {
    tonnageKg: number;
    label: string;
    icon: string;
    comparisonText: string;
    category?: string;
    funFact?: string;
    curiosities?: TonnageCuriosity[];
    workJoules?: number;
    workKcal?: number;
  } | null;
  photoUrl?: string | null;
  xpEarned: number;
  totalXp?: number;
  level: number;
  levelTitle: string;
  prsBeaten: PRBeaten[];
  newAchievements: NewAchievement[];
}

export default function WorkoutVictoryModal({
  isOpen,
  onClose,
  volumeKg,
  tonnageComparison,
  photoUrl,
  xpEarned,
  level,
  levelTitle,
  prsBeaten,
  newAchievements,
}: WorkoutVictoryModalProps) {
  const [animatedXp, setAnimatedXp] = useState(0);
  const [curiosityIndex, setCuriosityIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Lista de curiosidades disponível para alternância
  const curiositiesList: TonnageCuriosity[] =
    tonnageComparison?.curiosities && tonnageComparison.curiosities.length > 0
      ? tonnageComparison.curiosities
      : [
          {
            label: tonnageComparison?.label || "Volume de Força",
            icon: tonnageComparison?.icon || "🏋️",
            comparisonText:
              tonnageComparison?.comparisonText ||
              "Excelente volume total de trabalho muscular hoje!",
            category: (tonnageComparison?.category as TonnageCuriosityCategory) || "veiculo",
            funFact:
              tonnageComparison?.funFact ||
              "O trabalho mecânico realizado estimula adaptação óssea, articular e hipertrofia.",
          },
        ];

  const currentCuriosity = curiositiesList[curiosityIndex % curiositiesList.length];

  // Alternar para a próxima curiosidade do pool
  const handleNextCuriosity = () => {
    setIsRotating(true);
    setCuriosityIndex((prev) => (prev + 1) % curiositiesList.length);
    setTimeout(() => setIsRotating(false), 300);
  };

  useEffect(() => {
    if (!isOpen) return;

    // Reiniciar estados ao abrir
    setCuriosityIndex(0);
    setCopiedFeedback(false);

    // Animação suave do XP ganho
    let start = 0;
    const duration = 1000;
    const stepTime = 25;
    const totalSteps = duration / stepTime;
    const increment = Math.ceil(xpEarned / totalSteps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= xpEarned) {
        setAnimatedXp(xpEarned);
        clearInterval(timer);
      } else {
        setAnimatedXp(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isOpen, xpEarned]);

  // Função para compartilhar a conquista nas redes sociais ou WhatsApp
  const handleShareWorkout = async () => {
    const formattedVolume = volumeKg.toLocaleString("pt-BR");
    const shareText = `🏋️ Treino concluído no TechFitness!\nHoje ergui um total de ${formattedVolume} kg (${currentCuriosity.comparisonText}).\n+${xpEarned} XP garantidos rumo ao próximo nível! 🔥`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "TechFitness • Treino Concluído com Sucesso",
          text: shareText,
          url: window.location.origin,
        });
        return;
      } catch {
        // Fallback para clipboard se o usuário cancelar ou falhar
      }
    }

    // Fallback: Copiar para área de transferência
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedFeedback(true);
        setTimeout(() => setCopiedFeedback(false), 3500);
      } catch {
        // Fallback silencioso
      }
    }
  };

  // Helper para renderizar a tag de categoria
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "animal":
        return {
          title: "Reino Animal",
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
        };
      case "veiculo":
        return {
          title: "Engenharia e Veículos",
          bg: "bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#38BDF8] border-blue-200 dark:border-blue-800/40",
        };
      case "construcao":
        return {
          title: "Monumentos e Construções",
          bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
        };
      case "epico":
        return {
          title: "Força Épica e Mitologia",
          bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/40",
        };
      case "espaco":
        return {
          title: "Exploração Espacial",
          bg: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/40",
        };
      default:
        return {
          title: "Curiosidade de Força",
          bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        };
    }
  };

  if (!isOpen) return null;

  const currentBadge = getCategoryBadge(currentCuriosity.category);
  const workJoulesKj = tonnageComparison?.workJoules
    ? (tonnageComparison.workJoules / 1000).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : null;
  const workKcal = tonnageComparison?.workKcal || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Container Principal no padrão TechFitness */}
      <div className="w-full max-w-lg bg-white dark:bg-[#151D2F] rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-slate-100 relative my-auto max-h-[92vh] overflow-y-auto transition-colors">
        
        {/* Cabeçalho Limpo */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[#2563EB] dark:text-[#38BDF8] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3px]" /> Treino Concluído com Sucesso
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#0F172A] dark:text-white">
            Resumo do Treino
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Seus dados e comprovante foram salvos e computados no seu perfil.
          </p>
        </div>

        <div className="space-y-3.5 sm:space-y-4">
          {/* Card da Foto de Comprovação — Formato Vertical com Sticker de Vitória */}
          {photoUrl && (
            <div className="relative w-full max-w-[240px] sm:max-w-[270px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-slate-800 bg-slate-950 shadow-md group">
              <img
                src={photoUrl}
                alt="Comprovação do Treino"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Badge de topo */}
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                <Check className="w-3 h-3 stroke-[3]" /> Check-in Feito
              </div>
              <div className="absolute top-2.5 left-2.5 text-[10px] font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                TechFitness
              </div>
              {/* Sticker Inferior no estilo Stories */}
              <div className="absolute bottom-2.5 inset-x-2.5 bg-black/65 backdrop-blur-md rounded-xl p-2 border border-white/10 flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{currentCuriosity.icon}</span>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-300 leading-tight">Carga Erguida</p>
                    <p className="text-xs font-black leading-tight text-white">
                      {volumeKg.toLocaleString("pt-BR")} kg
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black text-amber-400">+{xpEarned} XP</span>
                </div>
              </div>
            </div>
          )}

          {/* Grid de Métricas Principais: Tonelagem e XP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Card de Volume / Tonelagem */}
            <div className="rounded-2xl p-4 bg-slate-50 dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-bold uppercase tracking-wider block">
                  Volume Total Erguido
                </span>
                <p className="font-display font-extrabold text-2xl text-[#0F172A] dark:text-white mt-0.5">
                  {volumeKg.toLocaleString("pt-BR")}{" "}
                  <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">kg</span>
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] dark:border-slate-700/60 flex items-center gap-2 text-xs text-[#475569] dark:text-slate-300">
                <span className="text-xl shrink-0">{currentCuriosity.icon}</span>
                <span className="leading-snug text-[11px] font-medium">
                  {currentCuriosity.label}
                </span>
              </div>
            </div>

            {/* Card de XP e Nível */}
            <div className="rounded-2xl p-4 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#2563EB] dark:text-[#38BDF8] font-bold uppercase tracking-wider block">
                  XP da Sessão
                </span>
                <p className="font-display font-extrabold text-2xl text-[#2563EB] dark:text-[#38BDF8] mt-0.5">
                  +{animatedXp}{" "}
                  <span className="text-xs font-bold text-[#64748B] dark:text-slate-400">XP</span>
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
                <span className="text-[#64748B] dark:text-slate-400 font-medium">Nível {level}</span>
                <span className="font-bold text-[#2563EB] dark:text-[#38BDF8]">{levelTitle}</span>
              </div>
            </div>

          </div>

          {/* Card Interativo de Curiosidades Comparativas com Alternador */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-[#1E293B]/90 dark:via-[#1E293B]/70 dark:to-indigo-950/20 border border-blue-100/80 dark:border-blue-900/40 relative overflow-hidden transition-all">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${currentBadge.bg}`}
              >
                {currentBadge.title}
              </span>

              {curiositiesList.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextCuriosity}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-[#2563EB] dark:text-[#38BDF8] border border-blue-200/70 dark:border-blue-800/40 shadow-2xs transition-all cursor-pointer active:scale-95 min-h-[32px]"
                  title="Ver outra comparação curiosa"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${
                      isRotating ? "rotate-180" : ""
                    }`}
                  />
                  <span>Outra Comparação</span>
                  <span className="text-[10px] opacity-60">
                    ({(curiosityIndex % curiositiesList.length) + 1}/{curiositiesList.length})
                  </span>
                </button>
              )}
            </div>

            <div className="flex items-start gap-3 mt-1">
              <div className="text-3xl shrink-0 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs flex items-center justify-center">
                {currentCuriosity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm sm:text-base text-[#0F172A] dark:text-white leading-tight">
                  {currentCuriosity.label}
                </h4>
                <p className="text-xs text-[#475569] dark:text-slate-300 mt-1 leading-relaxed">
                  {currentCuriosity.comparisonText}
                </p>
              </div>
            </div>

            {/* Fato Fisiológico e Científico */}
            {currentCuriosity.funFact && (
              <div className="mt-3 pt-2.5 border-t border-blue-100 dark:border-slate-700/60 flex items-start gap-2 bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl">
                <Info className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#334155] dark:text-slate-300 leading-snug">
                  <strong className="text-[#0F172A] dark:text-white font-semibold">
                    Fisiologia da Força:
                  </strong>{" "}
                  {currentCuriosity.funFact}
                </p>
              </div>
            )}
          </div>

          {/* Métricas Fisiológicas e Biomecânicas (Energia Mecânica Real) */}
          {(workJoulesKj || workKcal) && (
            <div className="grid grid-cols-2 gap-2.5">
              {workJoulesKj && (
                <div className="rounded-xl p-2.5 bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/40">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block truncate">
                      Trabalho Mecânico
                    </span>
                    <p className="text-xs font-extrabold text-[#0F172A] dark:text-white truncate">
                      {workJoulesKj} kJ
                    </p>
                  </div>
                </div>
              )}

              {workKcal && (
                <div className="rounded-xl p-2.5 bg-slate-50 dark:bg-[#1E293B]/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/50 dark:border-rose-800/40">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block truncate">
                      Demanda Fibrilar
                    </span>
                    <p className="text-xs font-extrabold text-[#0F172A] dark:text-white truncate">
                      ~{workKcal} kcal
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Novos Recordes Pessoais (PRs) */}
          {prsBeaten && prsBeaten.length > 0 && (
            <div className="rounded-2xl p-4 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Novos Recordes Pessoais (PR)
              </div>
              <div className="space-y-1.5">
                {prsBeaten.map((pr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-amber-200/40 dark:border-amber-900/30 last:border-0"
                  >
                    <span className="font-semibold text-[#0F172A] dark:text-white">{pr.exerciseName}</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      {pr.weight} kg{" "}
                      <span className="text-[10px] text-amber-600 dark:text-amber-400/80 font-normal">
                        ({pr.previousWeight > 0 ? `+${pr.weight - pr.previousWeight}kg` : "1º PR"})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conquistas Desbloqueadas */}
          {newAchievements && newAchievements.length > 0 && (
            <div className="rounded-2xl p-4 bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40">
              <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 font-bold text-xs uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Conquista Desbloqueada!
              </div>
              <div className="space-y-1.5">
                {newAchievements.map((ach) => (
                  <div key={ach.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#0F172A] dark:text-white">{ach.title}</p>
                      <p className="text-[10px] text-[#64748B] dark:text-slate-400">{ach.description}</p>
                    </div>
                    <span className="font-black text-purple-700 dark:text-purple-300">+{ach.xpReward} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feedback de Cópia de Compartilhamento */}
        {copiedFeedback && (
          <div className="mt-3 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> Texto de conquista copiado! Pronto para colar no WhatsApp ou Stories.
          </div>
        )}

        {/* Botões de Ação na Base */}
        <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row gap-2.5">
          {/* Botão de Compartilhar Conquista */}
          <button
            type="button"
            onClick={handleShareWorkout}
            className="w-full sm:w-1/2 min-h-[46px] py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700 active:scale-[0.99]"
          >
            <Share2 className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
            <span>Compartilhar Treino</span>
          </button>

          {/* Botão de Conclusão / Voltar ao Painel */}
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/2 min-h-[46px] py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/15 active:scale-[0.99]"
          >
            <span>Voltar ao Painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

