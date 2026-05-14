export type WeekStatus = "in_progress" | "completed" | "failed";

export type ConsistencyPeriod = {
  startDate: string;
  endDate: string;
  trainedDays: number;
  goal: number | null;
  remaining: number | null;
  completionPercentage: number;
  status: WeekStatus;
};

export type MonthlyConsistency = {
  startDate: string;
  endDate: string;
  trainedDays: number;
  goal: number | null;
  remaining: number | null;
  completionPercentage: number;
};

export type ConsistencyHistoryItem = ConsistencyPeriod;

export type ConsistencyResponse = {
  weekly: ConsistencyPeriod;
  monthly: MonthlyConsistency;
  completedWeekStreak: number;
  history: ConsistencyHistoryItem[];
};

