"use client";

import React, { useState } from "react";
import {
  Droplets,
  Activity,
  Flame,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Scale,
  Apple,
  Dumbbell,
  ShieldCheck,
} from "lucide-react";

import {
  MALE_BODY_PATH,
  FEMALE_BODY_PATH,
  SILHOUETTE_VIEWBOX,
  SILHOUETTE_BODY_TOP,
  SILHOUETTE_BODY_BOTTOM,
  SILHOUETTE_BODY_HEIGHT,
} from "./bodySilhouettePaths";

interface BodySilhouetteGraphicProps {
  sex: "male" | "female";
  bf: number;
  leanMass: number;
  fatMass: number;
  totalWeight: number;
  dietGoal?: "cutting" | "maintenance" | "bulking";
  biotype?: "ecto" | "meso" | "endo";
  onGoalChange?: (goal: "cutting" | "maintenance" | "bulking") => void;
  tmb?: number;
  tdee?: number;
  targetCalories?: number;
}

export default function BodySilhouetteGraphic({
  sex,
  bf,
  leanMass,
  fatMass,
  totalWeight,
  dietGoal = "maintenance",
  biotype = "meso",
  onGoalChange,
  tmb,
  tdee,
  targetCalories,
}: BodySilhouetteGraphicProps) {
  // Alternar entre visualizar Proporção de Massa Magra vs Gordura OU Água Corporal
  const [metricView, setMetricView] = useState<"lean" | "water">("lean");

  // Estado do Guia Explicativo de Ciência Corporal
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [activeGuideTab, setActiveGuideTab] = useState<"biotype" | "composition" | "intake">("intake");

  // Percentual de Massa Magra
  const leanPercent = Math.max(5, Math.min(95, 100 - bf));

  // Água Corporal Total (Fórmula de Watson: ~73.2% da massa magra é água celular)
  const waterKg = parseFloat((leanMass * 0.732).toFixed(1));
  const waterPercent =
    totalWeight > 0
      ? Math.max(
          30,
          Math.min(85, parseFloat(((waterKg / totalWeight) * 100).toFixed(1)))
        )
      : 60;

  // Consumo Hídrico Diário Calculado por Objetivo (em Litros e Copos de 250ml)
  const waterCuttingL = parseFloat((totalWeight * 0.042).toFixed(1));
  const waterCuttingGlasses = Math.round((totalWeight * 42) / 250);

  const waterMaintenanceL = parseFloat((totalWeight * 0.038).toFixed(1));
  const waterMaintenanceGlasses = Math.round((totalWeight * 38) / 250);

  const waterBulkingL = parseFloat((totalWeight * 0.048).toFixed(1));
  const waterBulkingGlasses = Math.round((totalWeight * 48) / 250);

  // Percentual ativo para a altura do líquido na silhueta
  const activePercent = metricView === "lean" ? leanPercent : waterPercent;

  // Dimensões exatas da silhueta anatômica proporcional
  const bodyTop = SILHOUETTE_BODY_TOP;
  const bodyBottom = SILHOUETTE_BODY_BOTTOM;
  const bodyHeight = SILHOUETTE_BODY_HEIGHT;
  const fluidFillHeight = (activePercent / 100) * bodyHeight;
  const fluidTopY = bodyBottom - fluidFillHeight;

  const selectedPath = sex === "male" ? MALE_BODY_PATH : FEMALE_BODY_PATH;
  const clipId = `body-clip-${sex}`;
  const gradId = `body-fluid-grad-${sex}`;

  // Nome formatado do biotipo
  const biotypeNames: Record<"ecto" | "meso" | "endo", { title: string; subtitle: string }> = {
    ecto: { title: "Ectomorfo", subtitle: "Metabolismo acelerado e estrutura esguia" },
    meso: { title: "Mesomorfo", subtitle: "Metabolismo equilibrado e boa resposta muscular" },
    endo: { title: "Endomorfo", subtitle: "Metabolismo eficiente e facilidade em estocar energia" },
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-6">
      {/* Barra de Título e Alternador de Visão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Activity className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-extrabold tracking-tight text-white">
              Visualização Corporal Dinâmica ({sex === "male" ? "Masculina" : "Feminina"})
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Preenchimento biológico interativo baseado nas suas medidas corporais.
          </p>
        </div>

        {/* Alternador de Modo: Massa Magra vs Água Corporal */}
        <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetricView("lean")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
              metricView === "lean"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Massa Magra ({leanPercent.toFixed(0)}%)</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricView("water")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
              metricView === "water"
                ? "bg-cyan-500 text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Água Corporal ({waterPercent.toFixed(0)}%)</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Central: Silhueta Dinâmica e Indicador Circular */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Lado Esquerdo: Desenho da Silhueta Humana com Nível Líquido Dinâmico */}
        <div className="relative flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-2xl border border-slate-800/60">
          <div className="relative w-[190px] sm:w-[210px] h-[440px] sm:h-[480px] flex items-center justify-center">
            <svg
              viewBox={SILHOUETTE_VIEWBOX}
              className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,194,255,0.15)]"
            >
              <defs>
                {/* Máscara com o formato do corpo */}
                <clipPath id={clipId}>
                  <path d={selectedPath} fill="#fff" />
                </clipPath>

                {/* Gradiente de Água / Massa Magra */}
                <linearGradient id={gradId} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#1E40AF" />
                  <stop offset="50%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#00C2FF" />
                </linearGradient>

                {/* Gradiente Suave da Área Superior */}
                <linearGradient id="body-upper-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(241, 245, 249, 0.25)" />
                  <stop offset="100%" stopColor="rgba(241, 245, 249, 0.12)" />
                </linearGradient>
              </defs>

              {/* Contorno Exterior do Corpo (Base Cinza Suave) */}
              <path
                d={selectedPath}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="opacity-70"
              />

              {/* Conteúdo Preenchido Dentro do Corpo */}
              <g clipPath={`url(#${clipId})`}>
                {/* Fundo da Silhueta (Parte Superior Não Preenchida) */}
                <rect x="0" y="0" width="200" height="560" fill="url(#body-upper-grad)" />

                {/* Líquido Dinâmico Preenchendo de Baixo para Cima */}
                <rect
                  x="0"
                  y={fluidTopY}
                  width="200"
                  height={fluidFillHeight + 30}
                  fill={`url(#${gradId})`}
                  className="transition-all duration-700 ease-out"
                />

                {/* Linha de Onda Superior na Superfície do Líquido (Efeito Water Wave) */}
                <path
                  d={`
                    M 0 ${fluidTopY}
                    Q 50 ${fluidTopY - 5} 100 ${fluidTopY}
                    T 200 ${fluidTopY}
                    L 200 ${fluidTopY + 16}
                    L 0 ${fluidTopY + 16}
                    Z
                  `}
                  fill="#00E5FF"
                  className="opacity-90 transition-all duration-700 ease-out"
                />
              </g>

              {/* Linha Indicadora de Nível Pontilhada */}
              <line
                x1="6"
                y1={fluidTopY}
                x2="194"
                y2={fluidTopY}
                stroke="#00E5FF"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-80 transition-all duration-700 ease-out"
              />

              {/* Rótulo de Nível Flutuante */}
              <g
                className="transition-all duration-700 ease-out"
                transform={`translate(100, ${Math.max(35, Math.min(525, fluidTopY - 14))})`}
              >
                <rect
                  x="-34"
                  y="-12"
                  width="68"
                  height="22"
                  rx="11"
                  fill="#0B132B"
                  stroke="#00C2FF"
                  strokeWidth="1.4"
                  className="shadow-lg"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {activePercent.toFixed(0)}%
                </text>
              </g>
            </svg>
          </div>

          <span className="text-[10px] text-slate-400 font-medium mt-1">
            Silhueta {sex === "male" ? "Masculina" : "Feminina"} em proporção real
          </span>
        </div>

        {/* Lado Direito: Gráfico Circular e Detalhamento da Composição */}
        <div className="space-y-4">
          {/* Gráfico Circular Estilo da Imagem Referência */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
            {/* Gráfico Donut SVG */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                {/* Trilha inativa (Fundo claro/gordura) */}
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="10"
                />
                {/* Arco ativo */}
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="url(#pie-grad)"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 30}
                  strokeDashoffset={(2 * Math.PI * 30) * (1 - activePercent / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="pie-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C2FF" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-cyan-400 font-mono leading-none">
                  {activePercent.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Texto Explicativo ao Lado do Donut */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {metricView === "lean" ? "Proporção de Massa Magra" : "Água Corporal Estimada"}
              </span>
              <div className="text-xl font-extrabold text-white">
                {metricView === "lean" ? `${leanMass} kg` : `${waterKg} Litros`}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {metricView === "lean"
                  ? `Corresponde a ${leanPercent.toFixed(1)}% do seu corpo livre de gordura.`
                  : `A água celular compõe cerca de ${waterPercent.toFixed(1)}% do seu peso total.`}
              </p>
            </div>
          </div>

          {/* Cartões Comparativos de Composição Corporal */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Massa Magra</span>
              </div>
              <div className="text-lg font-black text-white font-mono">
                {leanMass} kg
              </div>
              <div className="text-[10px] text-slate-400">
                {(100 - bf).toFixed(1)}% do corpo
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Gordura Corporal</span>
              </div>
              <div className="text-lg font-black text-white font-mono">
                {fatMass} kg
              </div>
              <div className="text-[10px] text-slate-400">
                {bf.toFixed(1)}% do corpo
              </div>
            </div>
          </div>

          {/* Consumo Diário de Água Recomendado (por Objetivo) — Clicável e Interativo */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <Droplets className="w-3.5 h-3.5" />
                <span>Consumo Hídrico Diário Recomendado</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Toque para selecionar</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onGoalChange && onGoalChange("cutting")}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[48px] ${
                  dietGoal === "cutting"
                    ? "bg-rose-950/60 border-rose-500 text-rose-300 ring-2 ring-rose-500/40 shadow-sm"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[10px] font-bold block text-slate-300">Emagrecimento</span>
                  {dietGoal === "cutting" && <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>}
                </div>
                <span className="text-sm font-extrabold font-mono text-white block mt-0.5">
                  {waterCuttingL} L
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  ~{waterCuttingGlasses} copos
                </span>
              </button>

              <button
                type="button"
                onClick={() => onGoalChange && onGoalChange("maintenance")}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[48px] ${
                  dietGoal === "maintenance"
                    ? "bg-blue-950/60 border-blue-500 text-blue-300 ring-2 ring-blue-500/40 shadow-sm"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[10px] font-bold block text-slate-300">Manutenção</span>
                  {dietGoal === "maintenance" && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                </div>
                <span className="text-sm font-extrabold font-mono text-white block mt-0.5">
                  {waterMaintenanceL} L
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  ~{waterMaintenanceGlasses} copos
                </span>
              </button>

              <button
                type="button"
                onClick={() => onGoalChange && onGoalChange("bulking")}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[48px] ${
                  dietGoal === "bulking"
                    ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 shadow-sm"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[10px] font-bold block text-slate-300">Hipertrofia</span>
                  {dietGoal === "bulking" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                </div>
                <span className="text-sm font-extrabold font-mono text-white block mt-0.5">
                  {waterBulkingL} L
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  ~{waterBulkingGlasses} copos
                </span>
              </button>
            </div>

            {/* Micro-explicação dinâmica conforme a meta selecionada */}
            <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
              {dietGoal === "cutting" && (
                <span>
                  🔥 <strong>Meta Ativa (Emagrecimento • 42 ml/kg):</strong> Ingerir {waterCuttingL} L/dia acelera a queima de gordura (lipólise), combate a retenção de líquidos e reduz o apetite nas refeições.
                </span>
              )}
              {dietGoal === "maintenance" && (
                <span>
                  ⚖️ <strong>Meta Ativa (Manutenção • 38 ml/kg):</strong> Ingerir {waterMaintenanceL} L/dia sustenta o equilíbrio metabólico, bom funcionamento renal e hidratação profunda dos tecidos.
                </span>
              )}
              {dietGoal === "bulking" && (
                <span>
                  💪 <strong>Meta Ativa (Hipertrofia • 48 ml/kg):</strong> Ingerir {waterBulkingL} L/dia é essencial para a volumização celular muscular, transporte de glicogênio e absorção de creatina.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Seção Disruptiva UX: Guia Explicativo dos Resultados e Consumo Recomendado */}
      <div className="border border-slate-800 rounded-2xl bg-slate-950/70 overflow-hidden">
        {/* Cabeçalho do Acordeão */}
        <button
          type="button"
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors cursor-pointer min-h-[48px]"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Info className="w-4 h-4" />
            </span>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                Guia Explicativo dos Resultados e Consumo Recomendado
              </h5>
              <p className="text-[11px] text-slate-400">
                Entenda a ciência por trás do seu biotipo, massa magra, água corporal e metas diárias.
              </p>
            </div>
          </div>
          <span className="text-slate-400 p-1">
            {isGuideOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        </button>

        {/* Conteúdo Expansível com Abas de Redução de Carga Cognitiva */}
        {isGuideOpen && (
          <div className="p-4 pt-1 border-t border-slate-800/80 space-y-4 animate-fade-in">
            {/* Navegação entre Abas do Guia (Touch Targets Ergonômicos) */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveGuideTab("intake")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
                  activeGuideTab === "intake"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span className="truncate">Consumo Diário</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab("biotype")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
                  activeGuideTab === "biotype"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="truncate">Biotipo e Silhueta</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab("composition")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
                  activeGuideTab === "composition"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="truncate">Massa e Água</span>
              </button>
            </div>

            {/* Aba 1: Consumo Diário Recomendado (Água, Calorias e Macros) */}
            {activeGuideTab === "intake" && (
              <div className="space-y-3 animate-fade-in">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <h6 className="text-xs font-bold text-white uppercase tracking-wider">
                      Tabela Comparativa de Consumo por Objetivo
                    </h6>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Coluna Emagrecimento */}
                    <div
                      onClick={() => onGoalChange && onGoalChange("cutting")}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        dietGoal === "cutting"
                          ? "bg-rose-950/40 border-rose-500/70 ring-1 ring-rose-500/40"
                          : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-400">Emagrecimento</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          Cutting
                        </span>
                      </div>
                      <div className="mt-2 space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Água diária:</span>
                          <strong className="text-white font-mono text-xs">{waterCuttingL} Litros</strong>
                          <span className="text-[10px] text-slate-400 block">(42 ml por kg)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Estratégia calórica:</span>
                          <span className="text-slate-200">Déficit moderado (-450 kcal)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Proteína de preservação:</span>
                          <span className="text-slate-200">2.2 g/kg (blindagem muscular)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          A água acelera a queima de gordura e reduz retenção de líquidos.
                        </p>
                      </div>
                    </div>

                    {/* Coluna Manutenção */}
                    <div
                      onClick={() => onGoalChange && onGoalChange("maintenance")}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        dietGoal === "maintenance"
                          ? "bg-blue-950/40 border-blue-500/70 ring-1 ring-blue-500/40"
                          : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400">Manutenção</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                          Equilíbrio
                        </span>
                      </div>
                      <div className="mt-2 space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Água diária:</span>
                          <strong className="text-white font-mono text-xs">{waterMaintenanceL} Litros</strong>
                          <span className="text-[10px] text-slate-400 block">(38 ml por kg)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Estratégia calórica:</span>
                          <span className="text-slate-200">Normocalórica (Gasto diário TDEE)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Proteína de manutenção:</span>
                          <span className="text-slate-200">2.0 g/kg (recomposição corporal)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          Mantém energia alta, função renal e tônus muscular estático.
                        </p>
                      </div>
                    </div>

                    {/* Coluna Hipertrofia */}
                    <div
                      onClick={() => onGoalChange && onGoalChange("bulking")}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        dietGoal === "bulking"
                          ? "bg-emerald-950/40 border-emerald-500/70 ring-1 ring-emerald-500/40"
                          : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">Hipertrofia</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          Bulking Limpo
                        </span>
                      </div>
                      <div className="mt-2 space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Água diária:</span>
                          <strong className="text-white font-mono text-xs">{waterBulkingL} Litros</strong>
                          <span className="text-[10px] text-slate-400 block">(48 ml por kg)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Estratégia calórica:</span>
                          <span className="text-slate-200">Superávit controlado (+350 kcal)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Proteína anabólica:</span>
                          <span className="text-slate-200">2.0 g/kg (síntese miofibrilar)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          O músculo é 73% água. Hidratação máxima potencia creatina e pump.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aba 2: Biotipo e Silhueta (Esclarecimento de UX e Fisiologia) */}
            {activeGuideTab === "biotype" && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <span className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div className="space-y-1.5">
                    <h6 className="text-xs font-bold text-white">
                      Por que o biotipo não altera a forma da silhueta corporal?
                    </h6>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      A silhueta corporal que você vê acima reflete <strong>fatos físicos mensuráveis</strong>: o percentual real de gordura e massa magra calculado através das suas medidas de fita métrica (cintura, pescoço, quadril) e peso.
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Já o seu <strong>Biotipo Predominante ({biotypeNames[biotype].title})</strong> atua no seu <strong>motor metabólico interno</strong>: ele ajusta a Taxa Metabólica Basal (TMB), definindo se o seu corpo queima calorias com rapidez natural (Ectomorfo), de forma equilibrada (Mesomorfo) ou se possui grande facilidade em estocar energia (Endomorfo).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-cyan-400 block">Ectomorfo</span>
                    <span className="text-slate-400 block mt-0.5">Queima calórica acelerada. Necessita de mais carboidratos para sustentar o anabolismo.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-blue-400 block">Mesomorfo</span>
                    <span className="text-slate-400 block mt-0.5">Excelente resposta muscular e queima de gordura eficiente em resposta ao treino.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-amber-400 block">Endomorfo</span>
                    <span className="text-slate-400 block mt-0.5">Metabolismo que poupa energia. Responde melhor a dietas com controle refinado de carboidratos.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Aba 3: Massa Magra e Água Corporal (Fisiologia e Cálculos) */}
            {activeGuideTab === "composition" && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  {/* Bloco Massa Magra */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Massa Magra: {leanMass} kg ({leanPercent.toFixed(1)}%)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Representa toda a massa metabolicamente ativa do seu corpo: <strong>músculos, ossos, órgãos vitais e sangue</strong>.
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Cada quilo de massa magra ganho eleva seu gasto calórico em repouso, tornando o emagrecimento mais fácil e duradouro.
                    </p>
                  </div>

                  {/* Bloco Água Corporal */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Água Corporal: {waterKg} Litros ({waterPercent.toFixed(1)}%)</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Calculada pela <strong>Fórmula Científica de Watson</strong>: cerca de <strong>73,2% de toda a sua massa magra é composta por água celular</strong>.
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      A água dentro do músculo garante força máxima, transporte de nutrientes e recuperação celular acelerada entre os treinos.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
