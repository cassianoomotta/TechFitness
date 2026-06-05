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

  // Mapeamento de grupos de músculos detalhados e específicos
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
      : "fill-slate-200 dark:fill-zinc-800 stroke-slate-300 dark:stroke-zinc-700 transition-all duration-300";
  };

  const neutroClass = "fill-slate-100 dark:fill-zinc-900 stroke-slate-250 dark:stroke-zinc-850 transition-all duration-300";

  return (
    <div className={`flex items-center justify-center gap-8 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-900 shadow-inner ${className}`} style={{ height: size + 40 }}>
      {/* Silhueta Frente */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Frente</span>
        <svg
          viewBox="0 0 100 220"
          className="overflow-visible"
          style={{ height: size, width: size / 2.2 }}
        >
          {/* Cabeça */}
          <ellipse cx="50" cy="15" rx="8" ry="10" className={neutroClass} />
          
          {/* Pescoço */}
          <polygon points="47,25 53,25 52,31 48,31" className={neutroClass} />

          {/* Ombros (Deltoides) */}
          <path d="M 35,32 C 30,34 26,38 27,48 C 29,48 33,45 35,42 Z" className={getFillClass(highlightShoulders)} />
          <path d="M 65,32 C 70,34 74,38 73,48 C 71,48 67,45 65,42 Z" className={getFillClass(highlightShoulders)} />

          {/* Peito (Peitorais) */}
          <path d="M 50,32 L 35,35 L 35,50 C 40,51 45,53 50,54 Z" className={getFillClass(highlightChest)} />
          <path d="M 50,32 L 65,35 L 65,50 C 60,51 55,53 50,54 Z" className={getFillClass(highlightChest)} />

          {/* Braços (Bíceps) */}
          <path d="M 27,48 L 22,72 L 28,72 L 35,42 Z" className={getFillClass(highlightBiceps)} />
          <path d="M 73,48 L 78,72 L 72,72 L 65,42 Z" className={getFillClass(highlightBiceps)} />

          {/* Antebraços */}
          <path d="M 22,72 L 18,100 L 23,100 L 28,72 Z" className={getFillClass(highlightForearms)} />
          <path d="M 78,72 L 82,100 L 77,100 L 72,72 Z" className={getFillClass(highlightForearms)} />

          {/* Mãos */}
          <path d="M 18,100 Q 15,112 21,114 Q 23,108 23,100 Z" className={neutroClass} />
          <path d="M 82,100 Q 85,112 79,114 Q 77,108 77,100 Z" className={neutroClass} />

          {/* Core (Abdômen / Oblíquos) */}
          <path d="M 35,50 C 40,51 45,53 50,54 C 55,53 60,51 65,50 L 61,82 L 39,82 Z" className={getFillClass(highlightAbs)} />

          {/* Cintura / Pélvis */}
          <path d="M 39,82 L 61,82 L 58,98 L 42,98 Z" className={neutroClass} />

          {/* Pernas (Quadríceps) */}
          <path d="M 42,98 L 32,148 L 46,148 L 50,98 Z" className={getFillClass(highlightQuadriceps)} />
          <path d="M 58,98 L 68,148 L 54,148 L 50,98 Z" className={getFillClass(highlightQuadriceps)} />

          {/* Joelhos */}
          <rect x="33" y="148" width="12" height="6" rx="2" className={neutroClass} />
          <rect x="55" y="148" width="12" height="6" rx="2" className={neutroClass} />

          {/* Canela / Gêmeo Frontal (Panturrilhas frontais) */}
          <path d="M 33,154 L 30,195 L 41,195 L 45,154 Z" className={getFillClass(highlightCalves)} />
          <path d="M 67,154 L 70,195 L 59,195 L 55,154 Z" className={getFillClass(highlightCalves)} />

          {/* Pés */}
          <path d="M 30,195 L 26,206 Q 34,208 38,206 L 41,195 Z" className={neutroClass} />
          <path d="M 70,195 L 74,206 Q 66,208 62,206 L 59,195 Z" className={neutroClass} />
        </svg>
      </div>

      {/* Silhueta Costas */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Costas</span>
        <svg
          viewBox="0 0 100 220"
          className="overflow-visible"
          style={{ height: size, width: size / 2.2 }}
        >
          {/* Cabeça */}
          <ellipse cx="50" cy="15" rx="8" ry="10" className={neutroClass} />
          
          {/* Pescoço */}
          <polygon points="47,25 53,25 52,31 48,31" className={neutroClass} />

          {/* Ombros (Deltoides Posteriores) */}
          <path d="M 35,32 C 30,34 26,38 27,48 C 29,48 33,45 35,42 Z" className={getFillClass(highlightShoulders)} />
          <path d="M 65,32 C 70,34 74,38 73,48 C 71,48 67,45 65,42 Z" className={getFillClass(highlightShoulders)} />

          {/* Costas Superior (Trapézio e Redondos) */}
          <path d="M 50,30 L 35,34 L 38,52 L 50,45 Z" className={getFillClass(highlightUpperBack)} />
          <path d="M 50,30 L 65,34 L 62,52 L 50,45 Z" className={getFillClass(highlightUpperBack)} />

          {/* Costas Médio/Inferior (Dorsal - Lats) */}
          <path d="M 38,52 L 50,45 L 62,52 L 60.5,68 L 39.5,68 Z" className={getFillClass(highlightLats)} />

          {/* Lombar (Subdividido das dorsais) */}
          <path d="M 39.5,68 L 60.5,68 L 59,82 L 41,82 Z" className={getFillClass(highlightLombar)} />

          {/* Braços (Tríceps) */}
          <path d="M 27,48 L 22,72 L 28,72 L 35,42 Z" className={getFillClass(highlightTriceps)} />
          <path d="M 73,48 L 78,72 L 72,72 L 65,42 Z" className={getFillClass(highlightTriceps)} />

          {/* Antebraços */}
          <path d="M 22,72 L 18,100 L 23,100 L 28,72 Z" className={getFillClass(highlightForearms)} />
          <path d="M 78,72 L 82,100 L 77,100 L 72,72 Z" className={getFillClass(highlightForearms)} />

          {/* Mãos */}
          <path d="M 18,100 Q 15,112 21,114 Q 23,108 23,100 Z" className={neutroClass} />
          <path d="M 82,100 Q 85,112 79,114 Q 77,108 77,100 Z" className={neutroClass} />

          {/* Glúteos */}
          <path d="M 39,82 L 50,82 L 50,102 L 41,100 Z" className={getFillClass(highlightGlutes)} />
          <path d="M 50,82 L 61,82 L 59,100 L 50,102 Z" className={getFillClass(highlightGlutes)} />

          {/* Pernas (Posterior de Coxa - Hamstrings) */}
          <path d="M 41,100 L 32,148 L 46,148 L 50,102 Z" className={getFillClass(highlightHamstrings)} />
          <path d="M 59,100 L 68,148 L 54,148 L 50,102 Z" className={getFillClass(highlightHamstrings)} />

          {/* Joelhos */}
          <rect x="33" y="148" width="12" height="6" rx="2" className={neutroClass} />
          <rect x="55" y="148" width="12" height="6" rx="2" className={neutroClass} />

          {/* Panturrilhas */}
          <path d="M 33,154 L 30,195 L 41,195 L 45,154 Z" className={getFillClass(highlightCalves)} />
          <path d="M 67,154 L 70,195 L 59,195 L 55,154 Z" className={getFillClass(highlightCalves)} />

          {/* Pés */}
          <path d="M 30,195 L 26,206 Q 34,208 38,206 L 41,195 Z" className={neutroClass} />
          <path d="M 70,195 L 74,206 Q 66,208 62,206 L 59,195 Z" className={neutroClass} />
        </svg>
      </div>
    </div>
  );
}
