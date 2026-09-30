"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Check,
  ArrowRight,
  Award,
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

  useEffect(() => {
    if (!isOpen) return;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Container Principal no padrão TechFitness */}
      <div className="w-full max-w-lg bg-white dark:bg-[#151D2F] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-slate-100 relative my-auto max-h-[92vh] overflow-y-auto transition-colors">
        
        {/* Cabeçalho Limpo */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[#2563EB] dark:text-[#38BDF8] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Treino Concluído com Sucesso
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#0F172A] dark:text-white">
            Resumo do Treino
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Seus dados e comprovante foram salvos e computados no seu perfil.
          </p>
        </div>

        <div className="space-y-4">
          {/* Card da Foto de Comprovação — Formato Vertical Adaptativo */}
          {photoUrl && (
            <div className="relative w-full max-w-[240px] sm:max-w-[280px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-slate-800 bg-slate-950 shadow-md group">
              <img
                src={photoUrl}
                alt="Comprovação do Treino"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                <Check className="w-3 h-3" /> Check-in Registrado
              </div>
              <div className="absolute bottom-2.5 left-2.5 text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                Comprovante do Dia
              </div>
            </div>
          )}

          {/* Grid de Métricas: Tonelagem & XP */}
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
              <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] dark:border-slate-700/60 flex items-center gap-2 text-xs text-[#475569] dark:text-slate-300">
                <span className="text-xl shrink-0">{tonnageComparison?.icon || "🏋️"}</span>
                <span className="leading-snug text-[11px]">
                  {tonnageComparison?.comparisonText || "Excelente volume de trabalho hoje!"}
                </span>
              </div>
            </div>

            {/* Card de XP & Nível */}
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
              <div className="mt-3 pt-2.5 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
                <span className="text-[#64748B] dark:text-slate-400 font-medium">Nível {level}</span>
                <span className="font-bold text-[#2563EB] dark:text-[#38BDF8]">{levelTitle}</span>
              </div>
            </div>

          </div>

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

        {/* Botão de Conclusão */}
        <div className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/15 active:scale-[0.99]"
          >
            Voltar ao Painel <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
