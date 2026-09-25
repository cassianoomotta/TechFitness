"use client";

import React, { useState } from "react";
import { Droplets, Activity, Flame, Sparkles } from "lucide-react";

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
  const waterPercent = totalWeight > 0 ? Math.max(30, Math.min(85, parseFloat(((waterKg / totalWeight) * 100).toFixed(1)))) : 60;

  // Percentual ativo para a altura do líquido
  const activePercent = metricView === "lean" ? leanPercent : waterPercent;

  // Altura do líquido (viewBox tem altura 400; o corpo vai de y=25 até y=385 -> 360px de corpo)
  // y=385 é os pés, y=25 é o topo da cabeça
  const bodyTop = 25;
  const bodyBottom = 385;
  const bodyHeight = bodyBottom - bodyTop; // 360
  const fluidFillHeight = (activePercent / 100) * bodyHeight;
  const fluidTopY = bodyBottom - fluidFillHeight;

  // Path SVG de Silhueta Masculina (Atlética: ombros largos, torso em V)
  const malePath = `
    M 90 25
    C 77 25 71 35 71 49
    C 71 63 78 73 85 76
    L 84 84
    C 76 86 52 92 41 102
    C 35 108 30 130 28 160
    C 26 190 24 228 26 250
    C 27 258 31 262 35 258
    C 39 252 42 225 43 200
    C 45 168 47 142 49 130
    C 52 145 56 175 58 198
    C 60 216 64 225 70 234
    C 74 240 78 248 83 256
    L 77 310
    C 75 328 72 355 72 376
    C 72 384 75 388 80 388
    C 85 388 87 380 87 368
    L 88 315
    L 90 265
    L 92 315
    L 93 368
    C 93 380 95 388 100 388
    C 105 388 108 384 108 376
    C 108 355 105 328 103 310
    L 97 256
    C 102 248 106 240 110 234
    C 116 225 120 216 122 198
    C 124 175 128 145 131 130
    C 133 142 135 168 137 200
    C 138 225 141 252 145 258
    C 149 262 153 258 154 250
    C 156 228 154 190 152 160
    C 150 130 145 108 139 102
    C 128 92 104 86 96 84
    L 95 76
    C 102 73 109 63 109 49
    C 109 35 103 25 90 25
    Z
  `;

  // Path SVG de Silhueta Feminina (Harmônica: ombros delicados, cintura e quadril delineados)
  const femalePath = `
    M 90 26
    C 78 26 73 35 73 48
    C 73 59 78 69 85 73
    C 80 77 75 83 75 90
    C 75 96 80 100 84 100
    L 84 85
    C 77 87 60 93 52 102
    C 46 109 41 128 38 155
    C 35 185 33 218 35 240
    C 36 248 40 252 43 247
    C 47 240 50 218 51 195
    C 52 170 54 148 55 138
    C 56 150 58 165 60 178
    C 59 188 61 202 65 214
    C 70 226 76 235 81 245
    L 76 305
    C 74 325 73 355 73 376
    C 73 384 76 388 80 388
    C 84 388 86 382 86 370
    L 88 312
    L 90 256
    L 92 312
    L 94 370
    C 94 382 96 388 100 388
    C 104 388 107 384 107 376
    C 107 355 106 325 104 305
    L 99 245
    C 104 235 110 226 115 214
    C 119 202 121 188 120 178
    C 122 165 124 150 125 138
    C 126 148 128 170 129 195
    C 130 218 133 240 137 247
    C 140 252 144 248 145 240
    C 147 218 145 185 142 155
    C 139 128 134 109 128 102
    C 120 93 103 87 96 85
    L 96 100
    C 100 100 105 96 105 90
    C 105 83 100 77 95 73
    C 102 69 107 59 107 48
    C 107 35 102 26 90 26
    Z
  `;

  const selectedPath = sex === "male" ? malePath : femalePath;
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
          <div className="relative w-[190px] h-[390px] flex items-center justify-center">
            <svg
              viewBox="0 0 180 400"
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
                stroke="#64748B"
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="opacity-60"
              />

              {/* Conteúdo Preenchido Dentro do Corpo */}
              <g clipPath={`url(#${clipId})`}>
                {/* Fundo da Silhueta (Parte Superior Não Preenchida) */}
                <rect x="0" y="0" width="180" height="400" fill="url(#body-upper-grad)" />

                {/* Líquido Dinâmico Preenchendo de Baixo para Cima */}
                <rect
                  x="0"
                  y={fluidTopY}
                  width="180"
                  height={fluidFillHeight + 10}
                  fill={`url(#${gradId})`}
                  className="transition-all duration-700 ease-out"
                />

                {/* Linha de Onda Superior na Superfície do Líquido (Efeito Water Wave) */}
                <path
                  d={`
                    M 0 ${fluidTopY}
                    Q 45 ${fluidTopY - 4} 90 ${fluidTopY}
                    T 180 ${fluidTopY}
                    L 180 ${fluidTopY + 12}
                    L 0 ${fluidTopY + 12}
                    Z
                  `}
                  fill="#00E5FF"
                  className="opacity-90 transition-all duration-700 ease-out"
                />
              </g>

              {/* Linha Indicadora de Nível Pontilhada */}
              <line
                x1="12"
                y1={fluidTopY}
                x2="168"
                y2={fluidTopY}
                stroke="#00E5FF"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                className="opacity-80 transition-all duration-700 ease-out"
              />

              {/* Rótulo de Nível Flutuante */}
              <g className="transition-all duration-700 ease-out" transform={`translate(90, ${Math.max(40, Math.min(360, fluidTopY - 14))})`}>
                <rect
                  x="-34"
                  y="-11"
                  width="68"
                  height="20"
                  rx="10"
                  fill="#0F172A"
                  stroke="#00C2FF"
                  strokeWidth="1.2"
                  className="shadow-md"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
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
