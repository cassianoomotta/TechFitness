// ═══════════════════════════════════════════════════════════════
// TechFitness — Módulo centralizado de Gamificação
// Contém todas as regras de negócio: achievements, streak, XP, etc.
// ═══════════════════════════════════════════════════════════════

/** Mínimo de dias distintos de treino na semana para contar como semana completa */
export const MIN_DAYS_PER_WEEK = 3;

// ── Achievement Definitions ──

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  tier: number;
}

export interface GamificationAchievement extends AchievementDef {
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface GamificationData {
  level: number;
  levelTitle: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXpNeeded: number;
  streak: number;
  totalSessions: number;
  prsCount: number;
  measurementsCount: number;
  achievements: GamificationAchievement[];
}

export interface PersonalRecord {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  maxWeight: number;
  reps: number;
  date?: string | null;
}

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  // ── TIER 1: Primeiros Passos ──
  { id: "first_step", title: "Primeiro Passo", description: "Concluiu o primeiro treino na plataforma", icon: "Play", xpReward: 100, tier: 1 },
  { id: "pr_pioneer", title: "Pioneiro da Força", description: "Bateu seu primeiro recorde pessoal de carga (PR)", icon: "Zap", xpReward: 150, tier: 1 },
  { id: "body_awareness", title: "Consciência Corporal", description: "Registrou seu peso ou medidas corporais pela primeira vez", icon: "Scale", xpReward: 100, tier: 1 },
  // ── TIER 2: Criando o Hábito ──
  { id: "iron_consistency", title: "Consistência de Aço", description: "Concluiu 5 sessões de treino no total", icon: "Award", xpReward: 250, tier: 2 },
  { id: "streak_fire", title: "Frequência Semanal", description: "Treinou pelo menos 3 dias por semana durante 3 semanas consecutivas", icon: "Flame", xpReward: 300, tier: 2 },
  { id: "eagle_eye", title: "Olhar de Águia", description: "Registrou peso ou medidas corporais 3 vezes", icon: "Scale", xpReward: 200, tier: 2 },
  // ── TIER 3: Evolução Real ──
  { id: "warrior_path", title: "Caminho do Guerreiro", description: "Completou 15 sessões de treino — disciplina notável", icon: "Sword", xpReward: 500, tier: 3 },
  { id: "titan_strength", title: "Força Titânica", description: "Bateu 5 recordes de carga (PRs) em exercícios diferentes", icon: "ShieldAlert", xpReward: 500, tier: 3 },
  { id: "inferno_streak", title: "Constância de Titã", description: "Treinou pelo menos 3 dias por semana durante 7 semanas consecutivas", icon: "Flame", xpReward: 600, tier: 3 },
  // ── TIER 4: Elite / Lenda ──
  { id: "centurion", title: "Centurião", description: "Alcançou 30 sessões de treino completas", icon: "Crown", xpReward: 800, tier: 4 },
  { id: "pr_machine", title: "Máquina de PRs", description: "Acumulou 10 recordes pessoais de carga em exercícios", icon: "Zap", xpReward: 750, tier: 4 },
  { id: "olympus_legend", title: "Lenda do Olimpo", description: "Completou 50 sessões de treino — poucos chegam aqui", icon: "Trophy", xpReward: 1500, tier: 4 },
];

// ── Streak Calculation ──

/** Retorna a string "YYYY-MM-DD" da segunda-feira da semana de uma data */
export function getWeekStart(d: Date): string {
  const temp = new Date(d);
  temp.setHours(0, 0, 0, 0);
  const day = temp.getDay();
  const diff = temp.getDate() - day + (day === 0 ? -6 : 1); // Segunda-feira
  const monday = new Date(temp.setDate(diff));
  return monday.toLocaleDateString("en-CA");
}

/**
 * Calcula o streak atual em semanas consecutivas.
 * Uma semana é considerada "completa" se o aluno treinou em pelo menos MIN_DAYS_PER_WEEK dias distintos.
 */
export function calculateStreak(
  sessions: ({ date: Date | string; logs?: { exerciseId: string }[] } | Date | string)[],
  studentPlans: { id?: string; exercises?: { exerciseId: string }[] }[] = []
): number {
  if (!sessions || sessions.length === 0) return 0;

  // Normalizar sessões
  const normalizedSessions: { date: Date }[] = sessions.map((s) => {
    if (s instanceof Date) return { date: s };
    if (typeof s === "string") return { date: new Date(s) };
    if (typeof s === "object" && s !== null && "date" in s) return { date: new Date(s.date) };
    return { date: new Date() };
  });

  // Agrupar sessões por semana
  const sessionsByWeek: Record<string, { date: Date }[]> = {};
  for (const s of normalizedSessions) {
    const w = getWeekStart(s.date);
    if (!sessionsByWeek[w]) {
      sessionsByWeek[w] = [];
    }
    sessionsByWeek[w].push(s);
  }

  // Função para verificar se a semana foi completada
  const isWeekCompleted = (weekStr: string): boolean => {
    const weekSessions = sessionsByWeek[weekStr] || [];
    if (weekSessions.length === 0) return false;
    if (studentPlans.length === 0) return weekSessions.length >= MIN_DAYS_PER_WEEK;

    // Contar dias distintos de treino na semana
    const distinctDays = new Set(
      weekSessions.map((s) => s.date.toLocaleDateString("en-CA"))
    );

    return distinctDays.size >= MIN_DAYS_PER_WEEK;
  };

  const today = new Date();
  const currentWeek = getWeekStart(today);

  const lastWeekDate = new Date(today);
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeek = getWeekStart(lastWeekDate);

  const isCurrentWeekDone = isWeekCompleted(currentWeek);
  const isLastWeekDone = isWeekCompleted(lastWeek);

  if (isCurrentWeekDone || isLastWeekDone) {
    let streak = 1;
    const refDate = new Date(isCurrentWeekDone ? currentWeek : lastWeek);

    while (true) {
      refDate.setDate(refDate.getDate() - 7);
      const prevWeekStr = getWeekStart(refDate);
      if (isWeekCompleted(prevWeekStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  return 0;
}

// ── Unlocked Achievement IDs ──

/** Retorna a lista de IDs de achievements desbloqueados com base nos stats atuais */
export function getUnlockedAchievements(
  totalSessions: number,
  prsCount: number,
  streak: number,
  measurementsCount: number
): string[] {
  const achievements: string[] = [];
  if (totalSessions >= 1) achievements.push("first_step");
  if (prsCount >= 1) achievements.push("pr_pioneer");
  if (measurementsCount >= 1) achievements.push("body_awareness");
  if (totalSessions >= 5) achievements.push("iron_consistency");
  if (streak >= 3) achievements.push("streak_fire");
  if (measurementsCount >= 3) achievements.push("eagle_eye");
  if (totalSessions >= 15) achievements.push("warrior_path");
  if (prsCount >= 5) achievements.push("titan_strength");
  if (streak >= 7) achievements.push("inferno_streak");
  if (totalSessions >= 30) achievements.push("centurion");
  if (prsCount >= 10) achievements.push("pr_machine");
  if (totalSessions >= 50) achievements.push("olympus_legend");
  return achievements;
}

// ── XP & Level ──

export const XP_PER_LEVEL = 1000;

export interface XpBreakdown {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXpNeeded: number;
  workoutXp: number;
  bonusAdherenceXp: number;
  extraWorkoutXp: number;
  prsXp: number;
  measurementsXp: number;
}

/**
 * Determina a meta de treinos por semana do aluno com base nas suas fichas.
 * Se tiver dias da semana definidos (ex: Seg, Ter, Qua, Sex), conta os dias únicos.
 * Se tiver fichas sem dias, conta o número de fichas (mínimo 3, máximo 6).
 * Se não tiver fichas, o padrão é 3 treinos por semana.
 */
export function getWeeklyGoalFromPlans(
  plans?: Array<{ weekDays?: string | string[] | any; division?: string }> | null
): number {
  if (!plans || plans.length === 0) return 3;

  const distinctDays = new Set<string>();
  for (const p of plans) {
    if (p.weekDays) {
      if (Array.isArray(p.weekDays)) {
        p.weekDays.forEach((d: string) => distinctDays.add(String(d).trim()));
      } else if (typeof p.weekDays === "string") {
        p.weekDays.split(",").forEach((d: string) => distinctDays.add(d.trim()));
      }
    }
  }

  if (distinctDays.size > 0) {
    return Math.max(2, Math.min(distinctDays.size, 7));
  }

  return Math.max(3, Math.min(plans.length, 6));
}

/**
 * Calcula a aderência semanal: quantas semanas foram perfeitas (100% da meta) e quantos treinos foram extras.
 */
export function calculateSessionsAdherence(
  sessions: Array<{ date: string | Date }>,
  weeklyGoal: number = 3
) {
  if (!sessions || sessions.length === 0) {
    return { perfectWeeks: 0, extraSessions: 0, baseSessions: 0 };
  }

  const sessionsByWeek: Record<string, Set<string>> = {};
  for (const s of sessions) {
    const d = s.date instanceof Date ? s.date : new Date(s.date);
    const w = getWeekStart(d);
    if (!sessionsByWeek[w]) {
      sessionsByWeek[w] = new Set<string>();
    }
    sessionsByWeek[w].add(d.toLocaleDateString("en-CA"));
  }

  let perfectWeeks = 0;
  let extraSessions = 0;
  let baseSessions = 0;

  for (const distinctDays of Object.values(sessionsByWeek)) {
    const count = distinctDays.size;
    if (count >= weeklyGoal) {
      perfectWeeks++;
      baseSessions += weeklyGoal;
      extraSessions += (count - weeklyGoal);
    } else {
      baseSessions += count;
    }
  }

  return { perfectWeeks, extraSessions, baseSessions };
}

/**
 * Fórmula Justa de Gamificação:
 * - 150 XP por treino da ficha prescrita
 * - +400 XP de Bônus de Meta Batida (Semana Perfeita)
 * - +75 XP por treino extra além da meta da semana
 * - +100 XP por Recorde Pessoal de Carga (PR)
 * - +50 XP por medição corporal
 */
export function calculateXp(
  totalSessions: number,
  prsCount: number,
  measurementsCount: number,
  options?: {
    perfectWeeks?: number;
    extraSessions?: number;
  }
): XpBreakdown {
  const perfectWeeks = options?.perfectWeeks ?? 0;
  const extraSessions = options?.extraSessions ?? 0;

  const baseSessions = Math.max(0, totalSessions - extraSessions);
  const workoutXp = baseSessions * 150;
  const bonusAdherenceXp = perfectWeeks * 400;
  const extraWorkoutXp = extraSessions * 75;
  const prsXp = prsCount * 100;
  const measurementsXp = measurementsCount * 50;

  const totalXp = workoutXp + bonusAdherenceXp + extraWorkoutXp + prsXp + measurementsXp;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = totalXp % XP_PER_LEVEL;
  const nextLevelXpNeeded = XP_PER_LEVEL;

  return {
    totalXp,
    level,
    currentLevelXp,
    nextLevelXpNeeded,
    workoutXp,
    bonusAdherenceXp,
    extraWorkoutXp,
    prsXp,
    measurementsXp,
  };
}

/**
 * Calcula XP específico por período (Semana Atual, Mês Atual ou Geral)
 */
export function calculatePeriodXp(
  sessions: Array<{ date: string | Date }>,
  weeklyGoal: number,
  prsCount: number,
  measurementsCount: number,
  period: "weekly" | "monthly" | "allTime"
): XpBreakdown {
  const now = new Date();
  const currentWeekStart = new Date(getWeekStart(now));
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let filteredSessions = sessions;
  let periodPrs = prsCount;
  let periodMeasurements = measurementsCount;

  if (period === "weekly") {
    filteredSessions = sessions.filter((s) => {
      const d = s.date instanceof Date ? s.date : new Date(s.date);
      return d >= currentWeekStart;
    });
    // No semanal, PRs e medições do período têm peso proporcional
    periodPrs = Math.min(prsCount, filteredSessions.length);
    periodMeasurements = Math.min(measurementsCount, 1);
  } else if (period === "monthly") {
    filteredSessions = sessions.filter((s) => {
      const d = s.date instanceof Date ? s.date : new Date(s.date);
      return d >= currentMonthStart;
    });
    periodPrs = Math.min(prsCount, filteredSessions.length * 2);
    periodMeasurements = Math.min(measurementsCount, 4);
  }

  const { perfectWeeks, extraSessions } = calculateSessionsAdherence(
    filteredSessions,
    weeklyGoal
  );

  return calculateXp(filteredSessions.length, periodPrs, periodMeasurements, {
    perfectWeeks,
    extraSessions,
  });
}

export function getLevelTitle(level: number): string {
  if (level >= 10) return "Lenda do Olimpo";
  if (level >= 7) return "Monstro da Academia";
  if (level >= 5) return "Guerreiro de Ferro";
  if (level >= 3) return "Forjador de Cargas";
  return "Recruta do Aço";
}

export function calculateLevel(totalXp: number) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = totalXp % XP_PER_LEVEL;
  const nextLevelXpNeeded = XP_PER_LEVEL;
  const title = getLevelTitle(level);

  return {
    totalXp,
    level,
    title,
    currentLevelXp,
    nextLevelXpNeeded,
  };
}

export function calculateTier(level: number) {
  if (level >= 7) {
    return { tier: 4, name: "Elite & Lenda", badge: "👑" };
  }
  if (level >= 5) {
    return { tier: 3, name: "Evolução Real", badge: "🔥" };
  }
  if (level >= 3) {
    return { tier: 2, name: "Criando o Hábito", badge: "⚡" };
  }
  return { tier: 1, name: "Primeiros Passos", badge: "🌱" };
}

// ── Achievement Status Hints (para frontend) ──

export interface AchievementWithProgress {
  id: string;
  unlocked: boolean;
  target: number;
  progress: number;
}

/** Gera a dica de progresso para exibição no frontend */
export function getAchievementStatusHint(achievement: AchievementWithProgress): string {
  if (achievement.unlocked) return "Conquista desbloqueada! XP adicionado à sua conta.";

  const remaining = achievement.target - achievement.progress;

  switch (achievement.id) {
    case "first_step":
      return `Falta apenas ${remaining} treino para iniciar sua jornada!`;
    case "pr_pioneer":
      return `Falta registrar seu primeiro recorde pessoal de carga (PR) em qualquer exercício!`;
    case "body_awareness":
      return `Registre seu peso corporal 1 vez na aba "Meu Peso" para desbloquear.`;
    case "iron_consistency":
      return `Falta(m) ${remaining} treino(s) completo(s) para alcançar o hábito de aço.`;
    case "streak_fire":
      return `Treine pelo menos 3 dias por mais ${remaining} semana(s) consecutivas para desbloquear Frequência Semanal.`;
    case "eagle_eye":
      return `Registre seu peso corporal mais ${remaining} vez(es) na aba "Meu Peso".`;
    case "warrior_path":
      return `Falta(m) ${remaining} treino(s) completo(s) para trilhar o Caminho do Guerreiro.`;
    case "titan_strength":
      return `Bata recordes de carga em mais ${remaining} exercício(s) diferente(s).`;
    case "inferno_streak":
      return `Mantenha o ritmo! Treine pelo menos 3 dias por mais ${remaining} semana(s) consecutivas para desbloquear Constância de Titã.`;
    case "centurion":
      return `Falta(m) ${remaining} treino(s) completo(s) para se tornar um Centurião.`;
    case "pr_machine":
      return `Bata recordes de carga em mais ${remaining} exercício(s) para se tornar uma Máquina de PRs.`;
    case "olympus_legend":
      return `Falta(m) ${remaining} treino(s) para subir ao topo e se tornar uma Lenda do Olimpo!`;
    default:
      return `Falta(m) ${remaining} para atingir a meta de ${achievement.target}.`;
  }
}

// ── Volume de Carga e Tonelagem (Dopamina do Treino) ──

export type TonnageCuriosityCategory = "animal" | "veiculo" | "construcao" | "epico" | "ciencia" | "espaco";

export interface TonnageCuriosity {
  label: string;
  icon: string;
  comparisonText: string;
  category: TonnageCuriosityCategory;
  funFact: string;
}

export interface TonnageComparison {
  tonnageKg: number;
  label: string;
  icon: string;
  comparisonText: string;
  category?: string;
  funFact?: string;
  curiosities?: TonnageCuriosity[];
  workJoules?: number;
  workKcal?: number;
}

export function calculateSessionVolume(
  logs: { weightUsed: number; repsPerformed: number }[]
): number {
  return logs.reduce((acc, log) => {
    const w = Number(log.weightUsed) || 0;
    const r = Number(log.repsPerformed) || 0;
    return acc + w * r;
  }, 0);
}

export function getTonnageComparison(tonnageKg: number): TonnageComparison {
  const rounded = Math.round(tonnageKg);

  // Estimativa biomecânica: W = m * g * h (~0.65m de amplitude média de movimento)
  const workJoules = Math.round(rounded * 9.81 * 0.65);
  // Eficiência mecânica humana ~22%, logo queima calórica muscular real estimada
  const workKcal = Math.round(workJoules / 930);

  let pool: TonnageCuriosity[] = [];

  if (rounded < 1000) {
    pool = [
      {
        label: "Moto Esportiva",
        icon: "🏍️",
        comparisonText: "Você ergueu o peso de uma moto esportiva de alta cilindrada hoje!",
        category: "veiculo",
        funFact: "Essa carga equivale a suspender mais de 30 caixas pesadas de livros de uma só vez.",
      },
      {
        label: "Cavalo Puro-Sangue",
        icon: "🐎",
        comparisonText: "Você movimentou o equivalente a um cavalo puro-sangue campeão!",
        category: "animal",
        funFact: "Seus músculos geraram força suficiente para tracionar um equino de corrida em pleno galope.",
      },
      {
        label: "Piano de Cauda",
        icon: "🎹",
        comparisonText: "Você ergueu o peso de um piano de cauda de concerto clássico inteiro!",
        category: "construcao",
        funFact: "Pianos de cauda possuem uma armação maciça de ferro fundido para suportar mais de 20 toneladas de tensão nas cordas.",
      },
      {
        label: "Família de Leões",
        icon: "🦁",
        comparisonText: "Você ergueu o peso combinado de uma leoa e seus filhotes na savana!",
        category: "animal",
        funFact: "Grandes felinos contam com fibras de explosão rápida, e você sustentou essa carga com esforço muscular contínuo.",
      },
      {
        label: "Satélite Starlink",
        icon: "🛰️",
        comparisonText: "Você movimentou a massa de um satélite orbital de telecomunicações Starlink!",
        category: "espaco",
        funFact: "Cada satélite desse tipo pesa de 300 a 800 kg e orbita a Terra a mais de 27.000 km por hora.",
      },
    ];
  } else if (rounded < 2500) {
    pool = [
      {
        label: "Carro Popular",
        icon: "🚗",
        comparisonText: "Você levantou o peso de um carro popular inteiro hoje!",
        category: "veiculo",
        funFact: "Se enfileirássemos as anilhas desse treino, daria a altura de um prédio de 3 andares!",
      },
      {
        label: "40 Sacos de Cimento",
        icon: "🏗️",
        comparisonText: "Você ergueu o equivalente a 40 sacos de cimento de obras da construção civil!",
        category: "construcao",
        funFact: "Trabalhadores da construção civil levariam horas para manusear essa carga. Você fez isso em uma única sessão!",
      },
      {
        label: "Dois Ursos Polares",
        icon: "🐻‍❄️",
        comparisonText: "Você movimentou o peso de dois dos maiores ursos polares da Terra!",
        category: "animal",
        funFact: "A força gerada nas suas séries superou a massa combinada dos maiores predadores terrestres do Ártico.",
      },
      {
        label: "Cápsula de Retorno Espacial",
        icon: "🚀",
        comparisonText: "Você ergueu a massa de uma cápsula espacial projetada para reentrar na atmosfera!",
        category: "espaco",
        funFact: "Cápsulas espaciais suportam forças térmicas e gravitacionais extremas, e sua musculatura suportou uma carga de engenharia aeroespacial.",
      },
      {
        label: "Grande Tubarão-Branco",
        icon: "🦈",
        comparisonText: "Você moveu o peso colossal de um grande tubarão-branco dos oceanos!",
        category: "animal",
        funFact: "Tubarões-brancos adultos pesam entre 1.100 e 2.000 kg. Seus músculos enfrentaram o peso do soberano dos mares.",
      },
    ];
  } else if (rounded < 5000) {
    pool = [
      {
        label: "Caminhonete 4x4",
        icon: "🛻",
        comparisonText: "Você levantou o peso de uma caminhonete 4x4 bruta hoje!",
        category: "veiculo",
        funFact: "O estresse tensional do treino envia sinais químicos para aumentar a densidade mineral dos seus ossos e tendões.",
      },
      {
        label: "Rinoceronte Branco",
        icon: "🦏",
        comparisonText: "Você movimentou o peso de um rinoceronte branco gigante!",
        category: "animal",
        funFact: "Rinocerontes são os segundos maiores mamíferos terrestres. Seus músculos agiram como verdadeiras blindagens hoje.",
      },
      {
        label: "Veículo Militar Blindado",
        icon: "🛡️",
        comparisonText: "Você ergueu o equivalente a um veículo militar blindado de transporte tático!",
        category: "epico",
        funFact: "Essa sobrecarga estimulou a liberação de miocinas protetoras que aceleram a taxa metabólica basal por até 36 horas.",
      },
      {
        label: "Rover Marciano Perseverance",
        icon: "🪐",
        comparisonText: "Você ergueu mais de três vezes a massa do robô Perseverance em Marte!",
        category: "espaco",
        funFact: "O rover marciano da NASA pesa cerca de 1.025 kg e viajou mais de 470 milhões de quilômetros pelo espaço.",
      },
      {
        label: "Dois Hipopótamos Adultos",
        icon: "🦛",
        comparisonText: "Você sustentou a massa combinada de dois hipopótamos adultos africanos!",
        category: "animal",
        funFact: "Hipopótamos possuem ossos extremamente densos para caminhar no fundo dos rios. Seu treino estimulou adaptação óssea semelhante.",
      },
    ];
  } else if (rounded < 10000) {
    pool = [
      {
        label: "Elefante Africano",
        icon: "🐘",
        comparisonText: "Impressionante! Você ergueu o peso de um elefante africano macho adulto!",
        category: "animal",
        funFact: "O elefante africano é o maior animal terrestre vivo da Terra. Você moveu esse gigante série por série!",
      },
      {
        label: "T-Rex Jovem",
        icon: "🦖",
        comparisonText: "Força pré-histórica! Você movimentou o peso estimado de um Tiranossauro Rex jovem!",
        category: "epico",
        funFact: "A energia gasta pelo seu metabolismo durante esse treino seria suficiente para manter uma residência com luz acesa por dezenas de horas.",
      },
      {
        label: "Helicóptero de Resgate",
        icon: "🚁",
        comparisonText: "Você ergueu a tonelagem inteira de um helicóptero bimotor de resgate!",
        category: "veiculo",
        funFact: "Seu coração bombeou dezenas de litros de sangue oxigenado para suportar cada contração muscular máxima.",
      },
      {
        label: "Blocos da Grande Pirâmide",
        icon: "🏛️",
        comparisonText: "Você moveu o equivalente a 3 blocos maciços de pedra da Grande Pirâmide de Gizé!",
        category: "construcao",
        funFact: "Cada bloco de pedra das pirâmides egípcias pesava em média 2,5 toneladas e exigiu milhares de pessoas para ser transportado.",
      },
      {
        label: "Caça Militar Supersônico",
        icon: "✈️",
        comparisonText: "Você levantou o peso a seco de um caça militar supersônico a jato!",
        category: "veiculo",
        funFact: "A tensão muscular que você imprimiu nas séries é comparável às forças G que pilotos de caça enfrentam em curvas extremas.",
      },
    ];
  } else if (rounded < 20000) {
    pool = [
      {
        label: "Caminhão de Carga Pesada",
        icon: "🚛",
        comparisonText: "Força de titã! Você movimentou o peso de um caminhão de carga pesada!",
        category: "veiculo",
        funFact: "Menos de 1% das pessoas no mundo conseguem movimentar mais de 10 toneladas em um único treino. Consistência de aço.",
      },
      {
        label: "Ônibus Urbano Sanfonado",
        icon: "🚌",
        comparisonText: "Você levantou o peso equivalente a um ônibus urbano de transporte metropolitano!",
        category: "veiculo",
        funFact: "O estresse mecânico desse treino é o estímulo padrão ouro da ciência esportiva para hipertrofia e longevidade neuromuscular.",
      },
      {
        label: "Vigas de Aço da Torre Eiffel",
        icon: "🗼",
        comparisonText: "Você ergueu o equivalente a 3 vigas mestras de aço puro da Torre Eiffel de Paris!",
        category: "construcao",
        funFact: "Sob cargas monumentais de mais de 10 toneladas, o sistema nervoso central recruta unidades motoras de altíssimo limiar com máxima eficiência.",
      },
      {
        label: "Estátua Moai da Ilha de Páscoa",
        icon: "🗿",
        comparisonText: "Você moveu o peso de uma estátua colossal Moai esculpida em rocha vulcânica!",
        category: "construcao",
        funFact: "Os Moais da Ilha de Páscoa têm alturas que chegam a 10 metros e desafiaram gerações de arqueólogos pelo peso titânico.",
      },
      {
        label: "Sino do Big Ben",
        icon: "🔔",
        comparisonText: "Você ergueu a massa inteira do famoso sino Great Bell da torre do Big Ben em Londres!",
        category: "construcao",
        funFact: "O famoso sino inglês pesa cerca de 13,7 toneladas e seu som reverbera por quilômetros. Sua força hoje reverberou no ginásio!",
      },
    ];
  } else if (rounded < 35000) {
    pool = [
      {
        label: "Avião Comercial a Jato",
        icon: "✈️",
        comparisonText: "Nível lendário! Você movimentou a tonelagem de um avião comercial a jato com passageiros!",
        category: "veiculo",
        funFact: "Isso equivale a erguer 1.400 anilhas olímpicas de 20 kg. Uma sessão colossal que entra para a sua história pessoal.",
      },
      {
        label: "Baleia Jubarte dos Oceanos",
        icon: "🐋",
        comparisonText: "Você moveu o peso monumental de uma baleia jubarte nadando pelos oceanos!",
        category: "animal",
        funFact: "Com essa tonelagem, o consumo de oxigênio pós-treino (EPOC) manterá sua queima calórica e regeneração celular aceleradas até amanhã.",
      },
      {
        label: "Carreta Bi-Trem Carregada",
        icon: "🚚",
        comparisonText: "Potência brutal! Você deslocou o peso de uma carreta rodoviária bi-trem inteira!",
        category: "veiculo",
        funFact: "Treinos com esse volume de trabalho são marcas de atletas de elite de levantamento de peso e fisiculturismo de alta performance.",
      },
      {
        label: "Módulo Lunar Apollo",
        icon: "🌕",
        comparisonText: "Você sustentou a massa de dois módulos lunares que pousaram astronautas na Lua!",
        category: "espaco",
        funFact: "O módulo de descida da missão Apollo pesava cerca de 15 toneladas com combustível. Você superou essa façanha com pura contração muscular.",
      },
      {
        label: "Vagão de Trem Metropolitano",
        icon: "🚃",
        comparisonText: "Você moveu o peso estrutural de um vagão inteiro de trem de passageiros moderno!",
        category: "veiculo",
        funFact: "O trabalho físico que você executou hoje exigiu uma cascata metabólica que eleva o reparo muscular e a síntese proteica por 48 horas.",
      },
    ];
  } else {
    pool = [
      {
        label: "Armadura Hulkbuster Maciça",
        icon: "⚡",
        comparisonText: "Força Divina! Você superou o peso de uma armadura mecânica Hulkbuster maciça!",
        category: "epico",
        funFact: "Você atingiu o ápice absoluto da capacidade física humana em um único treino. Um verdadeiro Titã do Olimpo.",
      },
      {
        label: "Fração da Estátua da Liberdade",
        icon: "🗽",
        comparisonText: "Treino histórico! Você movimentou uma fração expressiva do peso da Estátua da Liberdade!",
        category: "construcao",
        funFact: "A densidade desse treino é lendária. Descanse, se alimente bem e hidrate-se: seu corpo fez história hoje.",
      },
      {
        label: "Foguete Orbital Falcon 9",
        icon: "🚀",
        comparisonText: "Você ergueu a massa estrutural inteira de um primeiro estágio de foguete orbital Falcon 9!",
        category: "espaco",
        funFact: "O primeiro estágio desse foguete sem combustível pesa cerca de 25 toneladas. Você superou esse marco aeroespacial com fibra muscular pura.",
      },
      {
        label: "Tubarão Megalodonte",
        icon: "🌊",
        comparisonText: "Você movimentou o peso estimado do maior predador marinho de todos os tempos: o Megalodonte!",
        category: "animal",
        funFact: "Com mais de 40 toneladas de força, sua sessão de treino colocou seu nome no hall dos guerreiros mais dedicados da plataforma.",
      },
      {
        label: "Colosso de Rodes do Mundo Antigo",
        icon: "🏛️",
        comparisonText: "Você sustentou a massa das fundações de bronze do lendário Colosso de Rodes!",
        category: "epico",
        funFact: "Uma das Sete Maravilhas do Mundo Antigo, essa estátua lendária simbolizava a vitória da persistência e da força humana inabalável.",
      },
    ];
  }

  // Selecionar o item principal e disponibilizar todos do pool para alternância
  const selectedIndex = Math.abs(rounded) % pool.length;
  const primary = pool[selectedIndex] || pool[0];

  return {
    tonnageKg: rounded,
    label: primary.label,
    icon: primary.icon,
    comparisonText: primary.comparisonText,
    category: primary.category,
    funFact: primary.funFact,
    curiosities: pool,
    workJoules,
    workKcal,
  };
}
