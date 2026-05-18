export type AnalyticsTarget = "workout" | "exercise";
export type WorkoutFilter = "name" | "category";
export type RangeOption = "7d" | "30d" | "90d" | "1y" | "all";
export type ExerciseMetric = "volume" | "max-weight" | "average-reps";

export type AnalyticsRequestState = {
  exerciseMetric: ExerciseMetric;
  range: RangeOption;
  selectedValue: string;
  target: AnalyticsTarget | "";
  workoutFilter: WorkoutFilter;
};

export type AnalyticsOptions = {
  exerciseNames: string[];
  workoutCategories: string[];
  workoutNames: string[];
};

export const buildAnalyticsSearchParams = ({
  exerciseMetric,
  range,
  selectedValue,
  target,
  workoutFilter,
}: AnalyticsRequestState) => {
  const params = new URLSearchParams({
    range,
    exerciseMetric,
  });

  if (target) {
    params.set("target", target);
  }

  if (target === "workout") {
    params.set("workoutFilter", workoutFilter);
  }

  if (selectedValue) {
    params.set("selectedValue", selectedValue);
  }

  return params;
};

export const getSelectedOptions = (
  options: AnalyticsOptions,
  target: AnalyticsTarget | "",
  workoutFilter: WorkoutFilter,
) => {
  if (target === "exercise") {
    return options.exerciseNames;
  }

  if (target === "workout") {
    return workoutFilter === "name"
      ? options.workoutNames
      : options.workoutCategories;
  }

  return [];
};
