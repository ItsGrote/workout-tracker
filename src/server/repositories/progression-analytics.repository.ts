import { prisma } from "@/lib/prisma";

export type ProgressionAnalyticsSourceFilters = {
  userId: string;
  fromDate?: Date;
  workoutName?: string;
  workoutCategory?: string;
  exerciseName?: string;
};

export const progressionAnalyticsRepository = {
  findOptions(userId: string) {
    return prisma.workout.findMany({
      where: { userId },
      select: {
        name: true,
        category: true,
        exercises: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });
  },

  findSources(filters: ProgressionAnalyticsSourceFilters) {
    return prisma.workout.findMany({
      where: {
        userId: filters.userId,
        name: filters.workoutName,
        category: filters.workoutCategory,
        date: {
          gte: filters.fromDate,
        },
        exercises: filters.exerciseName
          ? {
              some: {
                name: { equals: filters.exerciseName, mode: "insensitive" },
              },
            }
          : undefined,
      },
      include: {
        exercises: {
          where: filters.exerciseName
            ? {
                name: { equals: filters.exerciseName, mode: "insensitive" },
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
      orderBy: [{ date: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });
  },
};
