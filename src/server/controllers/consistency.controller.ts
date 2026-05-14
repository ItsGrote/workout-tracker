import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { consistencyService } from "@/server/services/consistency.service";
import { userIdSchema } from "@/server/validations/goal.validation";

class ConsistencyControllerError extends Error {
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
    throw new ConsistencyControllerError(
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

  if (error instanceof ConsistencyControllerError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

export const consistencyController = {
  async get(request: NextRequest) {
    try {
      const userId = getUserId(request);
      const consistency = await consistencyService.getConsistency(userId);

      return NextResponse.json(consistency);
    } catch (error) {
      return handleError(error);
    }
  },
};

