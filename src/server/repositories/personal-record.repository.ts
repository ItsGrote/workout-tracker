import { prisma } from "@/lib/prisma";

export type PersonalRecordQueryFilters = {
  userId: string;
  exerciseName?: string;
  workoutCategory?: string;
  toDate?: Date;
};

export const personalRecordRepository = {
  findRecordSources(filters: PersonalRecordQueryFilters) {
    return prisma.workout.findMany({
      where: {
        userId: filters.userId,
        category: filters.workoutCategory,
        date: {
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
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });
  },
};

