import type { Prisma } from "@prisma/client";

export type TrainerStudentLinkEventType = "LINKED" | "UNLINKED";

export interface RecordTrainerStudentLinkEventInput {
  trainerId: string;
  studentId: string;
  eventType: TrainerStudentLinkEventType;
}

export async function recordTrainerStudentLinkEvent(
  transaction: Prisma.TransactionClient,
  input: RecordTrainerStudentLinkEventInput
): Promise<void> {
  await transaction.trainerStudentLinkEvent.create({
    data: input,
    select: { id: true },
  });
}
