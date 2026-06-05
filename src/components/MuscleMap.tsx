"use client";

import React from "react";

interface MuscleMapProps {
  muscleGroup: string;
  className?: string;
  size?: number; // Altura padrão do mapa em pixels
}

export default function MuscleMap({ muscleGroup, className = "", size = 200 }: MuscleMapProps) {
  // Normalizar grupo muscular
  const group = muscleGroup ? muscleGroup.toUpperCase().trim() : "";

  // Helper para verificar se um grupo muscular deve ser destacado
  const isHighlighted = (muscles: string[]) => {
    return muscles.some(m => group.includes(m) || m.includes(group));
  };

  // Mapeamento preciso de grupos de músculos
  const highlightChest = isHighlighted(["PEITO", "CHEST", "PEITORAL"]);
  const highlightUpperBack = isHighlighted(["TRAPÉZIO", "TRAPEZIO", "COSTAS SUPERIOR", "UPPER BACK", "TRAP", "TRAPS"]);
  const highlightLats = isHighlighted(["DORSAIS", "LAT", "LATS", "COSTAS", "MID BACK"]);
  const highlightLombar = isHighlighted(["LOMBAR", "LOWER BACK"]);
  const highlightShoulders = isHighlighted(["OMBROS", "SHOULDERS", "DELTOIDE", "DELTS", "DELT"]);
  const highlightBiceps = isHighlighted(["BÍCEPS", "BICEPS"]);
  const highlightTriceps = isHighlighted(["TRÍCEPS", "TRICEPS"]);
  const highlightForearms = isHighlighted(["ANTEBRAÇO", "ANTEBRACOS", "FOREARMS", "ANTEBRAÇOS"]);
  const highlightAbs = isHighlighted(["CORE", "ABS", "ABDÔMEN", "ABDOMEN", "OBLÍQUOS", "OBLIQUOS"]);
  const highlightGlutes = isHighlighted(["GLÚTEO", "GLÚTEOS", "GLUTE", "GLUTES", "BUMBUM"]);
  const highlightQuadriceps = isHighlighted(["QUADRÍCEPS", "QUADRICEPS", "PERNAS", "LEGS", "COXA", "ANTERIOR COXA", "QUAD"]);
  const highlightHamstrings = isHighlighted(["POSTERIOR", "POSTERIOR COXA", "ISQUIOTIBIAIS", "HAMSTRINGS"]);
  const highlightCalves = isHighlighted(["PANTURRILHA", "PANTURRILHAS", "CALF", "CALVES"]);
  const highlightCardio = isHighlighted(["CARDIO", "AQUECIMENTO", "MOBILIDADE", "WARMUP"]);

  // Cores Tailwind Dinâmicas baseadas na TechFitness (Azul Vibrante)
  const getFillClass = (highlight: boolean) => {
    if (highlightCardio) {
      return "fill-blue-400 dark:fill-blue-500/80 stroke-blue-600 dark:stroke-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.3)] transition-all duration-500";
    }
    return highlight
      ? "fill-[#2563EB] dark:fill-[#3B82F6] stroke-[#1D4ED8] dark:stroke-[#60A5FA] drop-shadow-[0_0_8px_rgba(37,99,235,0.6)] transition-all duration-500"
      : "fill-slate-200 dark:fill-zinc-800 stroke-slate-350 dark:stroke-zinc-700 transition-all duration-300";
  };

  const neutroClass = "fill-slate-100 dark:fill-zinc-900 stroke-slate-300 dark:stroke-zinc-800 transition-all duration-300";

  return (
    <div className={`flex items-center justify-center gap-8 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-900 shadow-inner ${className}`} style={{ height: size + 40 }}>
      {/* Silhueta Frente */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Frente</span>
        <svg
          viewBox="0 0 100 240"
          className="overflow-visible"
          style={{ height: size, width: size / 2.2 }}
        >
          {/* Cabeça */}
          <ellipse cx="50" cy="18" rx="8" ry="11" className={neutroClass} />
          
          {/* Pescoço */}
          <polygon points="46,28 54,28 53,35 47,35" className={neutroClass} />

          {/* Ombros (Deltoides) */}
          <path d="M 35,35 C 31,37 28,41 28,50 C 28,52 30,52 32,50 C 33,46 34,42 35,35 Z" className={getFillClass(highlightShoulders)} />
          <path d="M 65,35 C 69,37 72,41 72,50 C 72,52 70,52 68,50 C 67,46 66,42 65,35 Z" className={getFillClass(highlightShoulders)} />

          {/* Peito (Peitorais) */}
          <path d="M 50,35 L 35,38 C 34,47 34,55 37,61 C 42,60 46,58 50,55 Z" className={getFillClass(highlightChest)} />
          <path d="M 50,35 L 65,38 C 66,47 66,55 63,61 C 58,60 54,58 50,55 Z" className={getFillClass(highlightChest)} />

          {/* Braços (Bíceps na Frente) */}
          <path d="M 32,50 C 29,56 28,68 29,82 C 31,84 34,84 35,82 C 35,70 34,58 32,50 Z" className={getFillClass(highlightBiceps)} />
          <path d="M 68,50 C 71,56 72,68 71,82 C 69,84 66,84 65,82 C 65,70 66,58 68,50 Z" className={getFillClass(highlightBiceps)} />

          {/* Antebraços */}
          <path d="M 29,82 L 24,112 C 26,114 27,114 28,112 L 35,82 Z" className={getFillClass(highlightForearms)} />
          <path d="M 71,82 L 76,112 C 74,114 73,114 72,112 L 65,82 Z" className={getFillClass(highlightForearms)} />

          {/* Mãos */}
          <path d="M 24,112 C 22,118 23,122 25,122 C 27,120 28,114 28,112 Z" className={neutroClass} />
          <path d="M 76,112 C 78,118 77,122 75,122 C 73,120 72,114 72,112 Z" className={neutroClass} />

          {/* Core (Abdômen / Oblíquos) */}
          <path d="M 37,61 C 42,60 46,58 50,55 C 54,58 58,60 63,61 L 61,96 L 39,96 Z" className={getFillClass(highlightAbs)} />

          {/* Cintura / Pélvis */}
          <path d="M 39,96 L 61,96 L 58,110 L 42,110 Z" className={neutroClass} />

          {/* Pernas (Quadríceps - Coxa Frontal) */}
          <path d="M 42,110 L 32,165 C 36,168 42,168 46,165 L 50,110 Z" className={getFillClass(highlightQuadriceps)} />
          <path d="M 58,110 L 68,165 C 64,168 58,168 54,165 L 50,110 Z" className={getFillClass(highlightQuadriceps)} />

          {/* Joelhos */}
          <ellipse cx="39" cy="168" rx="5" ry="4" className={neutroClass} />
          <ellipse cx="61" cy="168" rx="5" ry="4" className={neutroClass} />

          {/* Canela / Gêmeo Frontal (Panturrilhas frontais) */}
          <path d="M 35,172 L 32,225 L 42,225 L 43,172 Z" className={getFillClass(highlightCalves)} />
          <path d="M 65,172 L 68,225 L 58,225 L 57,172 Z" className={getFillClass(highlightCalves)} />

          {/* Pés */}
          <path d="M 32,225 L 28,235 C 34,237 38,237 40,235 L 42,225 Z" className={neutroClass} />
          <path d="M 68,225 L 72,235 C 66,237 62,237 60,235 L 58,225 Z" className={neutroClass} />

          {/* Linhas de Definição Muscular (Estilo Ilustração Científica) */}
          <line x1="50" y1="35" x2="50" y2="55" stroke="#94A3B8" strokeWidth="0.8" opacity="0.6" />
          <line x1="43" y1="72" x2="57" y2="72" stroke="#94A3B8" strokeWidth="0.8" opacity="0.5" />
          <line x1="42" y1="84" x2="58" y2="84" stroke="#94A3B8" strokeWidth="0.8" opacity="0.5" />
          <line x1="50" y1="55" x2="50" y2="96" stroke="#94A3B8" strokeWidth="0.8" opacity="0.5" />
          
          <path d="M 42,125 Q 40,145 42,160" stroke="#94A3B8" strokeWidth="0.8" fill="none" opacity="0.5" />
          <path d="M 58,125 Q 60,145 58,160" stroke="#94A3B8" strokeWidth="0.8" fill="none" opacity="0.5" />
        </svg>
      </div>

      {/* Silhueta Costas */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Costas</span>
        <svg
          viewBox="0 0 100 240"
          className="overflow-visible"
          style={{ height: size, width: size / 2.2 }}
        >
          {/* Cabeça */}
          <ellipse cx="50" cy="18" rx="8" ry="11" className={neutroClass} />
          
          {/* Pescoço */}
          <polygon points="46,28 54,28 53,35 47,35" className={neutroClass} />

          {/* Ombros (Deltoides Posteriores) */}
          <path d="M 35,35 C 31,37 28,41 28,50 C 28,52 30,52 32,50 C 33,46 34,42 35,35 Z" className={getFillClass(highlightShoulders)} />
          <path d="M 65,35 C 69,37 72,41 72,50 C 72,52 70,52 68,50 C 67,46 66,42 65,35 Z" className={getFillClass(highlightShoulders)} />

          {/* Costas Superior (Trapézio e Redondos) */}
          <path d="M 50,30 L 35,38 L 38,52 L 50,44 Z" className={getFillClass(highlightUpperBack)} />
          <path d="M 50,30 L 65,38 L 62,52 L 50,44 Z" className={getFillClass(highlightUpperBack)} />

          {/* Costas Médio/Inferior (Dorsal - Lats) */}
          <path d="M 38,52 L 50,44 L 62,52 L 60.5,68 L 39.5,68 Z" className={getFillClass(highlightLats)} />

          {/* Lombar (Subdividido das dorsais) */}
          <path d="M 39.5,68 L 60.5,68 L 59,82 L 41,82 Z" className={getFillClass(highlightLombar)} />

          {/* Braços (Tríceps nas Costas) */}
          <path d="M 32,50 C 29,56 28,68 29,82 C 31,84 34,84 35,82 C 35,70 34,58 32,50 Z" className={getFillClass(highlightTriceps)} />
          <path d="M 68,50 C 71,56 72,68 71,82 C 69,84 66,84 65,82 C 65,70 66,58 68,50 Z" className={getFillClass(highlightTriceps)} />

          {/* Antebraços */}
          <path d="M 29,82 L 24,112 C 26,114 27,114 28,112 L 35,82 Z" className={getFillClass(highlightForearms)} />
          <path d="M 71,82 L 76,112 C 74,114 73,114 72,112 L 65,82 Z" className={getFillClass(highlightForearms)} />

          {/* Mãos */}
          <path d="M 24,112 C 22,118 23,122 25,122 C 27,120 28,114 28,112 Z" className={neutroClass} />
          <path d="M 76,112 C 78,118 77,122 75,122 C 73,120 72,114 72,112 Z" className={neutroClass} />

          {/* Glúteos */}
          <path d="M 39,82 L 50,82 L 50,98 C 45,98 42,94 41,92 Z" className={getFillClass(highlightGlutes)} />
          <path d="M 50,82 L 59,82 L 59,92 C 58,94 55,98 50,98 Z" className={getFillClass(highlightGlutes)} />

          {/* Pernas (Posterior de Coxa - Hamstrings) */}
          <path d="M 41,92 L 32,165 C 36,168 42,168 46,165 L 50,98 Z" className={getFillClass(highlightHamstrings)} />
          <path d="M 59,92 L 68,165 C 64,168 58,168 54,165 L 50,98 Z" className={getFillClass(highlightHamstrings)} />

          {/* Joelhos */}
          <ellipse cx="39" cy="168" rx="5" ry="4" className={neutroClass} />
          <ellipse cx="61" cy="168" rx="5" ry="4" className={neutroClass} />

          {/* Panturrilhas */}
          <path d="M 35,172 L 32,225 L 42,225 L 43,172 Z" className={getFillClass(highlightCalves)} />
          <path d="M 65,172 L 68,225 L 58,225 L 57,172 Z" className={getFillClass(highlightCalves)} />

          {/* Pés */}
          <path d="M 32,225 L 28,235 C 34,237 38,237 40,235 L 42,225 Z" className={neutroClass} />
          <path d="M 68,225 L 72,235 C 66,237 62,237 60,235 L 58,225 Z" className={neutroClass} />

          {/* Linhas de Definição Muscular Costas */}
          <line x1="50" y1="28" x2="50" y2="82" stroke="#94A3B8" strokeWidth="0.8" opacity="0.6" />
          <line x1="50" y1="82" x2="50" y2="98" stroke="#94A3B8" strokeWidth="0.8" opacity="0.6" />
          <path d="M 37,185 Q 37,205 36,215" stroke="#94A3B8" strokeWidth="0.8" fill="none" opacity="0.5" />
          <path d="M 63,185 Q 63,205 64,215" stroke="#94A3B8" strokeWidth="0.8" fill="none" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
