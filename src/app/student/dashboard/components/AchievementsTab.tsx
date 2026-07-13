import React from 'react';
import { Dumbbell, Loader2, Award, Trophy, Users, Edit, Eye, Play, Zap, Scale, Flame, Shield, ArrowRight, TrendingUp, RefreshCw, X, ChevronRight, Crown, Swords } from 'lucide-react';
import Link from 'next/link';
import { TIER_CONFIG, getAchievementIcon } from '@/lib/gamification-ui';
import { getAchievementStatusHint } from '@/lib/gamification';
import { Sparkles } from 'lucide-react';

export default function AchievementsTab(props: any) {
  const {
    loading, plans, prsLoading, prs, gamificationLoading, gamification, rankingLoading, ranking, handleOpenEdit, setSelectedPlanForPreview, handleTabChange,
    partnerSearchQuery, setPartnerSearchQuery, partners, filteredPartners, selectedPartnerId, handleSelectPartner, comparisonLoading, comparison,
    measurements, measurementsLoading, newWeight, setNewWeight, newWeightDate, setNewWeightDate, savingWeight, handleSaveWeight, selectedPhotoForZoom, setSelectedPhotoForZoom,
    selectedTier, setSelectedTier, achievementFilter, setAchievementFilter
  } = props;

  return (
    <>
      
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

            {/* Loading Indicator */}
            {gamificationLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
                <p className="text-xs">Buscando sua jornada de conquistas...</p>
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
                      const tierAchievements = gamification.achievements.filter((a: any) => a.tier === tierNum);
                      const tierUnlocked = tierAchievements.filter((a: any) => a.unlocked).length;
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
                </div>

                {/* Filter and Achievements List */}
                <div>
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
                    .filter((a: any) => a.tier === selectedTier)
                    .filter((a: any) => {
                      if (achievementFilter === "unlocked") return a.unlocked;
                      if (achievementFilter === "locked") return !a.unlocked;
                      return true;
                    }).length === 0 ? (
                      <div className="p-10 text-center border border-dashed border-[#E2E8F0] bg-white rounded-2xl">
                        <Trophy className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
                        <p className="text-xs text-[#94A3B8] font-medium">Nenhuma conquista nesta categoria.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gamification.achievements
                          .filter((a: any) => a.tier === selectedTier)
                          .filter((a: any) => {
                            if (achievementFilter === "unlocked") return a.unlocked;
                            if (achievementFilter === "locked") return !a.unlocked;
                            return true;
                          })
                          .map((achievement: any) => {
                            const percent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
                            const hintText = getAchievementStatusHint(achievement);

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
                </div>
              </>
            )}
          </div>
        
    </>
  );
}