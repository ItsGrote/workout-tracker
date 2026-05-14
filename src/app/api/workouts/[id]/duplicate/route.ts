import type { NextRequest } from "next/server";
import { workoutController } from "@/server/controllers/workout.controller";

type DuplicateWorkoutRouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = async (
  request: NextRequest,
  context: DuplicateWorkoutRouteContext,
) => {
  const { id } = await context.params;

  return workoutController.duplicate(request, id);
};

