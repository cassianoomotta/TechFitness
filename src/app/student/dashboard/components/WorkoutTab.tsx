import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  MoreVertical,
  Dumbbell,
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
  order?: number;
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
  onBulkAction: (planIds: string[], action: "ARCHIVE" | "UNARCHIVE" | "DELETE" | "REORDER") => Promise<void>;
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
  onBulkAction,
  hasTrainer,
}: WorkoutTabProps) {
  const [mounted, setMounted] = useState(false);
  const [isArchivedSectionOpen, setIsArchivedSectionOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<WorkoutPlan | null>(null);
  const [planToRequestDeletion, setPlanToRequestDeletion] = useState<WorkoutPlan | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkModalTab, setBulkModalTab] = useState<"actions" | "reorder">("actions");
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [reorderedPlans, setReorderedPlans] = useState<WorkoutPlan[]>([]);
  const [activeMenuPlanId, setActiveMenuPlanId] = useState<string | null>(null);
  const [expandedPlanIds, setExpandedPlanIds] = useState<Record<string, boolean>>({});
  const [animatingSwap, setAnimatingSwap] = useState<{
    idA: string;
    idB: string;
    dirA: "up" | "down";
  } | null>(null);
  const swapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (swapTimeoutRef.current) clearTimeout(swapTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isBulkModalOpen || planToDelete || planToRequestDeletion) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isBulkModalOpen, planToDelete, planToRequestDeletion]);

  const togglePlanExpand = (planId: string) => {
    setExpandedPlanIds((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

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

  const handleToggleSelectPlan = (id: string) => {
    setSelectedPlanIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedPlanIds.length === activePlans.length) {
      setSelectedPlanIds([]);
    } else {
      setSelectedPlanIds(activePlans.map((p) => p.id));
    }
  };

  const handleExecuteBulkAction = async (action: "ARCHIVE" | "DELETE") => {
    if (selectedPlanIds.length === 0) return;
    setIsActionLoading(true);
    try {
      await onBulkAction(selectedPlanIds, action);
      setIsBulkModalOpen(false);
      setSelectedPlanIds([]);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnarchiveAll = async () => {
    if (archivedPlans.length === 0) return;
    setIsActionLoading(true);
    try {
      await onBulkAction(archivedPlans.map((p) => p.id), "UNARCHIVE");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMovePlan = (index: number, direction: "up" | "down") => {
    if (animatingSwap || isActionLoading) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= reorderedPlans.length) return;

    const itemA = reorderedPlans[index];
    const itemB = reorderedPlans[newIndex];

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const updated = [...reorderedPlans];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      setReorderedPlans(updated);
      return;
    }

    setAnimatingSwap({
      idA: itemA.id,
      idB: itemB.id,
      dirA: direction,
    });

    if (swapTimeoutRef.current) clearTimeout(swapTimeoutRef.current);

    swapTimeoutRef.current = setTimeout(() => {
      setReorderedPlans((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(index, 1);
        updated.splice(newIndex, 0, moved);
        return updated;
      });
      setAnimatingSwap(null);
    }, 280);
  };

  const handleSaveReorder = async () => {
    if (reorderedPlans.length === 0) return;
    setIsActionLoading(true);
    try {
      const planIds = reorderedPlans.map((p) => p.id);
      await onBulkAction(planIds, "REORDER");
      setIsBulkModalOpen(false);
    } finally {
      setIsActionLoading(false);
    }
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
          <div className="flex items-center justify-between pb-1 gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">Meus Treinos</h3>
              <p className="text-[11px] text-slate-500 truncate">
                {activePlans.length} ficha{activePlans.length > 1 ? 's' : ''} ativa{activePlans.length > 1 ? 's' : ''}
                {archivedPlans.length > 0 && ` • ${archivedPlans.length} arquivada${archivedPlans.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto justify-end">
              {activePlans.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanIds(activePlans.map((p) => p.id));
                    setReorderedPlans([...activePlans]);
                    setBulkModalTab("actions");
                    setIsBulkModalOpen(true);
                  }}
                  className="px-2.5 sm:px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] sm:text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
                  title="Gerenciar e organizar treinos"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>Gerenciar Treinos</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenImportModal}
                className="px-2.5 sm:px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-bold text-[11px] sm:text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Importar com IA</span>
              </button>
            </div>
          </div>

          {/* Lista de Fichas Ativas em Formato de Lista Unificada */}
          {activePlans.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs">
              Todas as suas fichas estão arquivadas no momento. Você pode visualizá-las ou desarquivá-las abaixo.
            </div>
          ) : (
            <div className="space-y-4">
              {activePlans.map((plan: WorkoutPlan) => {
                const isPendingDeletion = plan.deletionStatus === "PENDING_DELETION";
                const isTrainerPlan = plan.createdByType === "TRAINER" && hasTrainer;
                const isMenuOpen = activeMenuPlanId === plan.id;
                const isExpanded = !!expandedPlanIds[plan.id];
                const totalSets = plan.exercises.reduce((acc: number, ex: Exercise) => acc + (Number(ex.sets) || 3), 0);

                return (
                  <div
                    key={plan.id}
                    className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200/80 bg-white/95 shadow-xs hover:border-[#2563EB]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between relative"
                  >
                    <div>
                      {/* Banner de Solicitação de Exclusão Pendente (3 dias) */}
                      {isPendingDeletion && (
                        <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900 animate-pulse">
                          <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Exclusão solicitada ao treinador (Prazo de até 3 dias)</span>
                          </div>
                          <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                            Pendente
                          </span>
                        </div>
                      )}

                      {/* Topo do Card: Divisão, Título, Info e Menu Sutil ••• */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
                            {plan.division || "A"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm sm:text-base font-extrabold text-[#0F172A] truncate">
                              {plan.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-bold text-slate-500">
                                {plan.exercises.length} exercícios • {totalSets} séries
                              </span>
                              {plan.weekDays && (
                                <>
                                  <span className="text-slate-300 text-xs">•</span>
                                  <span className="text-[11px] text-blue-600 font-semibold truncate">
                                    {plan.weekDays}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Menu Sutil de Ações (•••) */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveMenuPlanId(isMenuOpen ? null : plan.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                            title="Mais opções da ficha"
                            aria-label="Mais opções"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setActiveMenuPlanId(null)}
                              />
                              <div className="absolute right-0 top-9 z-30 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuPlanId(null);
                                    handleOpenEdit(plan);
                                  }}
                                  className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Editar ficha e divisão</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuPlanId(null);
                                    onArchivePlan(plan);
                                  }}
                                  className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                                >
                                  <Archive className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Arquivar treino</span>
                                </button>

                                {!isPendingDeletion && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuPlanId(null);
                                      if (isTrainerPlan) {
                                        setPlanToRequestDeletion(plan);
                                      } else {
                                        setPlanToDelete(plan);
                                      }
                                    }}
                                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer border-t border-slate-100"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    <span>{isTrainerPlan ? "Solicitar exclusão" : "Excluir ficha"}</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Lista de Exercícios em Formato de Linhas (Visão Holística / Opção A) */}
                      {plan.exercises && plan.exercises.length > 0 ? (
                        <div className="my-3 space-y-1.5">
                          {((isExpanded || plan.exercises.length <= 4)
                            ? plan.exercises
                            : plan.exercises.slice(0, 4)
                          ).map((ex: Exercise, idx: number) => (
                            <div
                              key={ex.id || idx}
                              className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/70 border border-slate-100/90 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="text-xs font-black text-slate-400 w-5 text-center shrink-0">
                                  {idx + 1}.
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                                  {ex.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                                  {ex.sets || 3} séries × {ex.reps || "10-12"} reps
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* Seta para expandir e ver todos os exercícios caso exceda 4 */}
                          {plan.exercises.length > 4 && (
                            <button
                              type="button"
                              onClick={() => togglePlanExpand(plan.id)}
                              className="w-full py-2 mt-1 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/70 rounded-xl transition-all cursor-pointer border border-blue-100/60 bg-blue-50/30"
                            >
                              <span>
                                {isExpanded
                                  ? "Recolher exercícios"
                                  : `Ver todos os ${plan.exercises.length} exercícios (+${plan.exercises.length - 4})`}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-blue-600" />
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="my-3 text-xs text-slate-400 italic">
                          Nenhum exercício cadastrado nesta ficha.
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação Ergonômicos (Apple HIG min 44px) */}
                    <div className="flex gap-2.5 pt-2 border-t border-slate-100/80 mt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPlanForPreview(plan)}
                        className="flex-1 min-h-[44px] py-2 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ver Exercícios</span>
                      </button>
                      <Link
                        href={`/student/workout-session/${plan.id}`}
                        className="flex-[1.2] min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 text-center"
                      >
                        <Dumbbell className="w-4 h-4 text-white" />
                        <span>Iniciar Treino</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
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
                <div className="flex items-center gap-2.5">
                  {archivedPlans.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnarchiveAll();
                      }}
                      disabled={isActionLoading}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 hover:border-blue-300 hover:bg-white text-slate-600 hover:text-blue-700 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Restaurar todas as fichas arquivadas para a lista ativa"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Desarquivar Todos</span>
                    </button>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                    <span>{isArchivedSectionOpen ? "Ocultar" : "Visualizar"}</span>
                    {isArchivedSectionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
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
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Dumbbell className="w-3.5 h-3.5 text-white" />
                          <span>Iniciar Treino</span>
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
          MODAL: GERENCIAR TREINOS (ORGANIZAR ORDEM / ARQUIVAR / EXCLUIR EM LOTE)
          ========================================================================= */}
      {mounted && isBulkModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[calc(100dvh-2rem)] my-auto animate-scale-up">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A]">Gerenciar Treinos</h3>
                  <p className="text-[11px] text-[#64748B]">Organize a ordem, arquive ou exclua fichas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Control Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl gap-1 border border-slate-200/60 shrink-0 my-3">
              <button
                type="button"
                onClick={() => setBulkModalTab("actions")}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  bulkModalTab === "actions"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Arquivar / Excluir</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReorderedPlans([...activePlans]);
                  setBulkModalTab("reorder");
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  bulkModalTab === "reorder"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Organizar Ordem</span>
              </button>
            </div>

            {bulkModalTab === "actions" ? (
              <>
                <div className="overflow-y-auto min-h-0 flex-1 pr-1 space-y-3">
                  <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed space-y-1">
                    <p className="font-semibold flex items-center gap-1.5 text-[11px] sm:text-xs">
                      💡 Organização Semanal Limpa
                    </p>
                    <p className="text-[11px] text-blue-800">
                      Ao arquivar, suas fichas saem da tela principal para você focar no novo ciclo, mas permanecem 100% salvas na gaveta de arquivados. Seus recordes de peso (PRs) e fotos continuam preservados!
                    </p>
                  </div>

                  {/* Seletor Todos */}
                  <div className="flex items-center justify-between px-1 py-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedPlanIds.length === activePlans.length && activePlans.length > 0}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />
                      <span>Selecionar Todos ({selectedPlanIds.length}/{activePlans.length})</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {selectedPlanIds.length} marcado{selectedPlanIds.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Lista de Fichas com Checkboxes */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {activePlans.map((plan) => {
                      const isSelected = selectedPlanIds.includes(plan.id);
                      return (
                        <div
                          key={plan.id}
                          onClick={() => handleToggleSelectPlan(plan.id)}
                          className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer select-none ${
                            isSelected
                              ? "bg-blue-50/50 border-blue-300 shadow-xs"
                              : "bg-slate-50 border-slate-200/80 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer pointer-events-none"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                                {plan.division || "A"}
                              </span>
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {plan.name}
                              </p>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 ml-7">
                              {plan.exercises?.length || 0} exercícios • {plan.weekDays || "Qualquer dia"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={selectedPlanIds.length === 0 || isActionLoading}
                    onClick={() => handleExecuteBulkAction("DELETE")}
                    className="py-2.5 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors cursor-pointer text-center disabled:opacity-50 disabled:pointer-events-none"
                    title="Excluir fichas selecionadas"
                  >
                    Excluir ({selectedPlanIds.length})
                  </button>
                  <button
                    type="button"
                    disabled={selectedPlanIds.length === 0 || isActionLoading}
                    onClick={() => handleExecuteBulkAction("ARCHIVE")}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Arquivar ({selectedPlanIds.length})</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="overflow-y-auto min-h-0 flex-1 pr-1 space-y-3">
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed space-y-1">
                    <p className="font-semibold flex items-center gap-1.5 text-[11px] sm:text-xs">
                      ↕️ Sequência Inteligente de Treinos
                    </p>
                    <p className="text-[11px] text-amber-800">
                      A ordem abaixo define a sequência inteligente sugerida na tela inicial (ex: 1º Treino ➔ 2º Treino ➔ 3º Treino). Use as setas para mover cada treino para cima ou para baixo.
                    </p>
                  </div>

                  {/* Lista Reordenável */}
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {reorderedPlans.map((plan, index) => {
                      const isFirst = index === 0;
                      const isLast = index === reorderedPlans.length - 1;

                      const isItemA = animatingSwap?.idA === plan.id;
                      const isItemB = animatingSwap?.idB === plan.id;
                      const isAnimating = isItemA || isItemB;

                      let transformStyle = "translateY(0)";
                      if (isItemA) {
                        transformStyle =
                          animatingSwap?.dirA === "up"
                            ? "translateY(calc(-100% - 0.5rem))"
                            : "translateY(calc(100% + 0.5rem))";
                      } else if (isItemB) {
                        transformStyle =
                          animatingSwap?.dirA === "up"
                            ? "translateY(calc(100% + 0.5rem))"
                            : "translateY(calc(-100% - 0.5rem))";
                      }

                      return (
                        <div
                          key={plan.id}
                          style={{
                            transform: transformStyle,
                            transition: isAnimating
                              ? "transform 280ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 280ms ease, border-color 280ms ease, background-color 280ms ease"
                              : "transform 0s",
                          }}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 will-change-transform ${
                            isItemA
                              ? "z-20 border-blue-400 bg-blue-50/90 shadow-lg shadow-blue-500/15 scale-[1.02]"
                              : isItemB
                              ? "z-10 border-slate-200/90 bg-slate-100/70 opacity-90 scale-[0.99]"
                              : "border-slate-200 bg-slate-50 shadow-2xs hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span
                              className={`w-6 h-6 rounded-lg font-extrabold text-[11px] flex items-center justify-center shrink-0 transition-colors ${
                                isItemA
                                  ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {index + 1}º
                            </span>
                            <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                              {plan.division || "A"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {plan.name}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                {plan.exercises?.length || 0} exercícios • {plan.weekDays || "Qualquer dia"}
                              </p>
                            </div>
                          </div>

                          {/* Botões Mover (Apple HIG: alvos de 36px-44px) */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={isFirst || isActionLoading || !!animatingSwap}
                              onClick={() => handleMovePlan(index, "up")}
                              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 active:scale-90 text-slate-700 flex items-center justify-center transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                              title="Mover para cima"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={isLast || isActionLoading || !!animatingSwap}
                              onClick={() => handleMovePlan(index, "down")}
                              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 active:scale-90 text-slate-700 flex items-center justify-center transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botões de Ação para Salvar Ordem */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={handleSaveReorder}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Nova Ordem</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          MODAL: CONFIRMAÇÃO DE EXCLUSÃO DIRETA (FICHA DO ALUNO)
          ========================================================================= */}
      {mounted && planToDelete && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-auto animate-scale-up">
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
        </div>,
        document.body
      )}

      {/* =========================================================================
          MODAL: SOLICITAÇÃO DE EXCLUSÃO DE FICHA DO TREINADOR (PROTOCOLO 3 DIAS)
          ========================================================================= */}
      {mounted && planToRequestDeletion && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto animate-scale-up max-h-[calc(100dvh-2rem)] overflow-y-auto">
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
        </div>,
        document.body
      )}
    </>
  );
}