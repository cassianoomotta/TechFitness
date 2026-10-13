export interface WorkoutPlanMatchCandidate {
  id: string;
  exerciseIds: string[];
  isArchived?: boolean;
  deletionStatus?: string | null;
}

export interface WorkoutPlanMatchInput {
  sessionPlanId?: string | null;
  sessionExerciseIds: string[];
  plans: WorkoutPlanMatchCandidate[];
}

function isActivePlan(plan: WorkoutPlanMatchCandidate): boolean {
  return !plan.isArchived && plan.deletionStatus !== "ARCHIVED" && plan.deletionStatus !== "PENDING_DELETION";
}

export function resolveWorkoutPlanId(input: WorkoutPlanMatchInput): string | null {
  if (input.sessionPlanId) {
    const exactPlan = input.plans.find((plan) => plan.id === input.sessionPlanId);
    return exactPlan && isActivePlan(exactPlan) ? exactPlan.id : null;
  }

  const exerciseIds = new Set(input.sessionExerciseIds);
  let bestMatch: { id: string; count: number } | null = null;

  for (const plan of input.plans) {
    if (!isActivePlan(plan) || plan.exerciseIds.length === 0) continue;

    const matches = plan.exerciseIds.filter((exerciseId) => exerciseIds.has(exerciseId)).length;
    const minimumMatches = Math.min(2, plan.exerciseIds.length);
    if (matches >= minimumMatches && (!bestMatch || matches > bestMatch.count)) {
      bestMatch = { id: plan.id, count: matches };
    }
  }

  return bestMatch?.id ?? null;
}
