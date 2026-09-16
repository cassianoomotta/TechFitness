import React from 'react';
import { Dumbbell, Edit, Eye, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface WorkoutTabProps {
  loading: boolean;
  plans: any[];
  handleOpenEdit: (plan: any) => void;
  setSelectedPlanForPreview: (plan: any) => void;
  onOpenImportModal: () => void;
}

export default function WorkoutTab({
  loading,
  plans,
  handleOpenEdit,
  setSelectedPlanForPreview,
  onOpenImportModal,
}: WorkoutTabProps) {
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
              <h3 className="text-sm font-bold text-slate-800">Meus Treinos</h3>
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
        </div>
      )}
    </>
  );
}