import type { NextRequest } from "next/server";
import { exerciseSetController } from "@/server/controllers/exercise-set.controller";

type ExerciseSetRouteContext = {
  params: Promise<{ exerciseId: string; setId: string }>;
};

export const PATCH = async (
  request: NextRequest,
  context: ExerciseSetRouteContext,
) => {
  const { exerciseId, setId } = await context.params;

  return exerciseSetController.update(request, exerciseId, setId);
};

export const DELETE = async (
  request: NextRequest,
  context: ExerciseSetRouteContext,
) => {
  const { exerciseId, setId } = await context.params;

  return exerciseSetController.delete(request, exerciseId, setId);
};
