import { goalRepository } from "@/server/repositories/goal.repository";
import type { TrainingGoalResponse } from "@/server/types/goal.types";
import type { UpdateGoalInput } from "@/server/validations/goal.validation";

const toResponse = (
  userId: string,
  goal: Awaited<ReturnType<typeof goalRepository.findByUserId>>,
): TrainingGoalResponse => ({
  userId,
  weeklyGoal: goal?.weeklyGoal ?? null,
  monthlyGoal: goal?.monthlyGoal ?? null,
  updatedAt: goal?.updatedAt.toISOString() ?? null,
});

export const goalService = {
  async getGoals(userId: string) {
    const goal = await goalRepository.findByUserId(userId);

    return toResponse(userId, goal);
  },

  async updateGoals(userId: string, input: UpdateGoalInput) {
    const goal = await goalRepository.save({
      userId,
      weeklyGoal: input.weeklyGoal,
      monthlyGoal: input.monthlyGoal,
    });

    return toResponse(userId, goal);
  },
};

