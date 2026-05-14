export type ProgressionPoint = {
  date: string;
  label: string;
  totalVolume: number;
  exerciseName?: string;
  workoutCategory?: string | null;
};

export type ProgressionResponse = {
  totalVolume: number;
  points: ProgressionPoint[];
};

export type ConsistencyResponse = {
  weekly: {
    startDate: string;
    endDate: string;
    trainedDays: number;
    goal: number | null;
    remaining: number | null;
    completionPercentage: number;
    status: "in_progress" | "completed" | "failed";
  };
  monthly: {
    trainedDays: number;
    goal: number | null;
    remaining: number | null;
    completionPercentage: number;
  };
  completedWeekStreak: number;
};

export type GoalsResponse = {
  weeklyGoal: number | null;
  monthlyGoal: number | null;
};

export type PersonalRecord = {
  metric: string;
  scope: string;
  value: number;
  date: string;
  message: string;
  exerciseName?: string;
  workoutName?: string;
  workoutCategory?: string | null;
};

export type PersonalRecordsResponse = {
  records: PersonalRecord[];
  newRecords: PersonalRecord[];
};

export type DashboardData = {
  progression: ProgressionResponse;
  consistency: ConsistencyResponse;
  goals: GoalsResponse;
  personalRecords: PersonalRecordsResponse;
};

