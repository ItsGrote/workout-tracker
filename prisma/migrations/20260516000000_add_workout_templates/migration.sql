CREATE TABLE "WorkoutTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "category" VARCHAR(60),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExerciseTemplate" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "ExerciseTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExerciseSetTemplate" (
    "id" TEXT NOT NULL,
    "exerciseTemplateId" TEXT NOT NULL,
    "setType" "ExerciseSetType" NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "ExerciseSetTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkoutTemplate_userId_idx" ON "WorkoutTemplate"("userId");
CREATE INDEX "WorkoutTemplate_name_idx" ON "WorkoutTemplate"("name");
CREATE INDEX "ExerciseTemplate_templateId_idx" ON "ExerciseTemplate"("templateId");
CREATE INDEX "ExerciseTemplate_name_idx" ON "ExerciseTemplate"("name");
CREATE INDEX "ExerciseSetTemplate_exerciseTemplateId_idx" ON "ExerciseSetTemplate"("exerciseTemplateId");
CREATE INDEX "ExerciseSetTemplate_setType_idx" ON "ExerciseSetTemplate"("setType");

ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExerciseSetTemplate" ADD CONSTRAINT "ExerciseSetTemplate_exerciseTemplateId_fkey" FOREIGN KEY ("exerciseTemplateId") REFERENCES "ExerciseTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
