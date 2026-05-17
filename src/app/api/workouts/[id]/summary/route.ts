import type { NextRequest } from "next/server";
import { workoutSummaryController } from "@/server/controllers/workout-summary.controller";

type WorkoutSummaryRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = async (
  request: NextRequest,
  context: WorkoutSummaryRouteContext,
) => {
  const { id } = await context.params;

  return workoutSummaryController.get(id);
};
