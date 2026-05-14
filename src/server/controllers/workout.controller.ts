import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { workoutService, WorkoutServiceError } from "@/server/services/workout.service";
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  userIdSchema,
  workoutFiltersSchema,
  workoutIdSchema,
} from "@/server/validations/workout.validation";

const parseJsonBody = async (request: NextRequest) => {
  try {
    return await request.json();
  } catch {
    throw new WorkoutServiceError("Invalid JSON body", 400);
  }
};

const getUserId = (request: NextRequest) => {
  const parsed = userIdSchema.safeParse(request.headers.get("x-user-id"));

  if (!parsed.success) {
    throw new WorkoutServiceError("Missing or invalid x-user-id header", 400);
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

  if (error instanceof WorkoutServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

const parseWorkoutId = (id: string) => workoutIdSchema.parse({ id }).id;

export const workoutController = {
  async create(request: NextRequest) {
    try {
      const userId = getUserId(request);
      const body = await parseJsonBody(request);
      const input = createWorkoutSchema.parse(body);
      const workout = await workoutService.create(userId, input);

      return NextResponse.json(workout, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  },

  async list(request: NextRequest) {
    try {
      const userId = getUserId(request);
      const filters = workoutFiltersSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );
      const workouts = await workoutService.list(userId, filters);

      return NextResponse.json(workouts);
    } catch (error) {
      return handleError(error);
    }
  },

  async findById(request: NextRequest, id: string) {
    try {
      const userId = getUserId(request);
      const workout = await workoutService.findById(userId, parseWorkoutId(id));

      return NextResponse.json(workout);
    } catch (error) {
      return handleError(error);
    }
  },

  async update(request: NextRequest, id: string) {
    try {
      const userId = getUserId(request);
      const body = await parseJsonBody(request);
      const input = updateWorkoutSchema.parse(body);
      const workout = await workoutService.update(
        userId,
        parseWorkoutId(id),
        input,
      );

      return NextResponse.json(workout);
    } catch (error) {
      return handleError(error);
    }
  },

  async delete(request: NextRequest, id: string) {
    try {
      const userId = getUserId(request);
      await workoutService.delete(userId, parseWorkoutId(id));

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return handleError(error);
    }
  },

  async duplicate(request: NextRequest, id: string) {
    try {
      const userId = getUserId(request);
      const workout = await workoutService.duplicate(userId, parseWorkoutId(id));

      return NextResponse.json(workout, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  },
};

