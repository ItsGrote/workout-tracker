import { prisma } from "@/lib/prisma";

export type WorkoutDateRange = {
  userId: string;
  fromDate?: Date;
  toDate?: Date;
};

export const consistencyRepository = {
  findWorkoutDatesInRange(filters: WorkoutDateRange) {
    return prisma.workout.findMany({
      where: {
        userId: filters.userId,
        date: {
          gte: filters.fromDate,
          lte: filters.toDate,
        },
      },
      select: { date: true },
      orderBy: { date: "asc" },
    });
  },

  findFirstWorkoutDate(userId: string) {
    return prisma.workout.findFirst({
      where: { userId },
      select: { date: true },
      orderBy: { date: "asc" },
    });
  },
};

