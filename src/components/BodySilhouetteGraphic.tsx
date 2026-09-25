"use client";

import React, { useState } from "react";
import { Droplets, Activity, Flame, Sparkles } from "lucide-react";

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
}

export default function BodySilhouetteGraphic({
  sex,
  bf,
  leanMass,
  fatMass,
  totalWeight,
}: BodySilhouetteGraphicProps) {
  // Alternar entre visualizar Proporção de Massa Magra vs Gordura OU Água Corporal (como na referência)
  const [metricView, setMetricView] = useState<"lean" | "water">("lean");

  // Percentual de Massa Magra
  const leanPercent = Math.max(5, Math.min(95, 100 - bf));

  // Água Corporal Total (Fórmula de Watson: ~73.2% da massa magra é água)
  const waterKg = parseFloat((leanMass * 0.732).toFixed(1));
  const waterPercent =
    totalWeight > 0
      ? Math.max(
          30,
          Math.min(85, parseFloat(((waterKg / totalWeight) * 100).toFixed(1)))
        )
      : 60;

  // Percentual ativo para a altura do líquido
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

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-5">
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
            Preenchimento biológico interativo baseado nos seus cálculos.
          </p>
        </div>

        {/* Alternador de Modo: Massa Magra vs Água Corporal */}
        <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetricView("lean")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
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

      {/* Conteúdo Central: Silhueta Dinâmica e Indicador Circular (Estilo da Imagem Exemplo) */}
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
        <div className="space-y-5">
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
        </div>
      </div>
    </div>
  );
}
