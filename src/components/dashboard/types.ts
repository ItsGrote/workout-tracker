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
    startDate: string;
    endDate: string;
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
  metric:
    | "highest-weight"
    | "best-repetitions"
    | "exercise-volume"
    | "workout-volume"
    | "category-workout-volume";
  scope: string;
  value: number;
  date: string;
  message: string;
  exerciseName?: string;
  workoutName?: string;
  workoutCategory?: string | null;
  workoutId?: string;
  exerciseId?: string;
  previousValue?: number | null;
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
  workouts: WorkoutResponse[];
  templates: WorkoutTemplateResponse[];
};

export type ApiSetType =
  | "WARM_UP"
  | "RECOGNITION_ACTIVATION"
  | "WORKING"
  | "warm-up"
  | "recognition-activation"
  | "working";

export type WorkoutSetResponse = {
  id: string;
  repetitions: number;
  weightKg: number | string;
  setType: ApiSetType;
  order: number;
};

export type WorkoutExerciseResponse = {
  id: string;
  name: string;
  order: number;
  sets: WorkoutSetResponse[];
};

export type WorkoutResponse = {
  id: string;
  name: string;
  category: string | null;
  date: string;
  exercises: WorkoutExerciseResponse[];
};

export type WorkoutTemplateSetResponse = {
  id: string;
  setType: ApiSetType;
  order: number;
};

export type WorkoutTemplateExerciseResponse = {
  id: string;
  name: string;
  order: number;
  sets: WorkoutTemplateSetResponse[];
};

export type WorkoutTemplateResponse = {
  id: string;
  name: string;
  category: string | null;
  exercises: WorkoutTemplateExerciseResponse[];
};

export type CreateWorkoutInitialDraft = {
  name: string;
  category: string | null;
  exercises: {
    name: string;
    sets: {
      setType: ApiSetType;
      repetitions?: string;
      weightKg?: string;
    }[];
  }[];
};
