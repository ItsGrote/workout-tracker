-- CreateTable
CREATE TABLE "TrainingGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weeklyGoal" INTEGER,
    "monthlyGoal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingGoal_userId_key" ON "TrainingGoal"("userId");

