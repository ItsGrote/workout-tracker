import type { NextRequest } from "next/server";
import { workoutController } from "@/server/controllers/workout.controller";

type WorkoutRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = async (
  request: NextRequest,
  context: WorkoutRouteContext,
) => {
  const { id } = await context.params;

  return workoutController.findById(request, id);
};

export const PATCH = async (
  request: NextRequest,
  context: WorkoutRouteContext,
) => {
  const { id } = await context.params;

  return workoutController.update(request, id);
};

export const DELETE = async (
  request: NextRequest,
  context: WorkoutRouteContext,
) => {
  const { id } = await context.params;

  return workoutController.delete(request, id);
};

