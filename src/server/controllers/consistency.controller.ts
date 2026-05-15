import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { requireAuthenticatedUserId } from "@/server/auth/session";
import { consistencyService } from "@/server/services/consistency.service";

class ConsistencyControllerError extends Error {
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

  if (error instanceof ConsistencyControllerError) {
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

export const consistencyController = {
  async get(request: NextRequest) {
    try {
      const userId = await getUserId();
      const consistency = await consistencyService.getConsistency(userId);

      return NextResponse.json(consistency);
    } catch (error) {
      return handleError(error);
    }
  },
};
