import { prisma } from "@/lib/prisma";

const includeVolumeTree = {
  exercises: {
    include: { sets: { orderBy: { order: "asc" as const } } },
    orderBy: { order: "asc" as const },
  },
};

export const workoutSummaryRepository = {
  findWorkoutById(id: string, userId: string) {
    return prisma.workout.findFirst({
      where: { id, userId },
      include: includeVolumeTree,
    });
  },

  findPreviousByCategory(userId: string, category: string, beforeDate: Date) {
    return prisma.workout.findFirst({
      where: {
        userId,
        category,
        date: { lt: beforeDate },
      },
      include: includeVolumeTree,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  },

  findPreviousByName(userId: string, name: string, beforeDate: Date) {
    return prisma.workout.findFirst({
      where: {
        userId,
        name,
        date: { lt: beforeDate },
      },
      include: includeVolumeTree,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  },
};
