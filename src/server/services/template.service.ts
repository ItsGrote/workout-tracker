import type { ExerciseSetType as PrismaExerciseSetType } from "@prisma/client";
import type { ExerciseSetType as PublicExerciseSetType } from "@/server/types/workout.types";
import {
  templateRepository,
  type CreateTemplateExerciseData,
} from "@/server/repositories/template.repository";
import type {
  CreateWorkoutTemplateInput,
  UpdateWorkoutTemplateInput,
} from "@/server/validations/template.validation";

const setTypeToPrisma: Record<PublicExerciseSetType, PrismaExerciseSetType> = {
  "warm-up": "WARM_UP",
  "recognition-activation": "RECOGNITION_ACTIVATION",
  working: "WORKING",
};

export class TemplateServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const mapExercises = (
  exercises: CreateWorkoutTemplateInput["exercises"],
): CreateTemplateExerciseData[] =>
  exercises.map((exercise) => ({
    name: exercise.name,
    order: exercise.order,
    sets: exercise.sets.map((set) => ({
      setType: setTypeToPrisma[set.setType],
      order: set.order,
    })),
  }));

export const templateService = {
  create(userId: string, input: CreateWorkoutTemplateInput) {
    return templateRepository.create({
      userId,
      name: input.name,
      category: input.category ?? null,
      exercises: mapExercises(input.exercises),
    });
  },

  list(userId: string) {
    return templateRepository.findMany(userId);
  },

  async findById(userId: string, id: string) {
    const template = await templateRepository.findById(id, userId);

    if (!template) {
      throw new TemplateServiceError("Template not found", 404);
    }

    return template;
  },

  async update(userId: string, id: string, input: UpdateWorkoutTemplateInput) {
    const template = await templateRepository.update(id, userId, {
      name: input.name,
      category: input.category,
      exercises: input.exercises ? mapExercises(input.exercises) : undefined,
    });

    if (!template) {
      throw new TemplateServiceError("Template not found", 404);
    }

    return template;
  },

  async delete(userId: string, id: string) {
    const result = await templateRepository.delete(id, userId);

    if (result.count === 0) {
      throw new TemplateServiceError("Template not found", 404);
    }
  },

  async start(userId: string, id: string) {
    const template = await templateRepository.findById(id, userId);

    if (!template) {
      throw new TemplateServiceError("Template not found", 404);
    }

    return {
      name: template.name,
      category: template.category,
      exercises: template.exercises.map((exercise) => ({
        name: exercise.name,
        order: exercise.order,
        sets: exercise.sets.map((set) => ({
          setType: set.setType,
          order: set.order,
        })),
      })),
    };
  },
};
