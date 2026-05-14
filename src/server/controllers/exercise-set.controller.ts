import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  exerciseSetService,
  ExerciseSetServiceError,
} from "@/server/services/exercise-set.service";
import {
  createExerciseSetSchema,
  exerciseIdSchema,
  setIdSchema,
  updateExerciseSetSchema,
  userIdSchema,
} from "@/server/validations/exercise.validation";

const parseJsonBody = async (request: NextRequest) => {
  try {
    return await request.json();
  } catch {
    throw new ExerciseSetServiceError("Invalid JSON body", 400);
  }
};

const getUserId = (request: NextRequest) => {
  const parsed = userIdSchema.safeParse(request.headers.get("x-user-id"));

  if (!parsed.success) {
    throw new ExerciseSetServiceError(
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

  if (error instanceof ExerciseSetServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

const parseExerciseId = (exerciseId: string) =>
  exerciseIdSchema.parse({ exerciseId }).exerciseId;

const parseSetId = (setId: string) => setIdSchema.parse({ setId }).setId;

export const exerciseSetController = {
  async create(request: NextRequest, exerciseId: string) {
    try {
      const userId = getUserId(request);
      const body = await parseJsonBody(request);
      const input = createExerciseSetSchema.parse(body);
      const set = await exerciseSetService.create(
        userId,
        parseExerciseId(exerciseId),
        input,
      );

      return NextResponse.json(set, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  },

  async listByExercise(request: NextRequest, exerciseId: string) {
    try {
      const userId = getUserId(request);
      const sets = await exerciseSetService.listByExercise(
        userId,
        parseExerciseId(exerciseId),
      );

      return NextResponse.json(sets);
    } catch (error) {
      return handleError(error);
    }
  },

  async update(request: NextRequest, exerciseId: string, setId: string) {
    try {
      const userId = getUserId(request);
      const body = await parseJsonBody(request);
      const input = updateExerciseSetSchema.parse(body);
      const set = await exerciseSetService.updateForExercise(
        userId,
        parseExerciseId(exerciseId),
        parseSetId(setId),
        input,
      );

      return NextResponse.json(set);
    } catch (error) {
      return handleError(error);
    }
  },

  async delete(request: NextRequest, exerciseId: string, setId: string) {
    try {
      const userId = getUserId(request);
      await exerciseSetService.deleteForExercise(
        userId,
        parseExerciseId(exerciseId),
        parseSetId(setId),
      );

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return handleError(error);
    }
  },
};
