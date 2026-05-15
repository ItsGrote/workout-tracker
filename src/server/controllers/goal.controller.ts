import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { requireAuthenticatedUserId } from "@/server/auth/session";
import { goalService } from "@/server/services/goal.service";
import {
  updateGoalSchema,
} from "@/server/validations/goal.validation";

class GoalControllerError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const parseJsonBody = async (request: NextRequest) => {
  try {
    return await request.json();
  } catch {
    throw new GoalControllerError("Invalid JSON body", 400);
  }
};

const getUserId = async () => requireAuthenticatedUserId();

const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.issues },
      { status: 400 },
    );
  }

  if (error instanceof GoalControllerError) {
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

export const goalController = {
  async get(request: NextRequest) {
    try {
      const userId = await getUserId();
      const goals = await goalService.getGoals(userId);

      return NextResponse.json(goals);
    } catch (error) {
      return handleError(error);
    }
  },

  async update(request: NextRequest) {
    try {
      const userId = await getUserId();
      const body = await parseJsonBody(request);
      const input = updateGoalSchema.parse(body);
      const goals = await goalService.updateGoals(userId, input);

      return NextResponse.json(goals);
    } catch (error) {
      return handleError(error);
    }
  },
};
