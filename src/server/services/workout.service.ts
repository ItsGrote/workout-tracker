import type {
  CreateWorkoutInput,
  UpdateWorkoutInput,
  WorkoutFiltersInput,
} from "@/server/validations/workout.validation";
import type { ExerciseSetType as PublicExerciseSetType } from "@/server/types/workout.types";
import {
  workoutRepository,
  type CreateWorkoutExerciseData,
} from "@/server/repositories/workout.repository";
import type { ExerciseSetType as PrismaExerciseSetType } from "@prisma/client";

const setTypeToPrisma: Record<PublicExerciseSetType, PrismaExerciseSetType> = {
  "warm-up": "WARM_UP",
  "recognition-activation": "RECOGNITION_ACTIVATION",
  working: "WORKING",
};

export class WorkoutServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const mapExercises = (
  exercises: CreateWorkoutInput["exercises"],
): CreateWorkoutExerciseData[] =>
  exercises.map((exercise) => ({
    name: exercise.name,
    order: exercise.order,
    sets: exercise.sets.map((set) => ({
      repetitions: set.repetitions,
      weightKg: set.weightKg,
      setType: setTypeToPrisma[set.setType],
      order: set.order,
    })),
  }));

const createDuplicateName = (name: string) => {
  const suffix = " (copy)";
  const maxLength = 80;

  if (name.length + suffix.length <= maxLength) {
    return `${name}${suffix}`;
  }

  return `${name.slice(0, maxLength - suffix.length)}${suffix}`;
};

export const workoutService = {
  create(userId: string, input: CreateWorkoutInput) {
    return workoutRepository.createWithExercises({
      userId,
      name: input.name,
      category: input.category ?? null,
      date: input.date,
      exercises: mapExercises(input.exercises),
    });
  },

  list(userId: string, filters: WorkoutFiltersInput) {
    return workoutRepository.findMany({
      userId,
      category: filters.category,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      exerciseName: filters.exerciseName,
      search: filters.name ?? filters.search,
    });
  },

  async findById(userId: string, id: string) {
    const workout = await workoutRepository.findById(id, userId);

    if (!workout) {
      throw new WorkoutServiceError("Workout not found", 404);
    }

    return workout;
  },

  async update(userId: string, id: string, input: UpdateWorkoutInput) {
    const workout = await workoutRepository.updateWithExercises(id, userId, {
      name: input.name,
      category: input.category,
      date: input.date,
      exercises: input.exercises ? mapExercises(input.exercises) : undefined,
    });

    if (!workout) {
      throw new WorkoutServiceError("Workout not found", 404);
    }

    return workout;
  },

  async delete(userId: string, id: string) {
    const result = await workoutRepository.delete(id, userId);

    if (result.count === 0) {
      throw new WorkoutServiceError("Workout not found", 404);
    }
  },

  async duplicate(userId: string, id: string) {
    const source = await workoutRepository.findById(id, userId);

    if (!source) {
      throw new WorkoutServiceError("Workout not found", 404);
    }

    return workoutRepository.createWithExercises({
      userId,
      name: createDuplicateName(source.name),
      category: source.category,
      date: new Date(),
      exercises: source.exercises.map((exercise) => ({
        name: exercise.name,
        order: exercise.order,
        sets: exercise.sets.map((set) => ({
          repetitions: set.repetitions,
          weightKg: set.weightKg,
          setType: set.setType,
          order: set.order,
        })),
      })),
    });
  },
};

