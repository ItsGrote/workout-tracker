import type { NextRequest } from "next/server";
import { exerciseController } from "@/server/controllers/exercise.controller";

type WorkoutExercisesRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = async (
  request: NextRequest,
  context: WorkoutExercisesRouteContext,
) => {
  const { id } = await context.params;

  return exerciseController.listByWorkout(request, id);
};

export const POST = async (
  request: NextRequest,
  context: WorkoutExercisesRouteContext,
) => {
  const { id } = await context.params;

  return exerciseController.create(request, id);
};

