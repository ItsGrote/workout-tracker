export type ProgressionAnalyticsTarget = "workout" | "exercise";

export type WorkoutAnalyticsFilter = "name" | "category";

export type ExerciseAnalyticsMetric =
  | "volume"
  | "max-weight"
  | "average-reps";

export type ProgressionAnalyticsRange =
  | "7d"
  | "30d"
  | "90d"
  | "1y"
  | "all";

export type ProgressionAnalyticsPoint = {
  date: string;
  label: string;
  volume: number;
  maxWeight?: number;
  averageReps?: number;
  averageWeight?: number;
};

export type ProgressionAnalyticsOptions = {
  workoutNames: string[];
  workoutCategories: string[];
  exerciseNames: string[];
};

export type ProgressionAnalyticsResponse = {
  options: ProgressionAnalyticsOptions;
  points: ProgressionAnalyticsPoint[];
  filters: {
    target?: ProgressionAnalyticsTarget;
    workoutFilter?: WorkoutAnalyticsFilter;
    selectedValue?: string;
    range: ProgressionAnalyticsRange;
    exerciseMetric: ExerciseAnalyticsMetric;
  };
};
