import type { ExerciseSetType as PrismaExerciseSetType } from "@prisma/client";
import { exerciseRepository } from "@/server/repositories/exercise.repository";
import { exerciseSetRepository } from "@/server/repositories/exercise-set.repository";
import type { ExerciseSetType as PublicExerciseSetType } from "@/server/types/workout.types";
import type {
  CreateExerciseSetInput,
  UpdateExerciseSetInput,
} from "@/server/validations/exercise.validation";

const setTypeToPrisma: Record<PublicExerciseSetType, PrismaExerciseSetType> = {
  "warm-up": "WARM_UP",
  "recognition-activation": "RECOGNITION_ACTIVATION",
  working: "WORKING",
};

export class ExerciseSetServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const mapSetInput = (input: CreateExerciseSetInput) => ({
  repetitions: input.repetitions,
  weightKg: input.weightKg,
  setType: setTypeToPrisma[input.setType],
  order: input.order,
});

const mapSetUpdate = (input: UpdateExerciseSetInput) => ({
  repetitions: input.repetitions,
  weightKg: input.weightKg,
  setType: input.setType ? setTypeToPrisma[input.setType] : undefined,
  order: input.order,
});

export const exerciseSetService = {
  async create(
    userId: string,
    exerciseId: string,
    input: CreateExerciseSetInput,
  ) {
    const exercise = await exerciseRepository.findByIdForUser(exerciseId, userId);

    if (!exercise) {
      throw new ExerciseSetServiceError("Exercise not found", 404);
    }

    return exerciseSetRepository.create({
      exerciseId,
      ...mapSetInput(input),
    });
  },

  async listByExercise(userId: string, exerciseId: string) {
    const exercise = await exerciseRepository.findByIdForUser(exerciseId, userId);

    if (!exercise) {
      throw new ExerciseSetServiceError("Exercise not found", 404);
    }

    return exerciseSetRepository.findByExerciseIdForUser(exerciseId, userId);
  },

  async update(userId: string, setId: string, input: UpdateExerciseSetInput) {
    const set = await exerciseSetRepository.findByIdForUser(setId, userId);

    if (!set) {
      throw new ExerciseSetServiceError("Exercise set not found", 404);
    }

    return exerciseSetRepository.update(setId, mapSetUpdate(input));
  },

  async updateForExercise(
    userId: string,
    exerciseId: string,
    setId: string,
    input: UpdateExerciseSetInput,
  ) {
    const set = await exerciseSetRepository.findByIdForUser(setId, userId);

    if (!set || set.exerciseId !== exerciseId) {
      throw new ExerciseSetServiceError("Exercise set not found", 404);
    }

    return exerciseSetRepository.update(setId, mapSetUpdate(input));
  },

  async delete(userId: string, setId: string) {
    const set = await exerciseSetRepository.findByIdForUser(setId, userId);

    if (!set) {
      throw new ExerciseSetServiceError("Exercise set not found", 404);
    }

    await exerciseSetRepository.delete(setId);
  },

  async deleteForExercise(userId: string, exerciseId: string, setId: string) {
    const set = await exerciseSetRepository.findByIdForUser(setId, userId);

    if (!set || set.exerciseId !== exerciseId) {
      throw new ExerciseSetServiceError("Exercise set not found", 404);
    }

    await exerciseSetRepository.delete(setId);
  },
};
