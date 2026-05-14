export type PersonalRecordMetric =
  | "highest-weight"
  | "best-repetitions"
  | "exercise-volume"
  | "workout-volume"
  | "category-workout-volume";

export type PersonalRecordScope = "exercise" | "workout" | "category";

export type PersonalRecord = {
  metric: PersonalRecordMetric;
  scope: PersonalRecordScope;
  value: number;
  date: string;
  message: string;
  exerciseName?: string;
  workoutName?: string;
  workoutCategory?: string | null;
  workoutId?: string;
  exerciseId?: string;
};

export type PersonalRecordEvent = PersonalRecord & {
  previousValue: number | null;
};

export type PersonalRecordsResponse = {
  filters: {
    exerciseName?: string;
    workoutCategory?: string;
    fromDate?: string;
    toDate?: string;
  };
  records: PersonalRecord[];
  newRecords: PersonalRecordEvent[];
};

