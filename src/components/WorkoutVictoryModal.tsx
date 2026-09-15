"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Flame,
  Zap,
  Check,
  ArrowRight,
  Sparkles,
  Camera,
  Share2,
} from "lucide-react";

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
  tonnageComparison: {
    tonnageKg: number;
    label: string;
    icon: string;
    comparisonText: string;
  };
  photoUrl?: string | null;
  xpEarned: number;
  totalXp: number;
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
  totalXp,
  level,
  levelTitle,
  prsBeaten,
  newAchievements,
}: WorkoutVictoryModalProps) {
  const [animatedXp, setAnimatedXp] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    // Animação de subida suave do XP ganho
    let start = 0;
    const duration = 1200;
    const stepTime = 30;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* Container Principal */}
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-500/30 text-white relative my-auto">
        
        {/* Glow Superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-blue-500/20 blur-2xl pointer-events-none rounded-full" />

        {/* Cabeçalho da Conquista */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Treino Concluído com Sucesso
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
            Missão Cumprida! 💥
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Seu esforço de hoje foi registrado e contabilizado na plataforma.
          </p>
        </div>

        <div className="space-y-4">
          {/* Card da Foto de Comprovação */}
          {photoUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-inner group">
              <div className="h-44 sm:h-52 w-full overflow-hidden flex items-center justify-center bg-black/40">
                <img
                  src={photoUrl}
                  alt="Comprovação do Treino"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-extrabold flex items-center gap-1 shadow-lg">
                <Check className="w-3 h-3" /> Check-in Comprovado
              </div>
              <div className="absolute bottom-2 left-3 text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                Registro Fotográfico Oficial
              </div>
            </div>
          )}

          {/* Grid de Métricas: Tonelagem & XP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Card de Tonelagem */}
            <div className="rounded-2xl p-4 bg-slate-850/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Tonelagem Total
                </span>
                <p className="font-display font-black text-2xl sm:text-3xl text-cyan-400 mt-0.5">
                  {volumeKg.toLocaleString("pt-BR")}{" "}
                  <span className="text-xs font-semibold text-slate-400">kg</span>
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-300">
                <span className="text-xl shrink-0">{tonnageComparison?.icon || "🏋️"}</span>
                <span className="leading-snug text-[11px]">
                  {tonnageComparison?.comparisonText || "Excelente volume de trabalho hoje!"}
                </span>
              </div>
            </div>

            {/* Card de XP & Nível */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                  XP Conquistado
                </span>
                <p className="font-display font-black text-2xl sm:text-3xl text-emerald-400 mt-0.5 flex items-center gap-1">
                  +{animatedXp}{" "}
                  <span className="text-xs font-bold text-slate-400">XP</span>
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Nível {level}</span>
                <span className="font-bold text-cyan-300">{levelTitle}</span>
              </div>
            </div>

          </div>

          {/* Recordes Pessoais (PRs) Batidos */}
          {prsBeaten && prsBeaten.length > 0 && (
            <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Trophy className="w-4 h-4" /> Novos Recordes Pessoais (PR)!
              </div>
              <div className="space-y-1.5">
                {prsBeaten.map((pr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-amber-500/15 last:border-0"
                  >
                    <span className="font-semibold text-slate-200">{pr.exerciseName}</span>
                    <span className="font-bold text-amber-300">
                      {pr.weight} kg{" "}
                      <span className="text-[10px] text-amber-500/80 font-normal">
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
            <div className="rounded-2xl p-4 bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Zap className="w-4 h-4" /> Conquista Desbloqueada!
              </div>
              <div className="space-y-1.5">
                {newAchievements.map((ach) => (
                  <div key={ach.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-100">{ach.title}</p>
                      <p className="text-[10px] text-slate-400">{ach.description}</p>
                    </div>
                    <span className="font-black text-purple-300">+{ach.xpReward} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão de Finalização */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            Continuar para o Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
