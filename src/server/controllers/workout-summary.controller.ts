import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAuthenticatedUserId } from "@/server/auth/session";
import {
  workoutSummaryService,
  WorkoutSummaryServiceError,
} from "@/server/services/workout-summary.service";
import { workoutSummaryIdSchema } from "@/server/validations/workout-summary.validation";

const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.issues },
      { status: 400 },
    );
  }

  if (error instanceof WorkoutSummaryServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error && "statusCode" in error) {
    return NextResponse.json(
      { error: error.message },
      { status: Number(error.statusCode) },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

export const workoutSummaryController = {
  async get(id: string) {
    try {
      const userId = await requireAuthenticatedUserId();
      const { id: workoutId } = workoutSummaryIdSchema.parse({ id });
      const summary = await workoutSummaryService.getSummary(userId, workoutId);

      return NextResponse.json(summary);
    } catch (error) {
      return handleError(error);
    }
  },
};
