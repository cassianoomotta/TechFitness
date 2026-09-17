import React from 'react';
import { Loader2, TrendingUp, ChevronRight, Scale } from 'lucide-react';

interface WeightMeasurement {
  id: string;
  weight: number;
  date: string;
  bodyFat?: number | null;
  chest?: number | null;
  waist?: number | null;
  armLeft?: number | null;
  armRight?: number | null;
  thighLeft?: number | null;
  thighRight?: number | null;
  calfLeft?: number | null;
  calfRight?: number | null;
  photos?: string[];
}

interface WeightTabProps {
  measurementsLoading: boolean;
  measurements: WeightMeasurement[];
  newWeight: string;
  setNewWeight: (value: string) => void;
  newWeightDate: string;
  setNewWeightDate: (value: string) => void;
  savingWeight: boolean;
  handleSaveWeight: (e: React.FormEvent) => void;
  weightGoal: string;
  handleUpdateWeightGoal: (goal: string) => void;
  weightError: string;
  expandedMeasurementId: string | null;
  setExpandedMeasurementId: (id: string | null) => void;
  setSelectedPhotoForZoom: (url: string) => void;
}

export default function WeightTab({
  measurementsLoading,
  measurements,
  newWeight,
  setNewWeight,
  newWeightDate,
  setNewWeightDate,
  savingWeight,
  handleSaveWeight,
  weightGoal,
  handleUpdateWeightGoal,
  weightError,
  expandedMeasurementId,
  setExpandedMeasurementId,
  setSelectedPhotoForZoom,
}: WeightTabProps) {
  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Card Objetivo de Peso */}
        <div className="glass-card rounded-2xl p-5 border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Foco do seu Objetivo</h4>
            <p className="text-[11px] text-[#94A3B8] mt-1">
              Define se o ganho (Hipertrofia) ou a perda (Emagrecimento) de peso será destacado em verde.
            </p>
          </div>
          <div className="flex bg-zinc-100 p-1 rounded-xl border border-[#E2E8F0] w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleUpdateWeightGoal("EMAGRECER")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                weightGoal === "EMAGRECER"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#94A3B8] hover:text-[#0F172A]"
              }`}
            >
              Emagrecimento
            </button>
            <button
              type="button"
              onClick={() => handleUpdateWeightGoal("GANHAR_MASSA")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                weightGoal === "GANHAR_MASSA"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#94A3B8] hover:text-[#0F172A]"
              }`}
            >
              Ganho de Massa
            </button>
          </div>
        </div>

        {/* Card Registrar Peso */}
        <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2563EB]" />
            Registrar Peso Corporal
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Monitore sua evolução registrando seu peso regularmente. Os registros também ficarão disponíveis para seu treinador.
          </p>
          
          <form onSubmit={handleSaveWeight} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="Ex: 75.5"
                inputMode="decimal"
                autoFocus
                value={newWeight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWeight(e.target.value)}
                className="w-full px-4 py-2.5 min-h-[48px] rounded-xl border border-[#E2E8F0] text-base md:text-sm text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Data</label>
              <input
                type="date"
                required
                value={newWeightDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWeightDate(e.target.value)}
                className="w-full px-4 py-2.5 min-h-[48px] rounded-xl border border-[#E2E8F0] text-base md:text-sm text-[#0F172A] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
              />
            </div>
            
            <button
              type="submit"
              disabled={savingWeight}
              className="w-full py-3 px-4 min-h-[48px] rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-md shadow-blue-500/10"
            >
              {savingWeight ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Registrar"
              )}
            </button>
          </form>
          
          {weightError && (
            <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-200/60 px-3 py-2 rounded-xl">{weightError}</p>
          )}
        </div>

        {/* Card Histórico */}
        <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#0F172A]">Histórico de Registros</h3>
          
          {measurementsLoading ? (
            /* Skeleton Shimmer — Substituindo Loader2 spinner */
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((i: number) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-36 skeleton-shimmer"></div>
                    <div className="h-3 w-20 skeleton-shimmer"></div>
                  </div>
                  <div className="h-5 w-16 skeleton-shimmer"></div>
                </div>
              ))}
            </div>
          ) : measurements.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
                <Scale className="w-6 h-6" />
              </div>
              <p className="text-xs text-[#64748B] font-semibold">Você ainda não registrou nenhum peso.</p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Use o formulário acima para começar a acompanhar sua evolução! ⚖️
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0] max-h-96 overflow-y-auto pr-1">
              {measurements.map((m: WeightMeasurement, idx: number) => {
                const nextMeasurement = measurements[idx + 1];
                const diff = nextMeasurement ? m.weight - nextMeasurement.weight : 0;
                
                const isExpanded = expandedMeasurementId === m.id;
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
                          setExpandedMeasurementId(isExpanded ? null : m.id);
                        }
                      }}
                      className={`flex items-center justify-between transition-all ${hasAdditionalInfo ? "cursor-pointer hover:bg-zinc-50/60 p-1.5 rounded-xl -mx-1.5" : ""}`}
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
                            <span className="text-[10px] bg-blue-50 text-[#2563EB] px-1 py-0.5 rounded font-bold uppercase tracking-wider">
                              Completo
                            </span>
                          )}
                        </span>
                        {nextMeasurement && (
                          <span className={`text-[11px] font-bold block ${
                            diff > 0 
                              ? weightGoal === "GANHAR_MASSA" ? "text-emerald-500" : "text-red-500"
                              : diff < 0 
                              ? weightGoal === "GANHAR_MASSA" ? "text-red-500" : "text-emerald-500"
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
                      <div className="mt-3 p-4 rounded-xl bg-zinc-50/40 border border-[#E2E8F0] space-y-4 animate-slide-down">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-[#94A3B8]">
                          {m.bodyFat !== null && m.bodyFat !== undefined && (
                            <div>
                              <span className="block font-bold text-[10px] uppercase tracking-wider text-[#94A3B8]">BF (Gordura)</span>
                              <span className="text-[#0F172A] font-bold font-mono text-xs">{m.bodyFat}%</span>
                            </div>
                          )}
                          {m.chest !== null && m.chest !== undefined && (
                            <div>
                              <span className="block font-bold text-[10px] uppercase tracking-wider text-[#94A3B8]">Peitoral</span>
                              <span className="text-[#0F172A] font-bold font-mono text-xs">{m.chest} cm</span>
                            </div>
                          )}
                          {m.waist !== null && m.waist !== undefined && (
                            <div>
                              <span className="block font-bold text-[10px] uppercase tracking-wider text-[#94A3B8]">Cintura</span>
                              <span className="text-[#0F172A] font-bold font-mono text-xs">{m.waist} cm</span>
                            </div>
                          )}
                          {(m.armLeft !== null || m.armRight !== null) && (
                            <div>
                              <span className="block font-bold text-[10px] uppercase tracking-wider text-[#94A3B8]">Braços (E/D)</span>
                              <span className="text-[#0F172A] font-bold font-mono text-xs">
                                {m.armLeft ?? "--"} / {m.armRight ?? "--"} cm
                              </span>
                            </div>
                          )}
                          {(m.thighLeft !== null || m.thighRight !== null) && (
                            <div>
                              <span className="block font-bold text-[10px] uppercase tracking-wider text-[#94A3B8]">Coxas (E/D)</span>
                              <span className="text-[#0F172A] font-bold font-mono text-xs">
                                {m.thighLeft ?? "--"} / {m.thighRight ?? "--"} cm
                              </span>
                            </div>
                          )}
                          {(m.calfLeft !== null || m.calfRight !== null) && (
                            <div>
                              <span className="block font-bold text-[10px] uppercase tracking-wider text-[#94A3B8]">Panturrilhas (E/D)</span>
                              <span className="text-[#0F172A] font-bold font-mono text-xs">
                                {m.calfLeft ?? "--"} / {m.calfRight ?? "--"} cm
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Fotos comparativas se existirem */}
                        {m.photos && m.photos.length > 0 && (
                          <div className="pt-3 border-t border-[#E2E8F0]/80">
                            <span className="block font-bold text-[10px] uppercase tracking-wider text-[#94A3B8] mb-2 font-display">Fotos Comparativas</span>
                            <div className="flex gap-2 flex-wrap">
                              {m.photos.map((photo: string, pIdx: number) => (
                                <div
                                  key={pIdx}
                                  onClick={() => setSelectedPhotoForZoom(photo)}
                                  className="w-14 h-14 rounded-lg bg-zinc-50 border border-[#E2E8F0] overflow-hidden relative cursor-zoom-in hover:border-[#2563EB] transition-all hover:scale-105"
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