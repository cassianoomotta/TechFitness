CREATE TABLE "TrainerDailySummary" (
  "trainerId" text NOT NULL REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "day" date NOT NULL,
  "generatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sessions" integer NOT NULL,
  "inactiveStudents" integer NOT NULL,
  "olderPlans" integer NOT NULL,
  "joined" integer NOT NULL,
  "departed" integer NOT NULL,
  PRIMARY KEY ("trainerId", "day")
);
ALTER TABLE "TrainerDailySummary" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "TrainerDailySummary" FROM anon, authenticated;
