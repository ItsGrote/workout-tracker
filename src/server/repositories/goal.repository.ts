import { prisma } from "@/lib/prisma";

export type SaveGoalData = {
  userId: string;
  weeklyGoal?: number | null;
  monthlyGoal?: number | null;
};

export const goalRepository = {
  findByUserId(userId: string) {
    return prisma.trainingGoal.findUnique({
      where: { userId },
    });
  },

  save(data: SaveGoalData) {
    return prisma.trainingGoal.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        weeklyGoal: data.weeklyGoal ?? null,
        monthlyGoal: data.monthlyGoal ?? null,
      },
      update: {
        weeklyGoal: data.weeklyGoal,
        monthlyGoal: data.monthlyGoal,
      },
    });
  },
};

