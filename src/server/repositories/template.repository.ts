import { prisma } from "@/lib/prisma";
import type { ExerciseSetType } from "@prisma/client";

export type CreateTemplateSetData = {
  setType: ExerciseSetType;
  order: number;
};

export type CreateTemplateExerciseData = {
  name: string;
  order: number;
  sets: CreateTemplateSetData[];
};

export type CreateWorkoutTemplateData = {
  userId: string;
  name: string;
  category?: string | null;
  exercises: CreateTemplateExerciseData[];
};

export type UpdateWorkoutTemplateData = Partial<
  Pick<CreateWorkoutTemplateData, "name" | "category">
> & {
  exercises?: CreateTemplateExerciseData[];
};

const includeTemplateTree = {
  exercises: {
    include: { sets: { orderBy: { order: "asc" as const } } },
    orderBy: { order: "asc" as const },
  },
};

export const templateRepository = {
  create(data: CreateWorkoutTemplateData) {
    return prisma.workoutTemplate.create({
      data: {
        userId: data.userId,
        name: data.name,
        category: data.category,
        exercises: {
          create: data.exercises.map((exercise) => ({
            name: exercise.name,
            order: exercise.order,
            sets: { create: exercise.sets },
          })),
        },
      },
      include: includeTemplateTree,
    });
  },

  findMany(userId: string) {
    return prisma.workoutTemplate.findMany({
      where: { userId },
      include: includeTemplateTree,
      orderBy: { updatedAt: "desc" },
    });
  },

  findById(id: string, userId: string) {
    return prisma.workoutTemplate.findFirst({
      where: { id, userId },
      include: includeTemplateTree,
    });
  },

  update(id: string, userId: string, data: UpdateWorkoutTemplateData) {
    return prisma.$transaction(async (tx) => {
      const template = await tx.workoutTemplate.findFirst({
        where: { id, userId },
        select: { id: true },
      });

      if (!template) {
        return null;
      }

      if (data.exercises) {
        const existingExercises = await tx.exerciseTemplate.findMany({
          where: { templateId: id },
          select: { id: true },
        });

        if (existingExercises.length > 0) {
          await tx.exerciseSetTemplate.deleteMany({
            where: {
              exerciseTemplateId: {
                in: existingExercises.map((exercise) => exercise.id),
              },
            },
          });
        }

        await tx.exerciseTemplate.deleteMany({ where: { templateId: id } });
      }

      return tx.workoutTemplate.update({
        where: { id },
        data: {
          name: data.name,
          category: data.category,
          exercises: data.exercises
            ? {
                create: data.exercises.map((exercise) => ({
                  name: exercise.name,
                  order: exercise.order,
                  sets: { create: exercise.sets },
                })),
              }
            : undefined,
        },
        include: includeTemplateTree,
      });
    });
  },

  delete(id: string, userId: string) {
    return prisma.workoutTemplate.deleteMany({
      where: { id, userId },
    });
  },
};
