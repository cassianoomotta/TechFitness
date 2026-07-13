import React from 'react';
import { Calendar, Activity, Dumbbell, Loader2, Award, Trophy, Users, Edit, Eye, Play, Zap, Scale, Flame, Shield, ArrowRight, TrendingUp, RefreshCw, X, ChevronRight, Crown, Swords } from 'lucide-react';
import Link from 'next/link';

export default function PartnerTab(props: any) {
  const {
    loading, plans, prsLoading, prs, gamificationLoading, gamification, rankingLoading, ranking, handleOpenEdit, setSelectedPlanForPreview, handleTabChange,
    partnerSearchQuery, setPartnerSearchQuery, partners, filteredPartners, selectedPartnerId, handleSelectPartner, comparisonLoading, comparison,
    measurements, measurementsLoading, newWeight, setNewWeight, newWeightDate, setNewWeightDate, savingWeight, handleSaveWeight, selectedPhotoForZoom, setSelectedPhotoForZoom,
    selectedTier, setSelectedTier, achievementFilter, setAchievementFilter
  } = props;

  return (
    <>
      
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#2563EB]" /> Comparar Desempenho (Treino em Dupla)
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Selecione um parceiro de treino da mesma assessoria para comparar seu volume, consistência e recordes de carga em tempo real!
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Buscar Parceiro (Nome ou E-mail)</label>
                  <input
                    type="text"
                    placeholder="Digite o nome ou e-mail..."
                    value={partnerSearchQuery}
                    onChange={(e) => setPartnerSearchQuery(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Escolha seu Parceiro de Treino</label>
                  {partners.length === 0 ? (
                    <p className="text-xs text-[#94A3B8] italic">Buscando parceiros cadastrados na assessoria...</p>
                  ) : filteredPartners.length === 0 ? (
                    <p className="text-xs text-red-500 font-semibold italic">Nenhum parceiro encontrado.</p>
                  ) : (
                    <select
                      value={selectedPartnerId}
                      onChange={(e) => handleSelectPartner(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
                    >
                      <option value="">-- Selecionar Parceiro --</option>
                      {filteredPartners.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name || "Sem Nome"} ({p.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Resultado da Comparação */}
            {comparisonLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
                <p className="text-xs">Consolidando dados do duelo...</p>
              </div>
            ) : comparison ? (
              <div className="space-y-6">
                
                {/* Duelo de Consistência e Volume */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Card Consistência */}
                  <div className="glass-card rounded-2xl p-5 border border-[#E2E8F0]/80">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#2563EB]" /> Presença (Treinos Concluídos)
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Você */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#0F172A]">Você</span>
                          <span className="text-[#2563EB] font-mono">{comparison.myInfo.sessionsCount} treinos</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                          <div
                            className="bg-[#2563EB] h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount) > 0
                                  ? (comparison.myInfo.sessionsCount / Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Parceiro */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#0F172A]">{comparison.partnerInfo.name}</span>
                          <span className="text-[#94A3B8] font-mono">{comparison.partnerInfo.sessionsCount} treinos</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                          <div
                            className="bg-zinc-800 h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount) > 0
                                  ? (comparison.partnerInfo.sessionsCount / Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Volume de Trabalho */}
                  <div className="glass-card rounded-2xl p-5 border border-[#E2E8F0]/80">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#2563EB]" /> Volume de Séries Concluídas
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Você */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#0F172A]">Você</span>
                          <span className="text-[#2563EB] font-mono">{comparison.myInfo.setsCount} séries</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                          <div
                            className="bg-[#2563EB] h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount) > 0
                                  ? (comparison.myInfo.setsCount / Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Parceiro */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#0F172A]">{comparison.partnerInfo.name}</span>
                          <span className="text-[#94A3B8] font-mono">{comparison.partnerInfo.setsCount} séries</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                          <div
                            className="bg-zinc-800 h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount) > 0
                                  ? (comparison.partnerInfo.setsCount / Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Exercícios em Comum nos Planos */}
                <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
                      <Swords className="w-4 h-4 text-[#2563EB]" /> Exercícios em Comum
                    </h4>
                    <span className="text-[10px] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-bold text-[#2563EB]">
                      {comparison.sharedExercises.length} exercício{comparison.sharedExercises.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {comparison.sharedExercises.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-[#E2E8F0] rounded-xl">
                      <Dumbbell className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
                      <p className="text-xs text-[#94A3B8] font-medium">
                        Vocês não possuem exercícios em comum nos planos de treino atuais.
                      </p>
                      <p className="text-[10px] text-[#94A3B8] mt-1">
                        Peça ao seu treinador para incluir exercícios semelhantes!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {/* Agrupados por grupo muscular */}
                      {(() => {
                        const groups = comparison.sharedExercises.reduce((acc: any, ex: any) => {
                          const group = ex.muscleGroup || "Outros";
                          if (!acc[group]) acc[group] = [];
                          acc[group].push(ex);
                          return acc;
                        }, {} as Record<string, typeof comparison.sharedExercises>);
                        
                        return Object.entries(groups).map(([group, exercises]) => (
                          <div key={group}>
                            <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5 mt-3 first:mt-0">
                              {group}
                            </p>
                            <div className="space-y-1.5">
                              {(exercises as any[]).map((ex: any) => (
                                <div key={ex.exerciseId} className="p-2.5 bg-zinc-50 rounded-lg border border-[#E2E8F0]/60 flex items-center justify-between gap-3 hover:border-blue-200 transition-all">
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#0F172A] truncate">{ex.name}</p>
                                    <p className="text-[9px] text-[#94A3B8]">{ex.equipment}</p>
                                  </div>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0 border border-emerald-200/50">
                                    Em Comum ✓
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Duelo de Carga nos Exercícios em Comum */}
                {comparison.exerciseComparison.length > 0 && (
                  <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-5 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#2563EB]" /> Duelo de PRs — Exercícios em Comum
                    </h4>

                    {comparison.exerciseComparison.filter(ex => ex.myMax > 0 || ex.partnerMax > 0).length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-[#E2E8F0] rounded-xl">
                        <TrendingUp className="w-6 h-6 mx-auto text-[#94A3B8] mb-2" />
                        <p className="text-xs text-[#94A3B8] font-medium">
                          Nenhum de vocês registrou carga nos exercícios em comum ainda.
                        </p>
                        <p className="text-[10px] text-[#94A3B8] mt-1">
                          Complete treinos para gerar o duelo de cargas! 💪
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comparison.exerciseComparison
                          .filter(ex => ex.myMax > 0 || ex.partnerMax > 0)
                          .map((ex: any) => {
                            const maxBetween = Math.max(ex.myMax, ex.partnerMax);
                            const iAmWinning = ex.myMax > ex.partnerMax;
                            const isTied = ex.myMax === ex.partnerMax && ex.myMax > 0;
                            return (
                              <div key={ex.exerciseId} className="p-4 rounded-xl bg-zinc-50 border border-[#E2E8F0]/60">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h5 className="text-xs font-bold text-[#0F172A]">{ex.exerciseName}</h5>
                                    <p className="text-[9px] text-[#94A3B8]">{ex.muscleGroup}</p>
                                  </div>
                                  {!isTied && (ex.myMax > 0 || ex.partnerMax > 0) && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      iAmWinning
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                        : "bg-red-50 text-red-600 border border-red-200/50"
                                    }`}>
                                      {iAmWinning ? "Você vence 🏆" : `${comparison.partnerInfo.name.split(" ")[0]} vence`}
                                    </span>
                                  )}
                                  {isTied && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/50">
                                      Empate ⚔️
                                    </span>
                                  )}
                                </div>
                                
                                {/* Barras de comparação */}
                                <div className="space-y-2.5">
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                      <span className="text-[#0F172A]">Você</span>
                                      <span className="text-[#2563EB] font-mono">{ex.myMax > 0 ? `${ex.myMax}kg` : "—"}</span>
                                    </div>
                                    <div className="w-full bg-white h-2.5 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                                      <div
                                        className="bg-[#2563EB] h-full rounded-lg transition-all duration-1000"
                                        style={{ width: `${maxBetween > 0 ? (ex.myMax / maxBetween) * 100 : 0}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                      <span className="text-[#0F172A]">{comparison.partnerInfo.name.split(" ")[0]}</span>
                                      <span className="text-[#94A3B8] font-mono">{ex.partnerMax > 0 ? `${ex.partnerMax}kg` : "—"}</span>
                                    </div>
                                    <div className="w-full bg-white h-2.5 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                                      <div
                                        className="bg-zinc-700 h-full rounded-lg transition-all duration-1000"
                                        style={{ width: `${maxBetween > 0 ? (ex.partnerMax / maxBetween) * 100 : 0}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="p-12 text-center text-[#94A3B8] border border-[#E2E8F0] border-dashed rounded-2xl">
                <Users className="w-8 h-8 mx-auto text-[#475569] mb-2" />
                <p className="text-xs">Selecione um parceiro de treino acima para ver o duelo de performance.</p>
              </div>
            )}
          </div>
        
    </>
  );
}