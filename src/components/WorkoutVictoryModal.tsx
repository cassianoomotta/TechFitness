"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Check,
  ArrowRight,
  Sparkles,
  Dumbbell,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Container Principal no padrão TechFitness */}
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E2E8F0] text-[#0F172A] relative my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Cabeçalho Limpo */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Treino Concluído com Sucesso
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#0F172A]">
            Resumo do Treino
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Seus dados e comprovante foram salvos e computados no seu perfil.
          </p>
        </div>

        <div className="space-y-4">
          {/* Card da Foto de Comprovação — Formato Vertical Adaptativo */}
          {photoUrl && (
            <div className="relative w-full max-w-[240px] sm:max-w-[280px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-950 shadow-md group">
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
            <div className="rounded-2xl p-4 bg-slate-50 border border-[#E2E8F0] flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">
                  Volume Total Erguido
                </span>
                <p className="font-display font-extrabold text-2xl text-[#0F172A] mt-0.5">
                  {volumeKg.toLocaleString("pt-BR")}{" "}
                  <span className="text-xs font-semibold text-[#64748B]">kg</span>
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E2E8F0] flex items-center gap-2 text-xs text-[#475569]">
                <span className="text-xl shrink-0">{tonnageComparison?.icon || "🏋️"}</span>
                <span className="leading-snug text-[11px]">
                  {tonnageComparison?.comparisonText || "Excelente volume de trabalho hoje!"}
                </span>
              </div>
            </div>

            {/* Card de XP & Nível */}
            <div className="rounded-2xl p-4 bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider block">
                  XP da Sessão
                </span>
                <p className="font-display font-extrabold text-2xl text-[#2563EB] mt-0.5">
                  +{animatedXp}{" "}
                  <span className="text-xs font-bold text-[#64748B]">XP</span>
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-blue-100 flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium">Nível {level}</span>
                <span className="font-bold text-[#2563EB]">{levelTitle}</span>
              </div>
            </div>

          </div>

          {/* Novos Recordes Pessoais (PRs) */}
          {prsBeaten && prsBeaten.length > 0 && (
            <div className="rounded-2xl p-4 bg-amber-50/80 border border-amber-200/80">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider mb-2">
                <Trophy className="w-4 h-4 text-amber-600" /> Novos Recordes Pessoais (PR)
              </div>
              <div className="space-y-1.5">
                {prsBeaten.map((pr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-amber-200/40 last:border-0"
                  >
                    <span className="font-semibold text-[#0F172A]">{pr.exerciseName}</span>
                    <span className="font-bold text-amber-700">
                      {pr.weight} kg{" "}
                      <span className="text-[10px] text-amber-600 font-normal">
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
            <div className="rounded-2xl p-4 bg-purple-50/80 border border-purple-200/80">
              <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-purple-600" /> Conquista Desbloqueada!
              </div>
              <div className="space-y-1.5">
                {newAchievements.map((ach) => (
                  <div key={ach.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#0F172A]">{ach.title}</p>
                      <p className="text-[10px] text-[#64748B]">{ach.description}</p>
                    </div>
                    <span className="font-black text-purple-700">+{ach.xpReward} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão de Conclusão */}
        <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
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
