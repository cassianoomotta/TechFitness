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
function getWeekStart(d: Date): string {
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
  sessions: { date: Date; logs: { exerciseId: string }[] }[],
  studentPlans: { id: string; exercises: { exerciseId: string }[] }[]
): number {
  if (sessions.length === 0) return 0;

  // Agrupar sessões por semana
  const sessionsByWeek: Record<string, typeof sessions> = {};
  for (const s of sessions) {
    const w = getWeekStart(new Date(s.date));
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
      weekSessions.map((s) => new Date(s.date).toLocaleDateString("en-CA"))
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

const XP_PER_LEVEL = 1000;

export function calculateXp(totalSessions: number, prsCount: number, measurementsCount: number) {
  const totalXp = (totalSessions * 300) + (prsCount * 150) + (measurementsCount * 100);
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = totalXp % XP_PER_LEVEL;
  const nextLevelXpNeeded = XP_PER_LEVEL;

  return { totalXp, level, currentLevelXp, nextLevelXpNeeded };
}

export function getLevelTitle(level: number): string {
  if (level >= 10) return "Lenda do Olimpo";
  if (level >= 7) return "Monstro da Academia";
  if (level >= 5) return "Guerreiro de Ferro";
  if (level >= 3) return "Forjador de Cargas";
  return "Recruta do Aço";
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
