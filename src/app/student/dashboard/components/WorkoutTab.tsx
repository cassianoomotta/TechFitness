import React from 'react';
import { Dumbbell, Loader2, Award, Trophy, Users, Edit, Eye, Play, Zap, Scale, Flame, Shield, ArrowRight, TrendingUp, RefreshCw, X, ChevronRight, Crown, Swords, Sparkles } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/components/UserAvatar';

export default function WorkoutTab(props: any) {
  const {
    loading, plans, prsLoading, prs, gamificationLoading, gamification, rankingLoading, ranking, handleOpenEdit, setSelectedPlanForPreview, handleTabChange,
    partnerSearchQuery, setPartnerSearchQuery, partners, filteredPartners, selectedPartnerId, handleSelectPartner, comparisonLoading, comparison,
    measurements, measurementsLoading, newWeight, setNewWeight, newWeightDate, setNewWeightDate, savingWeight, handleSaveWeight, selectedPhotoForZoom, setSelectedPhotoForZoom,
    selectedTier, setSelectedTier, achievementFilter, setAchievementFilter, onOpenImportModal
  } = props;

  return (
    <>
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-6 w-32 bg-slate-200/60 rounded animate-pulse"></div>
            <div className="h-6 w-16 bg-slate-200/60 rounded animate-pulse"></div>
          </div>
          {/* Skeletons de Fichas */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-3 w-full">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-slate-200/70 rounded-full animate-pulse"></div>
                    <div className="h-5 w-40 bg-slate-200/70 rounded-md animate-pulse"></div>
                  </div>
                  <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse shrink-0"></div>
              </div>
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-50">
                <div className="h-8 w-20 bg-slate-100 rounded-full animate-pulse"></div>
                <div className="h-8 w-24 bg-slate-100 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center text-[#94A3B8] border border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-base font-bold text-slate-800">Nenhum treino atribuído ainda</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Você pode aguardar o seu treinador prescrever uma ficha ou importar a sua ficha atual por foto, PDF ou mensagem de WhatsApp!
          </p>
          <button
            type="button"
            onClick={onOpenImportModal}
            className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Importar Minha Ficha com IA
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Suas Fichas de Treino</h3>
              <p className="text-[11px] text-slate-500">{plans.length} ficha{plans.length > 1 ? 's' : ''} ativa{plans.length > 1 ? 's' : ''}</p>
            </div>
            <button
              type="button"
              onClick={onOpenImportModal}
              className="px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Importar com IA
            </button>
          </div>
          {plans.map((plan: any) => (
            <div
              key={plan.id}
              className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80 flex flex-col justify-between group hover:border-[#2563EB]/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                            {plan.name}
                          </h4>
                          <button
                            onClick={() => handleOpenEdit(plan)}
                            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#2563EB]/5 transition-all cursor-pointer"
                            title="Editar divisão e dias"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {plan.createdAt && (
                          <p className="text-[10px] text-[#64748B] mt-1">
                            Criado em {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        {plan.description && (
                          <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">{plan.description}</p>
                        )}
                        {plan.weekDays && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {plan.weekDays.split(",").map((day: any) => (
                              <span
                                key={day}
                                className="text-[9px] font-bold bg-[#2563EB]/5 text-[#2563EB] px-1.5 py-0.5 rounded border border-[#2563EB]/10"
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        )}
                        {!plan.weekDays && (
                          <p className="text-[10px] text-[#94A3B8] mt-1.5 italic">Nenhum dia da semana definido</p>
                        )}
                      </div>

                      <span className="text-[10px] bg-white border border-[#E2E8F0] px-2 py-1 rounded font-bold text-[#94A3B8] w-fit sm:self-start">
                        {plan.exercises.length} Exercícios
                      </span>
                    </div>

                    {/* Exercícios Preview */}
                    <div className="space-y-2 mb-6 border-y border-[#E2E8F0]/60 py-4">
                      {plan.exercises.slice(0, 3).map((ex: any) => (
                        <div key={ex.id} className="flex justify-between items-center text-xs">
                          <span className="text-[#475569] font-medium">{ex.name}</span>
                          <span className="text-[#94A3B8]">
                            {ex.sets}x{ex.reps} • {ex.method}
                          </span>
                        </div>
                      ))}
                      {plan.exercises.length > 3 && (
                        <p className="text-[10px] text-[#94A3B8] text-center pt-1 font-semibold">
                          + {plan.exercises.length - 3} exercícios na ficha
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedPlanForPreview(plan)}
                        className="flex-1 py-3 px-4 rounded-xl border border-[#E2E8F0] hover:bg-zinc-50 text-[#0F172A] font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-[#94A3B8]" />
                        Visualizar Exercícios
                      </button>
                      <Link
                        href={`/student/workout-session/${plan.id}`}
                        className="flex-1 sm:flex-[1.5] py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 active:scale-[0.98]"
                      >
                        <Play className="w-4 h-4 fill-white stroke-[3px]" />
                        Iniciar Sessão de Treino
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Recordes Pessoais (PRs) */}
                <div className="bg-white border border-[#E2E8F0]/85 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Recordes de Carga (PRs)
                    </h3>
                    <span className="text-[10px] bg-amber-50 border border-amber-250 px-2 py-0.5 rounded font-bold text-amber-700">
                      Exercícios Concluídos
                    </span>
                  </div>

                  {prsLoading ? (
                    <div className="flex items-center justify-center py-6 text-[#94A3B8]">
                      <Loader2 className="w-5 h-5 animate-spin text-[#2563EB] mr-2" />
                      <span className="text-xs">Carregando seus recordes...</span>
                    </div>
                  ) : prs.length === 0 ? (
                    <p className="text-xs text-[#94A3B8] text-center py-6 italic">
                      Você ainda não concluiu nenhum exercício para registrar recordes. Complete seu primeiro treino!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                      {prs.map((pr: any) => (
                        <div key={pr.exerciseId} className="p-3 bg-zinc-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3 hover:border-amber-200 hover:bg-amber-50/10 transition-all">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0F172A] truncate">{pr.name}</p>
                            <p className="text-[9px] text-[#94A3B8] mt-0.5">{pr.muscleGroup} • {pr.equipment}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-extrabold text-amber-600 font-mono">{pr.maxWeight} kg</p>
                            <p className="text-[9px] text-[#94A3B8] font-medium mt-0.5">{pr.reps} reps</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                 </div>

                {/* Conquistas / Badges RPG (Preview) */}
                {!gamificationLoading && gamification && (
                  <div className="bg-white border border-[#E2E8F0]/85 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Conquistas & Condecorações
                      </h3>
                      <span className="text-[10px] bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded font-bold text-emerald-700">
                        {gamification.achievements.filter((a: any) => a.unlocked).length} / {gamification.achievements.length} Desbloqueadas
                      </span>
                    </div>

                    {/* Preview: mostra as 4 conquistas mais relevantes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(() => {
                        const unlocked = gamification.achievements.filter((a: any) => a.unlocked);
                        const locked = gamification.achievements.filter((a: any) => !a.unlocked);
                        // Show last 2 unlocked + next 2 to unlock
                        const preview = [
                          ...unlocked.slice(-2),
                          ...locked.slice(0, Math.max(0, 4 - Math.min(unlocked.length, 2))),
                        ].slice(0, 4);
                        
                        return preview.map((achievement: any) => {
                          const IconComponent = () => {
                            const props = { className: `w-6 h-6 ${achievement.unlocked ? "text-amber-500" : "text-[#94A3B8]"}` };
                            switch (achievement.icon) {
                              case "Play":
                                return <Play {...props} className={props.className + " fill-current"} />;
                              case "Zap":
                                return <Zap {...props} className={props.className + " fill-current"} />;
                              case "Scale":
                                return <Scale {...props} />;
                              case "Flame":
                                return <Flame {...props} className={props.className + " fill-current"} />;
                              case "ShieldAlert":
                                return <Shield {...props} />;
                              default:
                                return <Trophy {...props} />;
                            }
                          };

                          const percent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));

                          return (
                            <div 
                              key={achievement.id} 
                              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-300 ${
                                achievement.unlocked 
                                  ? "bg-amber-50/20 border-amber-200/60 shadow-sm shadow-amber-500/5 hover:border-amber-300" 
                                  : "bg-zinc-50 border-[#E2E8F0] opacity-80"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl flex-shrink-0 transition-transform duration-300 ${
                                  achievement.unlocked 
                                    ? "bg-amber-100/50 scale-105 border border-amber-200" 
                                    : "bg-zinc-200/50 border border-[#E2E8F0]"
                                }`}>
                                  <IconComponent />
                                </div>
                                <div className="min-w-0">
                                  <h4 className={`text-xs font-bold truncate ${achievement.unlocked ? "text-[#0F172A]" : "text-[#475569]"}`}>
                                    {achievement.title}
                                  </h4>
                                  <p className="text-[10px] text-[#94A3B8] leading-tight mt-0.5">
                                    {achievement.description}
                                  </p>
                                </div>
                              </div>

                              {/* Progresso de Desbloqueio */}
                              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-900/10">
                                <div className="flex justify-between items-center text-[8px] text-[#94A3B8] font-bold">
                                  <span className={achievement.unlocked ? "text-amber-700" : ""}>
                                    {achievement.unlocked ? "DESBLOQUEADA" : "EM PROGRESSO"}
                                  </span>
                                  <span>{achievement.progress} / {achievement.target}</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      achievement.unlocked 
                                        ? "bg-amber-500" 
                                        : "bg-blue-500"
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* CTA — Ver Jornada Completa */}
                    <button
                      onClick={() => handleTabChange("conquistas")}
                      className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-slate-900 to-zinc-950 hover:from-slate-800 hover:to-zinc-900 text-white font-bold text-xs transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 cursor-pointer active:scale-[0.98] group"
                    >
                      <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      Ver Jornada Completa de Conquistas
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Ranking de Alunos (Top 5) */}
                {!rankingLoading && ranking && (
                  <div className="bg-white border border-[#E2E8F0]/85 rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Liga dos Titãs — Ranking Geral
                      </h3>
                      <span className="text-[10px] bg-[#2563EB]/5 border border-[#2563EB]/15 px-2 py-0.5 rounded font-bold text-[#2563EB]">
                        {ranking.totalParticipants} atletas ativos
                      </span>
                    </div>

                    {/* Pódio visual (Top 3) */}
                    <div className="grid grid-cols-3 gap-3 pt-4 pb-2 border-b border-[#E2E8F0]/50 items-end">
                      {/* 2º Lugar (Esquerda) */}
                      {ranking.top5[1] && (
                        <div className="flex flex-col items-center text-center space-y-1.5 order-1">
                          <div className="relative">
                            <UserAvatar
                              name={ranking.top5[1].name}
                              image={ranking.top5[1].image}
                              size="lg"
                              className="border-2 border-slate-300 shadow-sm"
                            />
                            <span className="absolute -bottom-1.5 -right-1 bg-slate-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-extrabold border border-white shadow-sm">
                              2
                            </span>
                          </div>
                          <div className="min-w-0 w-full">
                            <p className="text-[11px] font-bold text-[#475569] truncate px-1">
                              {ranking.top5[1].name}
                            </p>
                            <p className="text-[9px] text-slate-500 font-mono font-bold">
                              {ranking.top5[1].totalXp} XP
                            </p>
                          </div>
                          <div className="w-full h-10 bg-slate-200/50 rounded-t-lg border-x border-t border-slate-200 flex items-center justify-center">
                            <span className="text-[9px] font-extrabold text-slate-500 font-mono">2º</span>
                          </div>
                        </div>
                      )}

                      {/* 1º Lugar (Centro) */}
                      {ranking.top5[0] && (
                        <div className="flex flex-col items-center text-center space-y-1.5 order-2">
                          <div className="relative">
                            <UserAvatar
                              name={ranking.top5[0].name}
                              image={ranking.top5[0].image}
                              size="xl"
                              className="border-3 border-amber-400 shadow-md ring-2 ring-amber-400/20"
                            />
                            <span className="absolute -bottom-1.5 -right-1 bg-amber-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold border-2 border-white shadow-sm">
                              👑
                            </span>
                          </div>
                          <div className="min-w-0 w-full">
                            <p className="text-xs font-black text-amber-600 truncate px-1">
                              {ranking.top5[0].name}
                            </p>
                            <p className="text-[10px] text-amber-500 font-mono font-bold">
                              {ranking.top5[0].totalXp} XP
                            </p>
                          </div>
                          <div className="w-full h-14 bg-amber-100/40 rounded-t-lg border-x border-t border-amber-200/80 flex items-center justify-center shadow-inner">
                            <span className="text-xs font-black text-amber-600 font-mono">1º</span>
                          </div>
                        </div>
                      )}

                      {/* 3º Lugar (Direita) */}
                      {ranking.top5[2] && (
                        <div className="flex flex-col items-center text-center space-y-1.5 order-3">
                          <div className="relative">
                            <UserAvatar
                              name={ranking.top5[2].name}
                              image={ranking.top5[2].image}
                              size="lg"
                              className="border-2 border-amber-600/50 shadow-sm"
                            />
                            <span className="absolute -bottom-1.5 -right-1 bg-amber-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-extrabold border border-white shadow-sm">
                              3
                            </span>
                          </div>
                          <div className="min-w-0 w-full">
                            <p className="text-[11px] font-bold text-amber-800/80 truncate px-1">
                              {ranking.top5[2].name}
                            </p>
                            <p className="text-[9px] text-amber-700/70 font-mono font-bold">
                              {ranking.top5[2].totalXp} XP
                            </p>
                          </div>
                          <div className="w-full h-7 bg-amber-100/10 rounded-t-lg border-x border-t border-amber-200/30 flex items-center justify-center">
                            <span className="text-[9px] font-extrabold text-amber-700/70 font-mono">3º</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lista dos demais (4º e 5º) */}
                    {(ranking.top5[3] || ranking.top5[4]) && (
                      <div className="space-y-2 pt-2">
                        {ranking.top5.slice(3, 5).map((user: { id: string; name: string; image?: string | null; level: number; levelTitle: string; totalXp: number; totalSessions: number }, idx: number) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-zinc-50 border border-[#E2E8F0] rounded-xl hover:bg-zinc-100/30 hover:border-[#2563EB]/15 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-[#94A3B8] w-4 text-center">
                                {idx + 4}
                              </span>
                              <UserAvatar
                                name={user.name}
                                image={user.image}
                                size="sm"
                                className="border border-[#E2E8F0]"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#0F172A] truncate">
                                  {user.name}
                                </p>
                                <p className="text-[9px] text-[#94A3B8]">
                                  Lvl {user.level} • {user.levelTitle}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-extrabold text-[#2563EB] font-mono">
                                {user.totalXp} XP
                              </p>
                              <p className="text-[8px] text-[#94A3B8] font-medium">
                                {user.totalSessions} treinos
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Posição do Usuário Logado */}
                    {ranking.userPosition > 5 && (
                      <div className="p-3 bg-[#2563EB]/5 border border-[#2563EB]/10 rounded-xl text-center">
                        <p className="text-xs text-[#1E40AF] font-bold">
                          Você está na <span className="font-extrabold">{ranking.userPosition}ª</span> posição global.
                        </p>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">
                          Conclua mais treinos e registre PRs para subir no ranking! ⚡
                        </p>
                      </div>
                    )}
                    {ranking.userPosition > 0 && ranking.userPosition <= 5 && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                        <p className="text-xs text-emerald-700 font-bold">
                          Você está no TOP 5! Posição atual: <span className="font-extrabold">{ranking.userPosition}º Lugar</span> 🎉
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
  );
}