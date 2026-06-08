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

function getAchievementStatusHint(achievement: Achievement, currentValues: { sessions: number, prs: number, measurements: number, streak: number }) {
  if (achievement.unlocked) return "Conquista desbloqueada! XP adicionado à sua conta.";
  
  const remaining = achievement.target - achievement.progress;
  
  switch (achievement.id) {
    case "first_step":
      return `Falta apenas ${remaining} treino para iniciar sua jornada!`;
    case "pr_pioneer":
      return `Falta registrar seu primeiro recorde pessoal de carga (PR) em qualquer exercício!`;
    case "body_awareness":
      return `Registre seu peso corporal 1 vez na aba "Meu Peso" para desbloquear.`;
    case "iron_consistency":
      return `Falta(m) ${remaining} treino(s) completo(s) para alcançar o hábito de aço.`;
    case "streak_fire":
      return `Complete todas as fichas por mais ${remaining} semana(s) consecutivas para desbloquear Frequência Semanal.`;
    case "eagle_eye":
      return `Registre seu peso corporal mais ${remaining} vez(es) na aba "Meu Peso".`;
    case "warrior_path":
      return `Falta(m) ${remaining} treino(s) completo(s) para trilhar o Caminho do Guerreiro.`;
    case "titan_strength":
      return `Bata recordes de carga em mais ${remaining} exercício(s) diferente(s).`;
    case "inferno_streak":
      return `Mantenha o ritmo! Complete todas as fichas por mais ${remaining} semana(s) consecutivas para desbloquear Constância de Titã.`;
    case "centurion":
      return `Falta(m) ${remaining} treino(s) completo(s) para se tornar um Centurião.`;
    case "pr_machine":
      return `Bata recordes de carga em mais ${remaining} exercício(s) para se tornar uma Máquina de PRs.`;
    case "olympus_legend":
      return `Falta(m) ${remaining} treino(s) para subir ao topo e se tornar uma Lenda do Olimpo!`;
    default:
      return `Falta(m) ${remaining} para atingir a meta de ${achievement.target}.`;
  }
}

export default function AchievementsPage() {
  const { data: session } = useSession();
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [achievementFilter, setAchievementFilter] = useState<"all" | "unlocked" | "locked">("all");

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const response = await fetch("/api/student/gamification");
        if (response.ok) {
          const data = await response.json();
          setGamification(data);
          
          // Auto-select the first tier that has locked achievements
          const firstLockedTier = data.achievements.find((a: Achievement) => !a.unlocked)?.tier || 4;
          setSelectedTier(firstLockedTier);
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

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Hero Banner — RPG Journey Header */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-white shadow-2xl relative overflow-hidden border border-white/5 animate-fade-in">
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

        {/* Horizontal Timeline Roadmap */}
        <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Mapa do Seu Progresso
              </h3>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Clique nos checkpoints para ver as conquistas de cada Tier</p>
            </div>
          </div>
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2">
            {/* Connecting Line behind nodes (Desktop only) */}
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-[#E2E8F0] hidden sm:block z-0">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 transition-all duration-700"
                style={{ width: `${((selectedTier - 1) / 3) * 100}%` }}
              />
            </div>

            {/* Nodes */}
            {[1, 2, 3, 4].map((tierNum) => {
              const config = TIER_CONFIG[tierNum] || TIER_CONFIG[1];
              const tierAchievements = gamification.achievements.filter(a => a.tier === tierNum);
              const tierUnlocked = tierAchievements.filter(a => a.unlocked).length;
              const tierTotal = tierAchievements.length;
              const isCompleted = tierUnlocked === tierTotal;
              const isSelected = selectedTier === tierNum;

              return (
                <button
                  key={tierNum}
                  type="button"
                  onClick={() => setSelectedTier(tierNum)}
                  className={`relative z-10 flex flex-row sm:flex-col items-center gap-3 sm:gap-2.5 p-3.5 sm:p-2.5 rounded-2xl w-full sm:w-auto transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? "bg-blue-50/50 sm:bg-transparent border border-blue-100 sm:border-none shadow-sm sm:shadow-none" 
                      : "hover:bg-zinc-50/50 sm:hover:bg-transparent border border-transparent"
                  }`}
                >
                  {/* Node circle */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                    isCompleted
                      ? `bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20`
                      : isSelected
                      ? `bg-[#2563EB] border-[#2563EB] text-white shadow-lg shadow-blue-500/20`
                      : `bg-white border-zinc-200 text-zinc-400`
                  } ${isSelected ? "scale-110 rotate-3" : "scale-100 hover:scale-105"}`}>
                    {isCompleted ? "✓" : tierNum}
                  </div>

                  {/* Labels */}
                  <div className="text-left sm:text-center">
                    <p className={`text-xs font-bold transition-colors ${isSelected ? "text-[#2563EB]" : "text-[#0F172A]"}`}>
                      {config.label}
                    </p>
                    <p className="text-[9px] text-[#94A3B8] font-bold font-mono">
                      {tierUnlocked}/{tierTotal} Concluído
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filter and Achievements List */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1">
                Conquistas de {TIER_CONFIG[selectedTier]?.label}
              </h4>
              <p className="text-[10px] text-[#94A3B8]">{TIER_CONFIG[selectedTier]?.sublabel}</p>
            </div>
            
            <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-[#E2E8F0] shadow-xs">
              {[
                { id: "all", label: "Todas" },
                { id: "unlocked", label: "Desbloqueadas" },
                { id: "locked", label: "Em Progresso" }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setAchievementFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    achievementFilter === f.id
                      ? "bg-white text-[#2563EB] shadow-xs"
                      : "text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {gamification.achievements
            .filter(a => a.tier === selectedTier)
            .filter(a => {
              if (achievementFilter === "unlocked") return a.unlocked;
              if (achievementFilter === "locked") return !a.unlocked;
              return true;
            }).length === 0 ? (
              <div className="p-10 text-center border border-dashed border-[#E2E8F0] bg-white rounded-2xl shadow-xs">
                <Trophy className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
                <p className="text-xs text-[#94A3B8] font-medium">Nenhuma conquista nesta categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gamification.achievements
                  .filter(a => a.tier === selectedTier)
                  .filter(a => {
                    if (achievementFilter === "unlocked") return a.unlocked;
                    if (achievementFilter === "locked") return !a.unlocked;
                    return true;
                  })
                  .map((achievement) => {
                    const percent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
                    const hintText = getAchievementStatusHint(achievement, {
                      sessions: gamification.totalSessions,
                      prs: gamification.prsCount,
                      measurements: gamification.measurementsCount,
                      streak: gamification.streak
                    });

                    return (
                      <div 
                        key={achievement.id}
                        className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                          achievement.unlocked
                            ? "bg-white border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-amber-200/70"
                            : "bg-zinc-50/70 border-zinc-200/60 opacity-90"
                        }`}
                      >
                        {/* Glow effect for unlocked */}
                        {achievement.unlocked && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/35 to-transparent rounded-bl-full pointer-events-none" />
                        )}

                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl flex-shrink-0 transition-transform ${
                            achievement.unlocked
                              ? "bg-amber-100/40 text-amber-500 border border-amber-200/50"
                              : "bg-zinc-200/40 text-zinc-400 border border-zinc-200"
                          }`}>
                            {getAchievementIcon(achievement.icon, achievement.unlocked, "w-6 h-6")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`text-xs font-bold truncate ${achievement.unlocked ? "text-[#0F172A]" : "text-zinc-500"}`}>
                                {achievement.title}
                              </h4>
                              {achievement.unlocked && (
                                <span className="text-[8px] bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider scale-95 origin-left">
                                  Desbloqueada
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#94A3B8] leading-normal mt-1">
                              {achievement.description}
                            </p>
                          </div>
                          <div className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                            achievement.unlocked
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-zinc-200 text-zinc-400"
                          }`}>
                            +{achievement.xpReward} XP
                          </div>
                        </div>

                        {/* Progress Bar & Hint */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-900/5 space-y-2">
                          <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-bold">
                            <span>PROGRESSO</span>
                            <span className="font-mono">{achievement.progress} / {achievement.target}</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-200/70 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                achievement.unlocked
                                  ? "bg-emerald-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className={`text-[10px] ${achievement.unlocked ? "text-emerald-600 font-medium" : "text-zinc-400 font-normal italic"} mt-1.5`}>
                            {hintText}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
        </section>

        {/* Summary Footer */}
        <section className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm text-center animate-fade-in">
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {totalUnlocked === totalAchievements ? (
              <>
                <span className="text-lg">🏆</span> Parabéns, <span className="font-bold text-[#0F172A]">{session?.user?.name?.split(" ")[0]}</span>! Você completou todas as conquistas. Você é uma <span className="font-bold text-amber-600">Lenda do Olimpo</span>.
              </>
            ) : (
              <>
                Continue treinando, <span className="font-bold text-[#0F172A]">{session?.user?.name?.split(" ")[0]}</span>! Faltam{" "}
                <span className="font-bold text-[#2563EB]">{totalAchievements - totalUnlocked}</span>{" "}
                conquistas para completar sua jornada. Cada treino te aproxima do Olimpo. 💪
              </>
            )}
          </p>
        </section>
      </main>
    </div>
  );
}
