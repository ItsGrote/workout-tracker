import { prisma } from "@/lib/prisma";
import type { ExerciseSetType, Prisma } from "@prisma/client";

export type CreateExerciseSetData = {
  exerciseId: string;
  repetitions: number;
  weightKg: Prisma.Decimal | number | string;
  setType: ExerciseSetType;
  order: number;
};

export type UpdateExerciseSetData = Partial<
  Pick<CreateExerciseSetData, "repetitions" | "weightKg" | "setType" | "order">
>;

export const exerciseSetRepository = {
  create(data: CreateExerciseSetData) {
    return prisma.exerciseSet.create({ data });
  },

  findById(id: string) {
    return prisma.exerciseSet.findUnique({ where: { id } });
  },

  findByIdForUser(id: string, userId: string) {
    return prisma.exerciseSet.findFirst({
      where: {
        id,
        exercise: {
          workout: { userId },
        },
      },
      include: {
        exercise: {
          include: { workout: true },
        },
      },
    });
  },

  findByExerciseId(exerciseId: string) {
    return prisma.exerciseSet.findMany({
      where: { exerciseId },
      orderBy: { order: "asc" },
    });
  },

  findByExerciseIdForUser(exerciseId: string, userId: string) {
    return prisma.exerciseSet.findMany({
      where: {
        exerciseId,
        exercise: {
          workout: { userId },
        },
      },
      orderBy: { order: "asc" },
    });
  },

  update(id: string, data: UpdateExerciseSetData) {
    return prisma.exerciseSet.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.exerciseSet.delete({ where: { id } });
  },
};
