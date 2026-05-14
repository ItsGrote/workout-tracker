import { prisma } from "@/lib/prisma";

export type ProgressionQueryFilters = {
  userId: string;
  exerciseName?: string;
  category?: string;
  fromDate?: Date;
  toDate?: Date;
};

export const progressionRepository = {
  findWorkoutVolumeSources(filters: ProgressionQueryFilters) {
    return prisma.workout.findMany({
      where: {
        userId: filters.userId,
        category: filters.category,
        date: {
          gte: filters.fromDate,
          lte: filters.toDate,
        },
        exercises: filters.exerciseName
          ? {
              some: {
                name: { contains: filters.exerciseName, mode: "insensitive" },
              },
            }
          : undefined,
      },
      include: {
        exercises: {
          where: filters.exerciseName
            ? {
                name: {
                  contains: filters.exerciseName,
                  mode: "insensitive",
                },
              }
            : undefined,
          include: {
            sets: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { date: "asc" },
    });
  },
};

