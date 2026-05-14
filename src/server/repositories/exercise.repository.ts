import { prisma } from "@/lib/prisma";
import type { ExerciseSetType, Prisma } from "@prisma/client";

export type CreateExerciseData = {
  workoutId: string;
  name: string;
  order: number;
};

export type CreateExerciseSetNestedData = {
  repetitions: number;
  weightKg: Prisma.Decimal | number | string;
  setType: ExerciseSetType;
  order: number;
};

export type CreateExerciseWithSetsData = CreateExerciseData & {
  sets?: CreateExerciseSetNestedData[];
};

export type UpdateExerciseData = Partial<
  Pick<CreateExerciseData, "name" | "order">
>;

export type ExerciseHistoryFilters = {
  userId: string;
  name?: string;
  fromDate?: Date;
  toDate?: Date;
};

export const exerciseRepository = {
  create(data: CreateExerciseData) {
    return prisma.exercise.create({ data });
  },

  createWithSets(data: CreateExerciseWithSetsData) {
    return prisma.exercise.create({
      data: {
        workoutId: data.workoutId,
        name: data.name,
        order: data.order,
        sets: data.sets ? { create: data.sets } : undefined,
      },
      include: { sets: { orderBy: { order: "asc" } } },
    });
  },

  findById(id: string) {
    return prisma.exercise.findUnique({
      where: { id },
      include: { sets: { orderBy: { order: "asc" } } },
    });
  },

  findByIdForUser(id: string, userId: string) {
    return prisma.exercise.findFirst({
      where: { id, workout: { userId } },
      include: {
        workout: true,
        sets: { orderBy: { order: "asc" } },
      },
    });
  },

  findByWorkoutId(workoutId: string) {
    return prisma.exercise.findMany({
      where: { workoutId },
      include: { sets: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });
  },

  findByWorkoutIdForUser(workoutId: string, userId: string) {
    return prisma.exercise.findMany({
      where: { workoutId, workout: { userId } },
      include: { sets: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });
  },

  findHistory(filters: ExerciseHistoryFilters) {
    return prisma.exercise.findMany({
      where: {
        name: filters.name
          ? { contains: filters.name, mode: "insensitive" }
          : undefined,
        workout: {
          userId: filters.userId,
          date: {
            gte: filters.fromDate,
            lte: filters.toDate,
          },
        },
      },
      include: {
        workout: true,
        sets: { orderBy: { order: "asc" } },
      },
      orderBy: [{ workout: { date: "desc" } }, { order: "asc" }],
    });
  },

  update(id: string, data: UpdateExerciseData) {
    return prisma.exercise.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.exercise.delete({ where: { id } });
  },
};
