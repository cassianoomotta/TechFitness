"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  Calendar,
  Activity,
  Flame,
} from "lucide-react";

export interface BodyMetricItem {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number | null;
  chest?: number | null;
  waist?: number | null;
  armLeft?: number | null;
  armRight?: number | null;
  thighLeft?: number | null;
  thighRight?: number | null;
  calfLeft?: number | null;
  calfRight?: number | null;
}

export type MetricType =
  | "weight"
  | "bodyFat"
  | "waist"
  | "chest"
  | "armRight"
  | "thighRight";

interface MetricConfig {
  key: MetricType;
  label: string;
  unit: string;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  icon: typeof Scale;
}

const METRIC_CONFIGS: Record<MetricType, MetricConfig> = {
  weight: {
    key: "weight",
    label: "Peso Corporal",
    unit: "kg",
    color: "#2563EB", // Azul TechFitness
    gradientStart: "rgba(37, 99, 235, 0.35)",
    gradientEnd: "rgba(37, 99, 235, 0.0)",
    icon: Scale,
  },
  bodyFat: {
    key: "bodyFat",
    label: "Gordura (BF)",
    unit: "%",
    color: "#F59E0B", // Âmbar
    gradientStart: "rgba(245, 158, 11, 0.35)",
    gradientEnd: "rgba(245, 158, 11, 0.0)",
    icon: Flame,
  },
  waist: {
    key: "waist",
    label: "Cintura",
    unit: "cm",
    color: "#10B981", // Esmeralda
    gradientStart: "rgba(16, 185, 129, 0.35)",
    gradientEnd: "rgba(16, 185, 129, 0.0)",
    icon: Activity,
  },
  chest: {
    key: "chest",
    label: "Peitoral",
    unit: "cm",
    color: "#00C2FF", // Ciano TechFitness
    gradientStart: "rgba(0, 194, 255, 0.35)",
    gradientEnd: "rgba(0, 194, 255, 0.0)",
    icon: Activity,
  },
  armRight: {
    key: "armRight",
    label: "Braço",
    unit: "cm",
    color: "#8B5CF6", // Violeta
    gradientStart: "rgba(139, 92, 246, 0.35)",
    gradientEnd: "rgba(139, 92, 246, 0.0)",
    icon: Activity,
  },
  thighRight: {
    key: "thighRight",
    label: "Coxa",
    unit: "cm",
    color: "#EC4899", // Rosa
    gradientStart: "rgba(236, 72, 153, 0.35)",
    gradientEnd: "rgba(236, 72, 153, 0.0)",
    icon: Activity,
  },
};

interface BodyMetricsChartProps {
  measurements: BodyMetricItem[];
  weightGoal?: string; // "EMAGRECER" | "GANHAR_MASSA" | etc.
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function BodyMetricsChart({
  measurements,
  weightGoal = "EMAGRECER",
  title = "Curva de Evolução & Monitoramento",
  subtitle = "Acompanhamento visual de peso e métricas biométricas ao longo do tempo.",
  compact = false,
}: BodyMetricsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("weight");
  const [timeRange, setTimeRange] = useState<"all" | "90d" | "30d">("all");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // 1. Identificar quais métricas possuem pelo menos 1 registro preenchido
  const availableMetrics = useMemo(() => {
    const list: MetricType[] = ["weight"];
    const hasBf = measurements.some((m) => m.bodyFat !== null && m.bodyFat !== undefined && m.bodyFat > 0);
    if (hasBf) list.push("bodyFat");

    const hasWaist = measurements.some((m) => m.waist !== null && m.waist !== undefined && m.waist > 0);
    if (hasWaist) list.push("waist");

    const hasChest = measurements.some((m) => m.chest !== null && m.chest !== undefined && m.chest > 0);
    if (hasChest) list.push("chest");

    const hasArm = measurements.some((m) => m.armRight !== null && m.armRight !== undefined && m.armRight > 0);
    if (hasArm) list.push("armRight");

    const hasThigh = measurements.some((m) => m.thighRight !== null && m.thighRight !== undefined && m.thighRight > 0);
    if (hasThigh) list.push("thighRight");

    return list;
  }, [measurements]);

  // Se a métrica atualmente selecionada não existir nos dados, volta para peso
  const activeMetric = availableMetrics.includes(selectedMetric) ? selectedMetric : "weight";
  const config = METRIC_CONFIGS[activeMetric];

  // 2. Filtrar e ordenar dados cronologicamente (do mais antigo para o mais recente)
  const filteredData = useMemo(() => {
    if (!measurements || measurements.length === 0) return [];

    const now = new Date().getTime();
    let cutoff = 0;
    if (timeRange === "30d") cutoff = now - 30 * 24 * 60 * 60 * 1000;
    if (timeRange === "90d") cutoff = now - 90 * 24 * 60 * 60 * 1000;

    return [...measurements]
      .filter((m) => {
        const val = m[activeMetric];
        const hasValidValue = typeof val === "number" && !isNaN(val) && val > 0;
        if (!hasValidValue) return false;
        if (cutoff > 0) {
          const itemTime = new Date(m.date).getTime();
          return itemTime >= cutoff;
        }
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [measurements, activeMetric, timeRange]);

  // 3. Cálculos de Estatísticas (KPIs)
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return { firstVal: 0, latestVal: 0, delta: 0, minVal: 0, maxVal: 0, isSuccess: false };
    }

    const firstVal = Number(filteredData[0][activeMetric]) || 0;
    const latestVal = Number(filteredData[filteredData.length - 1][activeMetric]) || 0;
    const delta = latestVal - firstVal;

    const values = filteredData.map((d) => Number(d[activeMetric]) || 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Avaliação de sucesso baseada na meta
    let isSuccess = false;
    if (activeMetric === "weight") {
      isSuccess = weightGoal === "GANHAR_MASSA" ? delta > 0 : delta < 0;
    } else if (activeMetric === "bodyFat" || activeMetric === "waist") {
      isSuccess = delta <= 0; // Redução de BF e cintura é positivo na maioria dos casos
    } else {
      isSuccess = delta >= 0; // Ganho de braço/peitoral é hipertrofia
    }

    return { firstVal, latestVal, delta, minVal, maxVal, isSuccess };
  }, [filteredData, activeMetric, weightGoal]);

  // 4. Geometria SVG para o Gráfico
  const viewBoxWidth = 800;
  const viewBoxHeight = compact ? 220 : 280;
  const paddingX = 45;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartPoints = useMemo(() => {
    if (filteredData.length === 0) return [];

    const values = filteredData.map((d) => Number(d[activeMetric]) || 0);
    let min = Math.min(...values);
    let max = Math.max(...values);

    // Evitar divisão por zero se todos os valores forem iguais
    if (min === max) {
      min -= 2;
      max += 2;
    } else {
      // 12% de respiro no topo e na base
      const span = max - min;
      min -= span * 0.12;
      max += span * 0.12;
    }

    const usableWidth = viewBoxWidth - paddingX * 2;
    const usableHeight = viewBoxHeight - paddingTop - paddingBottom;

    return filteredData.map((d, index) => {
      const val = Number(d[activeMetric]) || 0;
      const x =
        filteredData.length === 1
          ? viewBoxWidth / 2
          : paddingX + (index / (filteredData.length - 1)) * usableWidth;

      const y = paddingTop + (1 - (val - min) / (max - min)) * usableHeight;

      return {
        x,
        y,
        val,
        date: d.date,
        raw: d,
      };
    });
  }, [filteredData, activeMetric, viewBoxWidth, viewBoxHeight, paddingX, paddingTop, paddingBottom]);

  // Gerador de Curva de Bézier Cúbica suave
  const { linePath, areaPath } = useMemo(() => {
    if (chartPoints.length === 0) return { linePath: "", areaPath: "" };
    if (chartPoints.length === 1) {
      return {
        linePath: `M ${chartPoints[0].x} ${chartPoints[0].y}`,
        areaPath: "",
      };
    }

    let d = `M ${chartPoints[0].x} ${chartPoints[0].y}`;

    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p0 = chartPoints[i === 0 ? 0 : i - 1];
      const p1 = chartPoints[i];
      const p2 = chartPoints[i + 1];
      const p3 = chartPoints[i + 2 < chartPoints.length ? i + 2 : i + 1];

      // Tensão da curva suave (Catmull-Rom para Bézier Cúbica)
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }

    const lastX = chartPoints[chartPoints.length - 1].x;
    const firstX = chartPoints[0].x;
    const groundY = viewBoxHeight - paddingBottom;

    const area = `${d} L ${lastX} ${groundY} L ${firstX} ${groundY} Z`;

    return { linePath: d, areaPath: area };
  }, [chartPoints, viewBoxHeight, paddingBottom]);

  // Manipulador de Toque e Mouse para Tooltip Interativo
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || chartPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = viewBoxWidth / rect.width;
    const svgX = clientX * scaleX;

    // Encontrar ponto com menor distância horizontal
    let closestIndex = 0;
    let minDistance = Infinity;

    chartPoints.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    setHoveredPointIndex(closestIndex);
  };

  const handlePointerLeave = () => {
    setHoveredPointIndex(null);
  };

  const activePoint =
    hoveredPointIndex !== null && chartPoints[hoveredPointIndex]
      ? chartPoints[hoveredPointIndex]
      : chartPoints[chartPoints.length - 1] || null;

  // Cálculo da variação em relação ao ponto anterior
  const previousPoint =
    hoveredPointIndex !== null && hoveredPointIndex > 0
      ? chartPoints[hoveredPointIndex - 1]
      : chartPoints.length > 1
      ? chartPoints[chartPoints.length - 2]
      : null;

  const pointDelta =
    activePoint && previousPoint
      ? Number((activePoint.val - previousPoint.val).toFixed(1))
      : 0;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-[#E2E8F0] shadow-sm space-y-5 bg-white transition-all">
      {/* Top Header: Título, Filtro de Período e Seletor de Métrica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg text-white shadow-xs"
              style={{ backgroundColor: config.color }}
            >
              <config.icon className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-sm sm:text-base text-[#0F172A] tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5">{subtitle}</p>
        </div>

        {/* Filtros de Período */}
        {filteredData.length > 2 && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            {(
              [
                { id: "all", label: "Tudo" },
                { id: "90d", label: "90 dias" },
                { id: "30d", label: "30 dias" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  timeRange === t.id
                    ? "bg-white text-[#2563EB] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Seletor de Métricas Disponíveis (Abas Dinâmicas) */}
      {availableMetrics.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {availableMetrics.map((key) => {
            const mConfig = METRIC_CONFIGS[key];
            const isSelected = activeMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMetric(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: mConfig.color }}
                />
                <span>{mConfig.label}</span>
                <span className="text-[10px] opacity-60">({mConfig.unit})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Cards de Resumo & KPIs Instantâneos */}
      {filteredData.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Card 1: Ponto de Partida */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Início
            </span>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-black font-mono text-[#0F172A] leading-tight">
                {stats.firstVal}
                <span className="text-xs font-semibold text-[#64748B] ml-0.5">
                  {config.unit}
                </span>
              </span>
              <p className="text-[10px] text-[#94A3B8] font-medium truncate mt-0.5">
                {new Date(filteredData[0]?.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
            </div>
          </div>

          {/* Card 2: Atual / Mais Recente */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#2563EB]" /> Atual
            </span>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-black font-mono text-[#2563EB] leading-tight">
                {stats.latestVal}
                <span className="text-xs font-semibold text-[#64748B] ml-0.5">
                  {config.unit}
                </span>
              </span>
              <p className="text-[10px] text-[#94A3B8] font-medium truncate mt-0.5">
                {new Date(
                  filteredData[filteredData.length - 1]?.date
                ).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
            </div>
          </div>

          {/* Card 3: Variação Total (Delta) */}
          <div
            className={`p-3 rounded-xl border flex flex-col justify-between ${
              stats.delta === 0
                ? "bg-slate-50 border-slate-200/80 text-slate-600"
                : stats.isSuccess
                ? "bg-emerald-50/70 border-emerald-200/70 text-emerald-700"
                : "bg-amber-50/70 border-amber-200/70 text-amber-700"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              {stats.delta > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : stats.delta < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              Variação Total
            </span>
            <div className="mt-1">
              <span className="text-base sm:text-lg font-black font-mono leading-tight">
                {stats.delta > 0 ? `+${stats.delta.toFixed(1)}` : stats.delta.toFixed(1)}
                <span className="text-xs font-semibold ml-0.5">{config.unit}</span>
              </span>
              <p className="text-[10px] font-bold truncate mt-0.5">
                {stats.delta === 0
                  ? "Estável"
                  : stats.isSuccess
                  ? "Na direção da meta ⚡"
                  : "Ajuste na rotina"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Área do Gráfico SVG Vetorial */}
      {filteredData.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
            <Scale className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-[#0F172A]">
            Nenhum registro para {config.label.toLowerCase()}
          </p>
          <p className="text-[11px] text-[#94A3B8] max-w-sm mx-auto">
            Realize sua primeira pesagem ou medição no formulário para desbloquear o gráfico evolutivo.
          </p>
        </div>
      ) : filteredData.length === 1 ? (
        /* Estado Parcial com 1 Ponto de Dados */
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold">
            <Activity className="w-3.5 h-3.5" /> Ponto Inicial Registrado
          </div>
          <div className="text-2xl font-black font-mono text-[#0F172A]">
            {chartPoints[0].val} {config.unit}
          </div>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Ótimo começo! Registre ao menos mais uma pesagem nos próximos dias para gerar a curva e traçar seu ritmo de evolução.
          </p>
        </div>
      ) : (
        <div className="relative select-none">
          {/* Header Flutuante do Ponto Ativo (Tooltip Magnético Superior) */}
          {activePoint && (
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  {new Date(activePoint.date).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </span>
                {pointDelta !== 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                      (activeMetric === "weight" && weightGoal === "EMAGRECER" && pointDelta < 0) ||
                      (activeMetric === "weight" && weightGoal === "GANHAR_MASSA" && pointDelta > 0) ||
                      (activeMetric !== "weight" && pointDelta > 0)
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {pointDelta > 0 ? `+${pointDelta}` : pointDelta} {config.unit} vs anterior
                  </span>
                )}
              </div>
              <div className="text-sm font-black font-mono text-[#0F172A]">
                {activePoint.val} {config.unit}
              </div>
            </div>
          )}

          {/* Canvas SVG */}
          <div className="w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-50/60 to-transparent p-1 border border-slate-100">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              className="w-full h-auto cursor-crosshair touch-none"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              <defs>
                {/* Gradiente Sob a Curva */}
                <linearGradient id={`grad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={config.gradientStart} />
                  <stop offset="100%" stopColor={config.gradientEnd} />
                </linearGradient>

                {/* Sombra da Linha */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow
                    dx="0"
                    dy="3"
                    stdDeviation="3"
                    floodColor={config.color}
                    floodOpacity="0.25"
                  />
                </filter>
              </defs>

              {/* Linhas de Grade de Fundo (Horizontal Reference Lines) */}
              {[0.25, 0.5, 0.75].map((fraction) => {
                const y = paddingTop + fraction * (viewBoxHeight - paddingTop - paddingBottom);
                return (
                  <line
                    key={fraction}
                    x1={paddingX}
                    y1={y}
                    x2={viewBoxWidth - paddingX}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Área Colorida Sob a Curva */}
              {areaPath && (
                <path d={areaPath} fill={`url(#grad-${activeMetric})`} />
              )}

              {/* Linha Curva Bézier */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={config.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />
              )}

              {/* Linha Vertical Interativa (Crosshair) */}
              {activePoint && (
                <line
                  x1={activePoint.x}
                  y1={paddingTop}
                  x2={activePoint.x}
                  y2={viewBoxHeight - paddingBottom}
                  stroke={config.color}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
              )}

              {/* Pontos de Dados */}
              {chartPoints.map((pt, idx) => {
                const isActive = hoveredPointIndex === idx;
                return (
                  <g key={idx}>
                    {/* Anel de destaque no hover/touch */}
                    {isActive && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="8"
                        fill={config.color}
                        opacity="0.25"
                        className="animate-ping"
                      />
                    )}
                    {/* Ponto Principal */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? "6" : "4"}
                      fill="#FFFFFF"
                      stroke={config.color}
                      strokeWidth={isActive ? "3" : "2.5"}
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}

              {/* Rótulos de Data no Eixo X (Apenas primeiro, intermediário e último) */}
              {chartPoints.length > 0 && (
                <>
                  <text
                    x={chartPoints[0].x}
                    y={viewBoxHeight - 12}
                    textAnchor="start"
                    fontSize="11"
                    fontWeight="600"
                    fill="#94A3B8"
                    fontFamily="monospace"
                  >
                    {new Date(chartPoints[0].date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </text>

                  {chartPoints.length > 2 && (
                    <text
                      x={chartPoints[Math.floor(chartPoints.length / 2)].x}
                      y={viewBoxHeight - 12}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="#94A3B8"
                      fontFamily="monospace"
                    >
                      {new Date(
                        chartPoints[Math.floor(chartPoints.length / 2)].date
                      ).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </text>
                  )}

                  <text
                    x={chartPoints[chartPoints.length - 1].x}
                    y={viewBoxHeight - 12}
                    textAnchor="end"
                    fontSize="11"
                    fontWeight="600"
                    fill="#94A3B8"
                    fontFamily="monospace"
                  >
                    {new Date(chartPoints[chartPoints.length - 1].date).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "short",
                      }
                    )}
                  </text>
                </>
              )}
            </svg>
          </div>

          <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
            💡 Dica: Arraste o dedo ou passe o mouse sobre a linha para inspecionar cada pesagem
          </p>
        </div>
      )}
    </div>
  );
}
