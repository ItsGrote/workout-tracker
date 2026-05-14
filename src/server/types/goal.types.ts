export type TrainingGoal = {
  weeklyGoal: number | null;
  monthlyGoal: number | null;
};

export type TrainingGoalResponse = TrainingGoal & {
  userId: string;
  updatedAt: string | null;
};

