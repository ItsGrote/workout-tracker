import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { requireAuthenticatedUserId } from "@/server/auth/session";
import { progressionService } from "@/server/services/progression.service";
import {
  progressionFiltersSchema,
} from "@/server/validations/progression.validation";

class ProgressionControllerError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const getUserId = async () => requireAuthenticatedUserId();

const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.issues },
      { status: 400 },
    );
  }

  if (error instanceof ProgressionControllerError) {
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

export const progressionController = {
  async getVolumeProgression(request: NextRequest) {
    try {
      const userId = await getUserId();
      const filters = progressionFiltersSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );
      const progression = await progressionService.getVolumeProgression(
        userId,
        filters,
      );

      return NextResponse.json(progression);
    } catch (error) {
      return handleError(error);
    }
  },
};
