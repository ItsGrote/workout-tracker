import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { progressionService } from "@/server/services/progression.service";
import {
  progressionFiltersSchema,
  userIdSchema,
} from "@/server/validations/progression.validation";

class ProgressionControllerError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const getUserId = (request: NextRequest) => {
  const parsed = userIdSchema.safeParse(request.headers.get("x-user-id"));

  if (!parsed.success) {
    throw new ProgressionControllerError(
      "Missing or invalid x-user-id header",
      400,
    );
  }

  return parsed.data;
};

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

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

export const progressionController = {
  async getVolumeProgression(request: NextRequest) {
    try {
      const userId = getUserId(request);
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

