-- CreateEnum
CREATE TYPE "TrainerStudentLinkEventType" AS ENUM ('LINKED', 'UNLINKED');

-- CreateTable
CREATE TABLE "TrainerStudentLinkEvent" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "eventType" "TrainerStudentLinkEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerStudentLinkEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainerStudentLinkEvent_trainerId_createdAt_idx" ON "TrainerStudentLinkEvent"("trainerId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainerStudentLinkEvent_studentId_createdAt_idx" ON "TrainerStudentLinkEvent"("studentId", "createdAt");

-- AddForeignKey
ALTER TABLE "TrainerStudentLinkEvent" ADD CONSTRAINT "TrainerStudentLinkEvent_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerStudentLinkEvent" ADD CONSTRAINT "TrainerStudentLinkEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
