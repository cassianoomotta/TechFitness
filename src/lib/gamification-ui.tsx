import React from "react";
import { Play, Award, Zap, Scale, Flame, Shield, Swords, Crown, Trophy } from "lucide-react";

export const TIER_CONFIG: Record<number, { label: string; sublabel: string; gradient: string; borderColor: string; bgColor: string; textColor: string; iconBg: string }> = {
  1: {
    label: "Primeiros Passos",
    sublabel: "O início de toda grande jornada",
    gradient: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-300/40",
    bgColor: "bg-emerald-50/30",
    textColor: "text-emerald-700",
    iconBg: "bg-emerald-500",
  },
  2: {
    label: "Criando o Hábito",
    sublabel: "Disciplina transforma corpo e mente",
    gradient: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-300/40",
    bgColor: "bg-blue-50/30",
    textColor: "text-blue-700",
    iconBg: "bg-blue-500",
  },
  3: {
    label: "Evolução Real",
    sublabel: "Os resultados começam a aparecer",
    gradient: "from-violet-500 to-purple-600",
    borderColor: "border-violet-300/40",
    bgColor: "bg-violet-50/30",
    textColor: "text-violet-700",
    iconBg: "bg-violet-500",
  },
  4: {
    label: "Elite & Lenda",
    sublabel: "Poucos chegam. Você está entre os melhores",
    gradient: "from-amber-500 to-orange-600",
    borderColor: "border-amber-300/40",
    bgColor: "bg-amber-50/30",
    textColor: "text-amber-700",
    iconBg: "bg-amber-500",
  },
};

export function getAchievementIcon(iconName: string, unlocked: boolean, size: string = "w-7 h-7") {
  const colorClass = unlocked ? "text-white" : "text-zinc-400";
  const props = { className: `${size} ${colorClass}` };
  switch (iconName) {
    case "Play":
      return <Play {...props} className={props.className + " fill-current"} />;
    case "Award":
      return <Award {...props} />;
    case "Zap":
      return <Zap {...props} className={props.className + " fill-current"} />;
    case "Scale":
      return <Scale {...props} />;
    case "Flame":
      return <Flame {...props} className={props.className + " fill-current"} />;
    case "ShieldAlert":
      return <Shield {...props} />;
    case "Sword":
      return <Swords {...props} />;
    case "Crown":
      return <Crown {...props} />;
    case "Trophy":
      return <Trophy {...props} />;
    default:
      return <Trophy {...props} />;
  }
}
