import React, { useState } from 'react';
import {
  Edit,
  Eye,
  Play,
  Sparkles,
  Archive,
  RotateCcw,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import Link from 'next/link';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  restSeconds: number;
  method: string;
  videoUrl?: string | null;
  gifUrl?: string | null;
  description?: string | null;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  division: string;
  weekDays: string | null;
  exercises: Exercise[];
  isArchived?: boolean;
  createdByType?: "TRAINER" | "STUDENT" | string;
  deletionStatus?: "ACTIVE" | "PENDING_DELETION" | "ARCHIVED" | string;
  deletionRequestedAt?: string | null;
  createdAt?: string;
}

interface WorkoutTabProps {
  loading: boolean;
  plans: WorkoutPlan[];
  handleOpenEdit: (plan: WorkoutPlan) => void;
  setSelectedPlanForPreview: (plan: WorkoutPlan) => void;
  onOpenImportModal: () => void;
  onArchivePlan: (plan: WorkoutPlan) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
  onRequestDeletion: (planId: string) => Promise<void>;
  hasTrainer: boolean;
}

export default function WorkoutTab({
  loading,
  plans,
  handleOpenEdit,
  setSelectedPlanForPreview,
  onOpenImportModal,
  onArchivePlan,
  onDeletePlan,
  onRequestDeletion,
  hasTrainer,
}: WorkoutTabProps) {
  const [isArchivedSectionOpen, setIsArchivedSectionOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<WorkoutPlan | null>(null);
  const [planToRequestDeletion, setPlanToRequestDeletion] = useState<WorkoutPlan | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Separar fichas ativas das arquivadas
  const activePlans = plans.filter((p) => !p.isArchived);
  const archivedPlans = plans.filter((p) => p.isArchived);

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setIsActionLoading(true);
    try {
      await onDeletePlan(planToDelete.id);
      setPlanToDelete(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmRequestDeletion = async () => {
    if (!planToRequestDeletion) return;
    setIsActionLoading(true);
    try {
      await onRequestDeletion(planToRequestDeletion.id);
      setPlanToRequestDeletion(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleArchiveInstead = async (plan: WorkoutPlan) => {
    setPlanToRequestDeletion(null);
    setPlanToDelete(null);
    await onArchivePlan(plan);
  };

  return (
    <>
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-6 w-32 skeleton-shimmer"></div>
            <div className="h-6 w-16 skeleton-shimmer"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-3 w-full">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 skeleton-shimmer rounded-full"></div>
                    <div className="h-5 w-40 skeleton-shimmer"></div>
                  </div>
                  <div className="h-3 w-3/4 skeleton-shimmer"></div>
                </div>
                <div className="h-8 w-8 skeleton-shimmer rounded-full shrink-0"></div>
              </div>
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-50">
                <div className="h-8 w-20 skeleton-shimmer rounded-full"></div>
                <div className="h-8 w-24 skeleton-shimmer rounded-full"></div>
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
          {/* Cabeçalho da Aba */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Meus Treinos</h3>
              <p className="text-[11px] text-slate-500">
                {activePlans.length} ficha{activePlans.length > 1 ? 's' : ''} ativa{activePlans.length > 1 ? 's' : ''}
                {archivedPlans.length > 0 && ` • ${archivedPlans.length} arquivada${archivedPlans.length > 1 ? 's' : ''}`}
              </p>
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

          {/* Lista de Fichas Ativas */}
          {activePlans.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs">
              Todas as suas fichas estão arquivadas no momento. Você pode visualizá-las ou desarquivá-las abaixo.
            </div>
          ) : (
            activePlans.map((plan: WorkoutPlan) => {
              const isPendingDeletion = plan.deletionStatus === "PENDING_DELETION";
              const isTrainerPlan = plan.createdByType === "TRAINER" && hasTrainer;

              return (
                <div
                  key={plan.id}
                  className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80 flex flex-col justify-between group hover:border-[#2563EB]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Banner de Solicitação de Exclusão Pendente (3 dias) */}
                  {isPendingDeletion && (
                    <div className="mb-4 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900 animate-pulse">
                      <div className="flex items-center gap-2 font-semibold">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Exclusão solicitada ao treinador (Prazo de até 3 dias)</span>
                      </div>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                        Pendente
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                          {plan.division ? `(${plan.division}) ` : ""}{plan.name}
                        </h4>

                        {/* Botões de Ação no Título: Editar, Arquivar e Excluir */}
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(plan)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#2563EB]/5 transition-all cursor-pointer"
                            title="Editar divisão e dias"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão Arquivar */}
                          <button
                            type="button"
                            onClick={() => onArchivePlan(plan)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-amber-600 hover:bg-amber-50 transition-all cursor-pointer"
                            title="Arquivar treino (oculta da tela inicial)"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão Excluir / Solicitar Exclusão */}
                          {!isPendingDeletion && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isTrainerPlan) {
                                  setPlanToRequestDeletion(plan);
                                } else {
                                  setPlanToDelete(plan);
                                }
                              }}
                              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                              title={isTrainerPlan ? "Solicitar exclusão ao treinador (3 dias)" : "Excluir ficha"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {plan.createdAt && (
                        <p className="text-[11px] text-[#64748B] mt-1">
                          Criado em {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {plan.description && (
                        <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">{plan.description}</p>
                      )}
                      {plan.weekDays && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {plan.weekDays.split(",").map((day: string) => (
                            <span
                              key={day}
                              className="text-[10px] font-bold bg-[#2563EB]/5 text-[#2563EB] px-1.5 py-0.5 rounded border border-[#2563EB]/10"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      )}
                      {!plan.weekDays && (
                        <p className="text-[11px] text-[#94A3B8] mt-1.5 italic">Nenhum dia da semana definido</p>
                      )}
                    </div>

                    <span className="text-[11px] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-lg font-bold text-[#94A3B8] w-fit sm:self-start">
                      {plan.exercises.length} Exercícios
                    </span>
                  </div>

                  {/* Exercícios Preview */}
                  <div className="space-y-2 mb-6 border-y border-[#E2E8F0]/60 py-4">
                    {plan.exercises.slice(0, 3).map((ex: Exercise) => (
                      <div key={ex.id} className="flex justify-between items-center text-xs">
                        <span className="text-[#475569] font-medium">{ex.name}</span>
                        <span className="text-[#94A3B8]">
                          {ex.sets}x{ex.reps} • {ex.method}
                        </span>
                      </div>
                    ))}
                    {plan.exercises.length > 3 && (
                      <p className="text-[11px] text-[#94A3B8] text-center pt-1 font-semibold">
                        + {plan.exercises.length - 3} exercícios na ficha
                      </p>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForPreview(plan)}
                      className="flex-1 py-3 px-4 rounded-xl border border-[#E2E8F0] hover:bg-zinc-50 text-[#0F172A] font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                    >
                      <Eye className="w-4 h-4 text-[#94A3B8]" />
                      Visualizar Exercícios
                    </button>
                    <Link
                      href={`/student/workout-session/${plan.id}`}
                      className="flex-1 sm:flex-[1.5] py-3 px-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#1E3A8A] text-white font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-white stroke-[3px]" />
                      Iniciar Sessão de Treino
                    </Link>
                  </div>
                </div>
              );
            })
          )}

          {/* =========================================================================
              SEÇÃO RECOLHÍVEL: FICHAS ARQUIVADAS
              Mantém o app 100% limpo, permitindo que o aluno reveja treinos antigos
              ========================================================================= */}
          {archivedPlans.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200/70">
              <button
                type="button"
                onClick={() => setIsArchivedSectionOpen(!isArchivedSectionOpen)}
                className="w-full p-4 rounded-2xl bg-slate-100/70 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                    <Archive className="w-4 h-4" />
                  </div>
                  <span className="text-slate-800">Fichas Arquivadas ({archivedPlans.length})</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                  <span>{isArchivedSectionOpen ? "Ocultar" : "Visualizar"}</span>
                  {isArchivedSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isArchivedSectionOpen && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  {archivedPlans.map((plan: WorkoutPlan) => (
                    <div
                      key={plan.id}
                      className="glass-card rounded-2xl p-5 border border-slate-200/70 bg-white/70 opacity-90 hover:opacity-100 transition-all flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded">
                              Arquivada
                            </span>
                            <h4 className="text-sm font-bold text-slate-800">{plan.name}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {plan.exercises.length} exercícios cadastrados
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onArchivePlan(plan)}
                          className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-100 transition-all cursor-pointer active:scale-95"
                          title="Restaurar para as fichas ativas"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Desarquivar</span>
                        </button>
                      </div>

                      <div className="flex gap-2.5 mt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPlanForPreview(plan)}
                          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Ver Exercícios
                        </button>
                        <Link
                          href={`/student/workout-session/${plan.id}`}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white stroke-[3px]" />
                          <span>Treinar Agora</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIRMAÇÃO DE EXCLUSÃO DIRETA (FICHA DO ALUNO)
          ========================================================================= */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-[#0F172A]">Excluir Ficha de Treino?</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Tem certeza que deseja excluir <strong>{planToDelete.name}</strong>? Fique tranquilo: seus recordes de peso (PRs) e fotos continuam preservados no seu perfil.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleConfirmDelete}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-500/20 active:scale-95 disabled:opacity-50"
              >
                {isActionLoading ? "Excluindo..." : "Excluir Definitivamente"}
              </button>
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SOLICITAÇÃO DE EXCLUSÃO DE FICHA DO TREINADOR (PROTOCOLO 3 DIAS)
          ========================================================================= */}
      {planToRequestDeletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-extrabold text-[#0F172A]">Solicitar Exclusão da Ficha?</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Esta ficha foi prescrita pelo seu treinador. Ao solicitar a exclusão de <strong>{planToRequestDeletion.name}</strong>:
              </p>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left text-xs space-y-2 text-slate-700">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">•</span>
                  <span>O treinador será notificado e tem até <strong>3 dias</strong> para analisar e aceitar.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600">•</span>
                  <span>Caso o treinador não conteste no prazo, a ficha será <strong>excluída automaticamente</strong>.</span>
                </p>
                <p className="flex items-start gap-2 text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
                  <span className="font-bold text-amber-500">💡</span>
                  <span>Se você só não quer ver esta ficha agora, prefira <strong>Arquivar</strong> (ela sai da sua tela imediatamente).</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleArchiveInstead(planToRequestDeletion)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Archive className="w-4 h-4" />
                <span>Arquivar em vez de excluir (Imediato)</span>
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleConfirmRequestDeletion}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold text-xs hover:bg-amber-100 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isActionLoading ? "Enviando..." : "Confirmar Solicitação de Exclusão (3 dias)"}
              </button>
              <button
                type="button"
                onClick={() => setPlanToRequestDeletion(null)}
                className="w-full py-2 px-4 rounded-xl text-slate-400 font-semibold text-xs hover:text-slate-600 transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}