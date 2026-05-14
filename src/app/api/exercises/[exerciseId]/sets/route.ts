import type { NextRequest } from "next/server";
import { exerciseSetController } from "@/server/controllers/exercise-set.controller";

type ExerciseSetsRouteContext = {
  params: Promise<{ exerciseId: string }>;
};

export const GET = async (
  request: NextRequest,
  context: ExerciseSetsRouteContext,
) => {
  const { exerciseId } = await context.params;

  return exerciseSetController.listByExercise(request, exerciseId);
};

export const POST = async (
  request: NextRequest,
  context: ExerciseSetsRouteContext,
) => {
  const { exerciseId } = await context.params;

  return exerciseSetController.create(request, exerciseId);
};

