import type { NextRequest } from "next/server";
import { exerciseController } from "@/server/controllers/exercise.controller";

type WorkoutExerciseRouteContext = {
  params: Promise<{ exerciseId: string; id: string }>;
};

export const GET = async (
  request: NextRequest,
  context: WorkoutExerciseRouteContext,
) => {
  const { exerciseId, id } = await context.params;

  return exerciseController.findById(request, id, exerciseId);
};

export const PATCH = async (
  request: NextRequest,
  context: WorkoutExerciseRouteContext,
) => {
  const { exerciseId, id } = await context.params;

  return exerciseController.update(request, id, exerciseId);
};

export const DELETE = async (
  request: NextRequest,
  context: WorkoutExerciseRouteContext,
) => {
  const { exerciseId, id } = await context.params;

  return exerciseController.delete(request, id, exerciseId);
};

