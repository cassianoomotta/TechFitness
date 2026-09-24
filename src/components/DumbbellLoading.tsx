import React, { useId } from "react";
import { Dumbbell } from "lucide-react";

export interface DumbbellLoadingProps {
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function DumbbellLoading({
  text = "Carregando...",
  subtext,
  fullScreen = false,
  size = "md",
  className = "",
}: DumbbellLoadingProps) {
  const rawId = useId();
  // Sanitiza o ID para uso seguro em atributos SVG
  const gradientId = `tf-dumbbell-gradient-${rawId.replace(/:/g, "")}`;

  const sizeConfig = {
    sm: {
      ring: "w-12 h-12",
      box: "w-6 h-6 rounded-lg",
      icon: "w-3 h-3",
      text: "text-xs font-bold",
    },
    md: {
      ring: "w-16 h-16",
      box: "w-8 h-8 rounded-xl",
      icon: "w-4 h-4",
      text: "text-sm font-bold",
    },
    lg: {
      ring: "w-20 h-20",
      box: "w-10 h-10 rounded-2xl",
      icon: "w-5 h-5",
      text: "text-base font-extrabold",
    },
  }[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in ${
        fullScreen ? "min-h-[60vh] flex-1 w-full" : "py-10 w-full"
      } ${className}`}
    >
      {/* Círculo visual esportivo com anel dinâmico (Progress Ring) */}
      <div className={`relative ${sizeConfig.ring} flex items-center justify-center mb-3`}>
        <svg className="w-full h-full" viewBox="0 0 72 72">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#00C2FF" />
            </linearGradient>
          </defs>
          {/* Pista de fundo translúcida */}
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="4"
            className="opacity-70"
          />
          {/* Arco que se completa continuamente */}
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="188.5"
            className="animate-ring-fill"
          />
        </svg>

        {/* Ícone esportivo de halter centralizado com micro-pulso */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${sizeConfig.box} bg-blue-50/95 text-blue-600 flex items-center justify-center shadow-xs border border-blue-100/60`}>
            <Dumbbell className={`${sizeConfig.icon} animate-pulse`} />
          </div>
        </div>
      </div>

      {/* Rótulo de status */}
      {text && (
        <p className={`${sizeConfig.text} text-slate-800 tracking-tight`}>
          {text}
        </p>
      )}

      {/* Subtexto auxiliar opcional */}
      {subtext && (
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
}
