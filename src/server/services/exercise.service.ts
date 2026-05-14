import type { ExerciseSetType as PrismaExerciseSetType } from "@prisma/client";
import {
  exerciseRepository,
  type CreateExerciseSetNestedData,
} from "@/server/repositories/exercise.repository";
import { workoutRepository } from "@/server/repositories/workout.repository";
import type { ExerciseSetType as PublicExerciseSetType } from "@/server/types/workout.types";
import type {
  CreateExerciseInput,
  ExerciseHistoryFiltersInput,
  UpdateExerciseInput,
} from "@/server/validations/exercise.validation";

const setTypeToPrisma: Record<PublicExerciseSetType, PrismaExerciseSetType> = {
  "warm-up": "WARM_UP",
  "recognition-activation": "RECOGNITION_ACTIVATION",
  working: "WORKING",
};

export class ExerciseServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const mapSets = (
  sets: NonNullable<CreateExerciseInput["sets"]>,
): CreateExerciseSetNestedData[] =>
  sets.map((set) => ({
    repetitions: set.repetitions,
    weightKg: set.weightKg,
    setType: setTypeToPrisma[set.setType],
    order: set.order,
  }));

export const exerciseService = {
  async create(userId: string, workoutId: string, input: CreateExerciseInput) {
    const workout = await workoutRepository.findById(workoutId, userId);

    if (!workout) {
      throw new ExerciseServiceError("Workout not found", 404);
    }

    return exerciseRepository.createWithSets({
      workoutId,
      name: input.name,
      order: input.order,
      sets: input.sets ? mapSets(input.sets) : undefined,
    });
  },

  async listByWorkout(userId: string, workoutId: string) {
    const workout = await workoutRepository.findById(workoutId, userId);

    if (!workout) {
      throw new ExerciseServiceError("Workout not found", 404);
    }

    return exerciseRepository.findByWorkoutIdForUser(workoutId, userId);
  },

  async findById(userId: string, exerciseId: string, workoutId?: string) {
    const exercise = await exerciseRepository.findByIdForUser(exerciseId, userId);

    if (!exercise || (workoutId && exercise.workoutId !== workoutId)) {
      throw new ExerciseServiceError("Exercise not found", 404);
    }

    return exercise;
  },

  async update(
    userId: string,
    exerciseId: string,
    input: UpdateExerciseInput,
    workoutId?: string,
  ) {
    const exercise = await exerciseRepository.findByIdForUser(exerciseId, userId);

    if (!exercise || (workoutId && exercise.workoutId !== workoutId)) {
      throw new ExerciseServiceError("Exercise not found", 404);
    }

    return exerciseRepository.update(exerciseId, input);
  },

  async delete(userId: string, exerciseId: string, workoutId?: string) {
    const exercise = await exerciseRepository.findByIdForUser(exerciseId, userId);

    if (!exercise || (workoutId && exercise.workoutId !== workoutId)) {
      throw new ExerciseServiceError("Exercise not found", 404);
    }

    await exerciseRepository.delete(exerciseId);
  },

  history(userId: string, filters: ExerciseHistoryFiltersInput) {
    return exerciseRepository.findHistory({
      userId,
      name: filters.name,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });
  },
};
