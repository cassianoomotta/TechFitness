CREATE TABLE "StudentExerciseNote" (
    "studentProfileId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "note" VARCHAR(1000) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentExerciseNote_pkey" PRIMARY KEY ("studentProfileId", "exerciseId")
);

CREATE INDEX "StudentExerciseNote_exerciseId_idx"
ON "StudentExerciseNote"("exerciseId");

ALTER TABLE "StudentExerciseNote"
ADD CONSTRAINT "StudentExerciseNote_studentProfileId_fkey"
FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentExerciseNote"
ADD CONSTRAINT "StudentExerciseNote_exerciseId_fkey"
FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ExerciseLog_studentId_exerciseId_idx"
ON "ExerciseLog"("studentId", "exerciseId");
