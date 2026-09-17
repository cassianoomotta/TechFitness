import React from 'react';
import { Award, Loader2, Sparkles, Trophy } from 'lucide-react';
import { TIER_CONFIG, getAchievementIcon } from '@/lib/gamification-ui';
import { getAchievementStatusHint, GamificationData, GamificationAchievement, PersonalRecord } from '@/lib/gamification';

interface AchievementsTabProps {
  gamificationLoading: boolean;
  gamification: GamificationData | null;
  prsLoading: boolean;
  prs: PersonalRecord[];
  selectedTier: number;
  setSelectedTier: (tier: number) => void;
  achievementFilter: "all" | "unlocked" | "locked";
  setAchievementFilter: (filter: "all" | "unlocked" | "locked") => void;
}

export default function AchievementsTab(props: AchievementsTabProps) {
  const {
    gamificationLoading,
    gamification,
    prsLoading,
    prs,
    selectedTier,
    setSelectedTier,
    achievementFilter,
    setAchievementFilter,
  } = props;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Gamification Summary Card */}
      {!gamificationLoading && gamification && (
        <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-extrabold text-2xl">
                🏆
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0F172A]">Sua Jornada de Conquistas</h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Nível {gamification.level} • {gamification.levelTitle}
                </p>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
              <div className="text-center bg-zinc-50 border border-[#E2E8F0]/80 rounded-xl px-4 py-3 min-w-[90px]">
                <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Treinos</span>
                <span className="text-lg font-extrabold text-[#0F172A] font-mono">{gamification.totalSessions}</span>
              </div>
              <div className="text-center bg-zinc-50 border border-[#E2E8F0]/80 rounded-xl px-4 py-3 min-w-[90px]">
                <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Recordes (PR)</span>
                <span className="text-lg font-extrabold text-[#0F172A] font-mono">{gamification.prsCount}</span>
              </div>
              <div className="text-center bg-zinc-50 border border-[#E2E8F0]/80 rounded-xl px-4 py-3 min-w-[90px]">
                <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Peso Reg.</span>
                <span className="text-lg font-extrabold text-[#0F172A] font-mono">{gamification.measurementsCount}</span>
              </div>
              <div className="text-center bg-zinc-50 border border-[#E2E8F0]/80 rounded-xl px-4 py-3 min-w-[90px]">
                <span className="block text-xs font-bold text-emerald-600 uppercase tracking-wider">Semanas Seguidas 🔥</span>
                <span className="text-lg font-extrabold text-emerald-600 font-mono">
                  {gamification.streak} {gamification.streak === 1 ? "semana" : "semanas"}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar to next level */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0]/80 space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#475569]">
              <span>Progresso para o Nível {gamification.level + 1}</span>
              <span className="font-mono text-[#2563EB]">{gamification.currentLevelXp} / {gamification.nextLevelXpNeeded} XP</span>
            </div>
            <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-200/50">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#00C2FF] transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.2)]"
                style={{ width: `${Math.min(100, (gamification.currentLevelXp / gamification.nextLevelXpNeeded) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recordes Pessoais (PRs) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Recordes de Carga (PRs)
          </h3>
          <span className="text-[10px] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-amber-700">
            {prs ? prs.length : 0} Exercícios com Recorde
          </span>
        </div>

        {prsLoading ? (
          <div className="flex items-center justify-center py-8 text-[#94A3B8]">
            <Loader2 className="w-5 h-5 animate-spin text-[#2563EB] mr-2" />
            <span className="text-xs">Carregando seus recordes...</span>
          </div>
        ) : !prs || prs.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
            <p className="text-xs text-[#64748B] font-semibold">
              Você ainda não possui recordes de carga registrados.
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-1">
              Complete seus treinos e marque as cargas levantadas para ver seus recordes aqui! 🏋️
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {prs.map((pr: PersonalRecord) => (
              <div key={pr.exerciseId} className="p-3.5 bg-zinc-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3 hover:border-amber-200 hover:bg-amber-50/15 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0F172A] truncate">{pr.name}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">{pr.muscleGroup} • {pr.equipment}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-extrabold text-amber-600 font-mono">{pr.maxWeight} kg</p>
                  <p className="text-[10px] text-[#94A3B8] font-medium mt-0.5">{pr.reps} reps</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton da Gamificação */}
      {gamificationLoading && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 skeleton-shimmer rounded-xl"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 skeleton-shimmer"></div>
                <div className="h-3 w-32 skeleton-shimmer"></div>
              </div>
            </div>
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i: number) => (
                <div key={i} className="flex-1 h-16 skeleton-shimmer rounded-xl"></div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="h-4 w-40 skeleton-shimmer mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i: number) => (
                <div key={i} className="h-28 skeleton-shimmer rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Timeline Roadmap */}
      {!gamificationLoading && gamification && (
        <>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
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
                const tierAchievements = gamification.achievements.filter((a: GamificationAchievement) => a.tier === tierNum);
                const tierUnlocked = tierAchievements.filter((a: GamificationAchievement) => a.unlocked).length;
                const tierTotal = tierAchievements.length;
                const isCompleted = tierUnlocked === tierTotal;
                const isSelected = selectedTier === tierNum;

                return (
                  <button
                    key={tierNum}
                    onClick={() => setSelectedTier(tierNum)}
                    className={`relative z-10 flex sm:flex-col items-center gap-3 p-3 sm:p-2 rounded-2xl transition-all duration-300 w-full sm:w-auto text-left sm:text-center cursor-pointer ${
                      isSelected 
                        ? "bg-white shadow-lg shadow-blue-500/10 border-2 border-[#2563EB] sm:scale-110" 
                        : "bg-zinc-50 sm:bg-white border border-[#E2E8F0] hover:border-slate-300"
                    }`}
                  >
                    {/* Badge/Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base transition-transform ${
                      isCompleted 
                        ? "bg-gradient-to-tr from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/30" 
                        : isSelected
                          ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/30"
                          : "bg-zinc-100 text-[#94A3B8]"
                    }`}>
                      {tierNum === 4 ? "👑" : tierNum === 3 ? "💎" : tierNum === 2 ? "⚡" : "🌱"}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 sm:justify-center">
                        <span className={`text-xs font-black ${isSelected ? "text-[#2563EB]" : "text-[#0F172A]"}`}>
                          Tier {tierNum}
                        </span>
                        {isCompleted && (
                          <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded font-bold">100%</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#94A3B8] font-medium">{config.label}</p>
                      <p className="text-[9px] text-[#64748B] font-mono mt-0.5">
                        {tierUnlocked}/{tierTotal} conquistas
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier Achievements Detail */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Conquistas do Tier {selectedTier}: {TIER_CONFIG[selectedTier]?.label}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {TIER_CONFIG[selectedTier]?.sublabel}
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setAchievementFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    achievementFilter === "all" ? "bg-white text-[#0F172A] shadow-xs" : "text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setAchievementFilter("unlocked")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    achievementFilter === "unlocked" ? "bg-white text-emerald-600 shadow-xs" : "text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  Desbloqueadas
                </button>
                <button
                  onClick={() => setAchievementFilter("locked")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    achievementFilter === "locked" ? "bg-white text-[#2563EB] shadow-xs" : "text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  Bloqueadas
                </button>
              </div>
            </div>

            {/* Achievements Grid */}
            {gamification.achievements.filter((a: GamificationAchievement) => a.tier === selectedTier).length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-10 italic">
                Nenhuma conquista configurada para este Tier ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gamification.achievements
                  .filter((a: GamificationAchievement) => a.tier === selectedTier)
                  .filter((a: GamificationAchievement) => {
                    if (achievementFilter === "unlocked") return a.unlocked;
                    if (achievementFilter === "locked") return !a.unlocked;
                    return true;
                  })
                  .map((achievement: GamificationAchievement) => {
                    const percent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
                    const hintText = getAchievementStatusHint(achievement);

                    return (
                      <div 
                        key={achievement.id} 
                        className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                          achievement.unlocked
                            ? "bg-white border-[#E2E8F0] shadow-sm hover:shadow-lg hover:border-amber-200/70 hover:scale-[1.02] hover:-translate-y-0.5"
                            : "bg-zinc-50/70 border-zinc-200/60 opacity-90 hover:opacity-100 hover:border-zinc-300"
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
                          <div className="w-full h-2 bg-zinc-200/70 rounded-full overflow-hidden">
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
          </div>
        </>
      )}
    </div>
  );
}