import React from 'react';
import { Dumbbell, Loader2, Award, Trophy, Users, Edit, Eye, Play, Zap, Scale, Flame, Shield, ArrowRight, TrendingUp, RefreshCw, X, ChevronRight, Crown, Swords } from 'lucide-react';
import Link from 'next/link';

export default function WeightTab(props: any) {
  const {
    loading, plans, prsLoading, prs, gamificationLoading, gamification, rankingLoading, ranking, handleOpenEdit, setSelectedPlanForPreview, handleTabChange,
    partnerSearchQuery, setPartnerSearchQuery, partners, filteredPartners, selectedPartnerId, handleSelectPartner, comparisonLoading, comparison,
    measurements, measurementsLoading, newWeight, setNewWeight, newWeightDate, setNewWeightDate, savingWeight, handleSaveWeight, selectedPhotoForZoom, setSelectedPhotoForZoom,
    selectedTier, setSelectedTier, achievementFilter, setAchievementFilter, 
  } = props;

  return (
    <>
      
          <div className="space-y-6 animate-fade-in">
            {/* Card Objetivo de Peso */}
            <div className="glass-card rounded-2xl p-5 border border-[#E2E8F0] bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Foco do seu Objetivo</h4>
                <p className="text-[10px] text-[#94A3B8] mt-1">
                  Define se o ganho (Hipertrofia) ou a perda (Emagrecimento) de peso será destacado em verde.
                </p>
              </div>
              <div className="flex bg-zinc-100 p-1 rounded-xl border border-[#E2E8F0] w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => props.handleUpdateWeightGoal("EMAGRECER")}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    props.weightGoal === "EMAGRECER"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  Emagrecimento
                </button>
                <button
                  type="button"
                  onClick={() => props.handleUpdateWeightGoal("GANHAR_MASSA")}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    props.weightGoal === "GANHAR_MASSA"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  Ganho de Massa
                </button>
              </div>
            </div>
            {/* Card Registrar Peso */}
            <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0] bg-white shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2563EB]" />
                Registrar Peso Corporal
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Monitore sua evolução registrando seu peso regularmente. Os registros também ficarão disponíveis para seu treinador.
              </p>
              
              <form onSubmit={handleSaveWeight} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Ex: 75.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:border-[#2563EB] outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Data</label>
                  <input
                    type="date"
                    required
                    value={newWeightDate}
                    onChange={(e) => setNewWeightDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:border-[#2563EB] outline-none transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={savingWeight}
                  className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingWeight ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Registrar"
                  )}
                </button>
              </form>
              
              {props.weightError && (
                <p className="text-[11px] text-red-600 font-semibold">{props.weightError}</p>
              )}
            </div>

            {/* Card Histórico */}
            <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0] bg-white shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A]">Histórico de Registros</h3>
              
              {measurementsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#94A3B8]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mb-2" />
                  <p className="text-xs">Buscando histórico...</p>
                </div>
              ) : measurements.length === 0 ? (
                <p className="text-xs text-[#94A3B8] text-center py-6">Você ainda não registrou nenhum peso.</p>
              ) : (
                <div className="divide-y divide-[#E2E8F0] max-h-96 overflow-y-auto pr-1">
                  {measurements.map((m: any, idx: any) => {
                    const nextMeasurement = measurements[idx + 1];
                    const diff = nextMeasurement ? m.weight - nextMeasurement.weight : 0;
                    
                    const isExpanded = props.expandedMeasurementId === m.id;
                    const hasAdditionalInfo = 
                      (m.bodyFat !== null && m.bodyFat !== undefined) ||
                      (m.chest !== null && m.chest !== undefined) ||
                      (m.waist !== null && m.waist !== undefined) ||
                      (m.armLeft !== null && m.armLeft !== undefined) ||
                      (m.armRight !== null && m.armRight !== undefined) ||
                      (m.thighLeft !== null && m.thighLeft !== undefined) ||
                      (m.thighRight !== null && m.thighRight !== undefined) ||
                      (m.calfLeft !== null && m.calfLeft !== undefined) ||
                      (m.calfRight !== null && m.calfRight !== undefined) ||
                      (m.photos && m.photos.length > 0);

                    return (
                      <div key={m.id} className="py-3 first:pt-0 last:pb-0">
                        <div 
                          onClick={() => {
                            if (hasAdditionalInfo) {
                              props.setExpandedMeasurementId(isExpanded ? null : m.id);
                            }
                          }}
                          className={`flex items-center justify-between transition-colors ${hasAdditionalInfo ? "cursor-pointer hover:bg-zinc-55/60 p-1.5 rounded-xl -mx-1.5" : ""}`}
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                              {new Date(m.date).toLocaleDateString("pt-BR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                timeZone: "UTC",
                              })}
                              {hasAdditionalInfo && (
                                <span className="text-[9px] bg-blue-50 text-[#2563EB] px-1 py-0.2 rounded font-bold uppercase tracking-wider scale-90">
                                  Completo
                                </span>
                              )}
                            </span>
                            {nextMeasurement && (
                              <span className={`text-[10px] font-bold block ${
                                diff > 0 
                                  ? props.weightGoal === "GANHAR_MASSA" ? "text-emerald-500" : "text-red-500"
                                  : diff < 0 
                                  ? props.weightGoal === "GANHAR_MASSA" ? "text-red-500" : "text-emerald-500"
                                  : "text-[#94A3B8]"
                              }`}>
                                {diff > 0 ? `+${diff.toFixed(1)} kg 📈` : diff < 0 ? `${diff.toFixed(1)} kg 📉` : "Sem alteração"}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-base font-black text-[#2563EB] font-mono">
                              {m.weight.toFixed(1)} kg
                            </div>
                            {hasAdditionalInfo && (
                              <ChevronRight className={`w-4 h-4 text-[#94A3B8] transition-transform ${isExpanded ? "rotate-90 text-[#2563EB]" : ""}`} />
                            )}
                          </div>
                        </div>

                        {/* Detalhes Adicionais se Expandido */}
                        {isExpanded && hasAdditionalInfo && (
                          <div className="mt-3 p-4 rounded-xl bg-zinc-55/40 border border-[#E2E8F0] space-y-4 animate-slide-down">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-[#94A3B8]">
                              {m.bodyFat !== null && m.bodyFat !== undefined && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">BF (Gordura)</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">{m.bodyFat}%</span>
                                </div>
                              )}
                              {m.chest !== null && m.chest !== undefined && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">Peitoral</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">{m.chest} cm</span>
                                </div>
                              )}
                              {m.waist !== null && m.waist !== undefined && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">Cintura</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">{m.waist} cm</span>
                                </div>
                              )}
                              {(m.armLeft !== null || m.armRight !== null) && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">Braços (E/D)</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">
                                    {m.armLeft ?? "--"} / {m.armRight ?? "--"} cm
                                  </span>
                                </div>
                              )}
                              {(m.thighLeft !== null || m.thighRight !== null) && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">Coxas (E/D)</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">
                                    {m.thighLeft ?? "--"} / {m.thighRight ?? "--"} cm
                                  </span>
                                </div>
                              )}
                              {(m.calfLeft !== null || m.calfRight !== null) && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">Panturrilhas (E/D)</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">
                                    {m.calfLeft ?? "--"} / {m.calfRight ?? "--"} cm
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Fotos comparativas se existirem */}
                            {m.photos && m.photos.length > 0 && (
                              <div className="pt-3 border-t border-[#E2E8F0]/80">
                                <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8] mb-2 font-display">Fotos Comparativas</span>
                                <div className="flex gap-2 flex-wrap">
                                  {m.photos.map((photo: any, pIdx: any) => (
                                    <div
                                      key={pIdx}
                                      onClick={() => setSelectedPhotoForZoom(photo)}
                                      className="w-14 h-14 rounded-lg bg-zinc-50 border border-[#E2E8F0] overflow-hidden relative cursor-zoom-in hover:border-[#2563EB] transition-all"
                                    >
                                      <img src={photo} alt={`Foto ${pIdx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        
    </>
  );
}