ALTER TABLE "WorkoutSession"
ADD COLUMN "planId" TEXT;

CREATE INDEX "WorkoutSession_studentId_planId_date_idx"
ON "WorkoutSession"("studentId", "planId", "date");

ALTER TABLE "WorkoutSession"
ADD CONSTRAINT "WorkoutSession_planId_fkey"
FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
