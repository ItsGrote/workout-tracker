import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { goalService } from "@/server/services/goal.service";
import {
  updateGoalSchema,
  userIdSchema,
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

const getUserId = (request: NextRequest) => {
  const parsed = userIdSchema.safeParse(request.headers.get("x-user-id"));

  if (!parsed.success) {
    throw new GoalControllerError("Missing or invalid x-user-id header", 400);
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

  if (error instanceof GoalControllerError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

export const goalController = {
  async get(request: NextRequest) {
    try {
      const userId = getUserId(request);
      const goals = await goalService.getGoals(userId);

      return NextResponse.json(goals);
    } catch (error) {
      return handleError(error);
    }
  },

  async update(request: NextRequest) {
    try {
      const userId = getUserId(request);
      const body = await parseJsonBody(request);
      const input = updateGoalSchema.parse(body);
      const goals = await goalService.updateGoals(userId, input);

      return NextResponse.json(goals);
    } catch (error) {
      return handleError(error);
    }
  },
};

