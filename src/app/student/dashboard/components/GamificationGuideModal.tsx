"use client";

import React, { useEffect } from "react";
import {
  X,
  Sparkles,
  Trophy,
  Target,
  Calendar,
  Zap,
  Flame,
  Dumbbell,
  Scale,
  Award,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface GamificationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GamificationGuideModal({
  isOpen,
  onClose,
}: GamificationGuideModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Como funciona a Gamificação TechFitness"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-[#151D2F] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Como Funciona a Gamificação?
              </h2>
              <p className="text-xs text-blue-100/90 font-medium">
                Regras claras, justas e pensadas para a sua evolução
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Fechar guia de gamificação"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-[#0F172A] dark:text-white">
          {/* Card de Equidade / Competição Justa */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-100/80 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center gap-2 text-[#2563EB] dark:text-blue-400">
              <Target className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-extrabold tracking-tight">
                Competição 100% Justa por Ficha de Treino
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Não importa se sua prescrição é de <strong>3 treinos</strong>,{" "}
              <strong>4 treinos</strong> (ex: A, B, C, A) ou{" "}
              <strong>5 a 6 dias na semana</strong>. A pontuação valoriza a sua{" "}
              <strong className="text-[#2563EB] dark:text-blue-400">disciplina em cumprir a sua meta</strong>
              , e não apenas o volume bruto diário.
            </p>
          </div>

          {/* Seção de Pontuação de XP */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Tabela de Pontuação de XP
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Treino da Ficha */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 shrink-0 mt-0.5">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      Treino da Ficha
                    </span>
                    <span className="text-xs font-mono font-black text-[#2563EB] dark:text-blue-400">
                      +150 XP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Por cada sessão do seu plano concluída com sucesso.
                  </p>
                </div>
              </div>

              {/* Bônus Semana Perfeita */}
              <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                  <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Semana Perfeita!
                    </span>
                    <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                      +400 XP
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700/90 dark:text-amber-200/80 mt-0.5 leading-tight">
                    Ao cumprir 100% da frequência semanal da sua ficha!
                  </p>
                </div>
              </div>

              {/* Treinos Extras */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      Treino Extra
                    </span>
                    <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                      +75 XP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Bônus por treinos adicionais além da sua meta semanal.
                  </p>
                </div>
              </div>

              {/* Quebra de Recorde (PR) */}
              <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5">
                  <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                      Novo Recorde (PR)
                    </span>
                    <span className="text-xs font-mono font-black text-purple-600 dark:text-purple-400">
                      +100 XP
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-700/90 dark:text-purple-200/80 mt-0.5 leading-tight">
                    Superou sua carga máxima em qualquer exercício.
                  </p>
                </div>
              </div>

              {/* Registro Biométrico */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-start gap-3 sm:col-span-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      Registro de Biometria
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                      +50 XP
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700/90 dark:text-emerald-200/80 mt-0.5 leading-tight">
                    Ao atualizar peso e medidas no seu acompanhamento corporal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Abas do Ranking (Ligas dos Titãs) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Períodos do Ranking
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#1E293B]/70 border border-zinc-200/70 dark:border-slate-700/80">
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  ⚡ Semana Atual
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Conta os treinos e conquistas da semana corrente (Segunda a Domingo).
                  Reinicia toda segunda-feira às 00:00 para dar chances a todos!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#1E293B]/70 border border-zinc-200/70 dark:border-slate-700/80">
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  📅 Mês Atual
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Mede a consistência acumulada no mês em curso. Ideal para premiar
                  os atletas mais dedicados do mês!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#1E293B]/70 border border-zinc-200/70 dark:border-slate-700/80">
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  🏆 Geral (All-time)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  O histórico completo da sua jornada, acumulando todo o seu XP e
                  níveis desbloqueados desde o seu primeiro dia.
                </p>
              </div>
            </div>
          </div>

          {/* Níveis e Conquistas */}
          <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 dark:border dark:border-slate-800 text-white space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Award className="w-5 h-5 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Progressão e Títulos
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              São <strong>25 níveis</strong> (de <em>Iniciante</em> até{" "}
              <em className="text-amber-300">Lenda do Olimpo</em>) e dezenas de
              conquistas nos tiers Bronze, Prata, Ouro e Diamante.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-sm min-h-[44px] flex items-center justify-center gap-2"
          >
            <span>Entendi, hora do show! ⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
}
