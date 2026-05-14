import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  exerciseService,
  ExerciseServiceError,
} from "@/server/services/exercise.service";
import {
  createExerciseSchema,
  exerciseHistoryFiltersSchema,
  exerciseIdSchema,
  updateExerciseSchema,
  userIdSchema,
  workoutIdSchema,
} from "@/server/validations/exercise.validation";

const parseJsonBody = async (request: NextRequest) => {
  try {
    return await request.json();
  } catch {
    throw new ExerciseServiceError("Invalid JSON body", 400);
  }
};

const getUserId = (request: NextRequest) => {
  const parsed = userIdSchema.safeParse(request.headers.get("x-user-id"));

  if (!parsed.success) {
    throw new ExerciseServiceError("Missing or invalid x-user-id header", 400);
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

  if (error instanceof ExerciseServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

const parseWorkoutId = (workoutId: string) =>
  workoutIdSchema.parse({ workoutId }).workoutId;

const parseExerciseId = (exerciseId: string) =>
  exerciseIdSchema.parse({ exerciseId }).exerciseId;

export const exerciseController = {
  async create(request: NextRequest, workoutId: string) {
    try {
      const userId = getUserId(request);
      const body = await parseJsonBody(request);
      const input = createExerciseSchema.parse(body);
      const exercise = await exerciseService.create(
        userId,
        parseWorkoutId(workoutId),
        input,
      );

      return NextResponse.json(exercise, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  },

  async listByWorkout(request: NextRequest, workoutId: string) {
    try {
      const userId = getUserId(request);
      const exercises = await exerciseService.listByWorkout(
        userId,
        parseWorkoutId(workoutId),
      );

      return NextResponse.json(exercises);
    } catch (error) {
      return handleError(error);
    }
  },

  async findById(request: NextRequest, workoutId: string, exerciseId: string) {
    try {
      const userId = getUserId(request);
      const exercise = await exerciseService.findById(
        userId,
        parseExerciseId(exerciseId),
        parseWorkoutId(workoutId),
      );

      return NextResponse.json(exercise);
    } catch (error) {
      return handleError(error);
    }
  },

  async update(request: NextRequest, workoutId: string, exerciseId: string) {
    try {
      const userId = getUserId(request);
      const body = await parseJsonBody(request);
      const input = updateExerciseSchema.parse(body);
      const exercise = await exerciseService.update(
        userId,
        parseExerciseId(exerciseId),
        input,
        parseWorkoutId(workoutId),
      );

      return NextResponse.json(exercise);
    } catch (error) {
      return handleError(error);
    }
  },

  async delete(request: NextRequest, workoutId: string, exerciseId: string) {
    try {
      const userId = getUserId(request);
      await exerciseService.delete(
        userId,
        parseExerciseId(exerciseId),
        parseWorkoutId(workoutId),
      );

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return handleError(error);
    }
  },

  async history(request: NextRequest) {
    try {
      const userId = getUserId(request);
      const filters = exerciseHistoryFiltersSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );
      const exercises = await exerciseService.history(userId, filters);

      return NextResponse.json(exercises);
    } catch (error) {
      return handleError(error);
    }
  },
};
