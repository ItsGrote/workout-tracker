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

export type ProgressionAnalyticsComparison = {
  firstValue: number | null;
  latestValue: number | null;
  message: string;
  percentageChange: number | null;
  status: "ready" | "not_enough_data" | "previous_zero";
};

export type WorkoutAnalyticsInsights = {
  averageVolume: number;
  highestVolume: number;
  kind: "workout";
  progression: ProgressionAnalyticsComparison;
  totalAccumulatedVolume: number;
  workoutsAnalyzed: number;
};

export type ExerciseAnalyticsInsights = {
  averageWeight: number;
  highestWeight: number;
  kind: "exercise";
  progression: ProgressionAnalyticsComparison;
  sessionsAnalyzed: number;
  totalAccumulatedVolume: number;
};

export type ProgressionAnalyticsInsights =
  | WorkoutAnalyticsInsights
  | ExerciseAnalyticsInsights;

export type ProgressionAnalyticsOptions = {
  workoutNames: string[];
  workoutCategories: string[];
  exerciseNames: string[];
};

export type ProgressionAnalyticsResponse = {
  options: ProgressionAnalyticsOptions;
  points: ProgressionAnalyticsPoint[];
  insights: ProgressionAnalyticsInsights | null;
  filters: {
    target?: ProgressionAnalyticsTarget;
    workoutFilter?: WorkoutAnalyticsFilter;
    selectedValue?: string;
    range: ProgressionAnalyticsRange;
    exerciseMetric: ExerciseAnalyticsMetric;
  };
};
