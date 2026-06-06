"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  ArrowLeft,
  Loader2,
  Play,
  Award,
  Zap,
  Flame,
  Trophy,
  Shield,
  Scale,
  Lock,
  Crown,
  Swords,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  progress: number;
  target: number;
  tier: number;
}

interface GamificationData {
  level: number;
  levelTitle: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXpNeeded: number;
  streak: number;
  totalSessions: number;
  prsCount: number;
  measurementsCount: number;
  achievements: Achievement[];
}

const TIER_CONFIG: Record<number, { label: string; sublabel: string; gradient: string; borderColor: string; bgColor: string; textColor: string; iconBg: string }> = {
  1: {
    label: "Primeiros Passos",
    sublabel: "O início de toda grande jornada",
    gradient: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-300/40",
    bgColor: "bg-emerald-50/30",
    textColor: "text-emerald-700",
    iconBg: "bg-emerald-500",
  },
  2: {
    label: "Criando o Hábito",
    sublabel: "Disciplina transforma corpo e mente",
    gradient: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-300/40",
    bgColor: "bg-blue-50/30",
    textColor: "text-blue-700",
    iconBg: "bg-blue-500",
  },
  3: {
    label: "Evolução Real",
    sublabel: "Os resultados começam a aparecer",
    gradient: "from-violet-500 to-purple-600",
    borderColor: "border-violet-300/40",
    bgColor: "bg-violet-50/30",
    textColor: "text-violet-700",
    iconBg: "bg-violet-500",
  },
  4: {
    label: "Elite & Lenda",
    sublabel: "Poucos chegam. Você está entre os melhores",
    gradient: "from-amber-500 to-orange-600",
    borderColor: "border-amber-300/40",
    bgColor: "bg-amber-50/30",
    textColor: "text-amber-700",
    iconBg: "bg-amber-500",
  },
};

function getAchievementIcon(iconName: string, unlocked: boolean, size: string = "w-7 h-7") {
  const colorClass = unlocked ? "text-white" : "text-zinc-400";
  const props = { className: `${size} ${colorClass}` };
  switch (iconName) {
    case "Play":
      return <Play {...props} className={props.className + " fill-current"} />;
    case "Award":
      return <Award {...props} />;
    case "Zap":
      return <Zap {...props} className={props.className + " fill-current"} />;
    case "Scale":
      return <Scale {...props} />;
    case "Flame":
      return <Flame {...props} className={props.className + " fill-current"} />;
    case "ShieldAlert":
      return <Shield {...props} />;
    case "Sword":
      return <Swords {...props} />;
    case "Crown":
      return <Crown {...props} />;
    case "Trophy":
      return <Trophy {...props} />;
    default:
      return <Trophy {...props} />;
  }
}

export default function AchievementsPage() {
  const { data: session } = useSession();
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTier, setExpandedTier] = useState<number | null>(null);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const response = await fetch("/api/student/gamification");
        if (response.ok) {
          const data = await response.json();
          setGamification(data);
          
          // Auto-expand the tier where the user is currently progressing
          const firstLockedTier = data.achievements.find((a: Achievement) => !a.unlocked)?.tier || 4;
          setExpandedTier(firstLockedTier);
        }
      } catch (error) {
        console.error("Erro ao buscar dados de gamificação:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGamification();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#94A3B8]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
          <p className="text-sm font-medium">Carregando sua jornada...</p>
        </div>
      </div>
    );
  }

  if (!gamification) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-sm text-[#94A3B8]">Erro ao carregar dados de gamificação.</p>
      </div>
    );
  }

  const totalUnlocked = gamification.achievements.filter((a) => a.unlocked).length;
  const totalAchievements = gamification.achievements.length;
  const overallPercent = Math.round((totalUnlocked / totalAchievements) * 100);

  // Group achievements by tier
  const tiers = gamification.achievements.reduce((acc, achievement) => {
    const tier = achievement.tier || 1;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(achievement);
    return acc;
  }, {} as Record<number, Achievement[]>);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      {/* Header */}
      <header className="border-b border-[#E2E8F0]/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2 text-[#94A3B8] hover:text-[#2563EB] transition-colors text-xs font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Dashboard
          </Link>
          <BrandLogo size={28} />
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Banner — RPG Journey Header */}
        <section className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-white shadow-2xl relative overflow-hidden border border-white/5 animate-fade-in">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
                  Jornada de Conquistas
                </h1>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Sua evolução completa — do primeiro treino ao topo do Olimpo
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex flex-col items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
                    <span className="text-[8px] uppercase font-bold text-amber-100 leading-none">Nv.</span>
                    <span className="text-lg font-black font-mono leading-none">{gamification.level}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold bg-gradient-to-r from-amber-100 to-orange-100 bg-clip-text text-transparent">
                      {gamification.levelTitle}
                    </p>
                    <p className="text-[10px] text-zinc-400">{gamification.totalXp} XP Total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black font-mono text-amber-400">{totalUnlocked}<span className="text-zinc-500 text-base">/{totalAchievements}</span></p>
                  <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Conquistas</p>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] text-zinc-500 font-bold">
                  <span>Progresso Global</span>
                  <span className="font-mono">{overallPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 transition-all duration-1000 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tier Sections — Timeline */}
        <div className="space-y-6">
          {Object.entries(tiers).sort(([a], [b]) => Number(a) - Number(b)).map(([tierNum, achievements]) => {
            const tier = Number(tierNum);
            const config = TIER_CONFIG[tier] || TIER_CONFIG[1];
            const tierUnlocked = achievements.filter((a) => a.unlocked).length;
            const tierTotal = achievements.length;
            const isTierComplete = tierUnlocked === tierTotal;
            const isExpanded = expandedTier === tier;

            return (
              <section key={tier} className="animate-fade-in">
                {/* Tier Header — Clickable to expand/collapse */}
                <button
                  onClick={() => setExpandedTier(isExpanded ? null : tier)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                    isTierComplete
                      ? `${config.bgColor} ${config.borderColor} shadow-sm`
                      : isExpanded
                      ? `bg-white border-[#E2E8F0] shadow-md`
                      : `bg-white border-[#E2E8F0]/60 hover:border-[#E2E8F0] hover:shadow-sm`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md text-white text-sm font-black`}>
                        {tier}
                      </div>
                      <div className="text-left">
                        <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                          {config.label}
                          {isTierComplete && (
                            <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border border-emerald-200">
                              Completo ✓
                            </span>
                          )}
                        </h2>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">{config.sublabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold font-mono ${config.textColor}`}>
                        {tierUnlocked}/{tierTotal}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-[#94A3B8] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Tier Mini Progress */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-700`}
                        style={{ width: `${tierTotal > 0 ? (tierUnlocked / tierTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Tier Achievements — Timeline Cards */}
                {isExpanded && (
                  <div className="mt-4 ml-5 sm:ml-7 pl-6 sm:pl-8 border-l-2 border-dashed border-zinc-200 space-y-0 relative">
                    {achievements.map((achievement, idx) => {
                      const percent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
                      const isLast = idx === achievements.length - 1;

                      return (
                        <div
                          key={achievement.id}
                          className="relative pb-6 last:pb-0"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          {/* Timeline Node */}
                          <div className={`absolute -left-[calc(1.5rem+5px)] sm:-left-[calc(2rem+5px)] top-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
                            achievement.unlocked
                              ? `bg-gradient-to-br ${config.gradient} border-white shadow-lg shadow-${config.iconBg}/20`
                              : "bg-zinc-100 border-zinc-200"
                          }`}>
                            {achievement.unlocked
                              ? getAchievementIcon(achievement.icon, true, "w-5 h-5")
                              : <Lock className="w-4 h-4 text-zinc-400" />
                            }
                          </div>

                          {/* Achievement Card */}
                          <div className={`ml-4 sm:ml-6 p-4 sm:p-5 rounded-xl border transition-all duration-300 animate-fade-in ${
                            achievement.unlocked
                              ? "bg-white border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-amber-200/60"
                              : "bg-zinc-50/80 border-zinc-100 opacity-75"
                          }`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className={`text-sm font-bold ${achievement.unlocked ? "text-[#0F172A]" : "text-zinc-500"}`}>
                                    {achievement.title}
                                  </h3>
                                  {achievement.unlocked && (
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                                  )}
                                </div>
                                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
                                  {achievement.description}
                                </p>
                              </div>
                              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono flex-shrink-0 ${
                                achievement.unlocked
                                  ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                                  : "bg-zinc-100 text-zinc-400 border border-zinc-200/50"
                              }`}>
                                +{achievement.xpReward} XP
                              </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-3 space-y-1.5">
                              <div className="flex justify-between items-center text-[9px] font-bold">
                                <span className={achievement.unlocked ? "text-emerald-600" : "text-[#94A3B8]"}>
                                  {achievement.unlocked ? "✓ CONQUISTADA" : "EM PROGRESSO"}
                                </span>
                                <span className={`font-mono ${achievement.unlocked ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                                  {achievement.progress} / {achievement.target}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    achievement.unlocked
                                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                      : "bg-gradient-to-r from-blue-400 to-blue-500"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Connector Line Highlight for completed items */}
                          {achievement.unlocked && !isLast && (
                            <div className="absolute -left-[calc(1.5rem+4px)] sm:-left-[calc(2rem+4px)] top-10 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400/50 to-transparent" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Summary Footer */}
        <section className="mt-10 mb-6 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm text-center animate-fade-in">
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {totalUnlocked === totalAchievements ? (
              <>
                <span className="text-lg">🏆</span> Parabéns, <span className="font-bold text-[#0F172A]">{session?.user?.name?.split(" ")[0]}</span>! Você completou todas as conquistas. Você é uma <span className="font-bold text-amber-600">Lenda do Olimpo</span>.
              </>
            ) : (
              <>
                Continue treinando, <span className="font-bold text-[#0F172A]">{session?.user?.name?.split(" ")[0]}</span>! Faltam{" "}
                <span className="font-bold text-[#2563EB]">{totalAchievements - totalUnlocked}</span>{" "}
                conquista{totalAchievements - totalUnlocked !== 1 ? "s" : ""} para completar sua jornada. Cada treino te aproxima do Olimpo. 💪
              </>
            )}
          </p>
        </section>
      </main>
    </div>
  );
}
