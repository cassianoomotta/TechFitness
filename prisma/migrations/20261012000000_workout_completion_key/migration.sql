ALTER TABLE "WorkoutSession"
ADD COLUMN "completionKey" TEXT;

CREATE UNIQUE INDEX "WorkoutSession_completionKey_key"
ON "WorkoutSession"("completionKey");
