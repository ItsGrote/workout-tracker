import { progressionAnalyticsRepository } from "@/server/repositories/progression-analytics.repository";
import type {
  ExerciseAnalyticsInsights,
  ExerciseAnalyticsMetric,
  ProgressionAnalyticsOptions,
  ProgressionAnalyticsPoint,
  ProgressionAnalyticsResponse,
  WorkoutAnalyticsInsights,
} from "@/server/types/progression-analytics.types";
import type { ProgressionAnalyticsQueryInput } from "@/server/validations/progression-analytics.validation";

type AnalyticsWorkoutSource = Awaited<
  ReturnType<typeof progressionAnalyticsRepository.findSources>
>[number];

type AnalyticsExerciseSource = AnalyticsWorkoutSource["exercises"][number];
type AnalyticsSetSource = AnalyticsExerciseSource["sets"][number];

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_POINTS = 180;

const rangeToFromDate = (range: ProgressionAnalyticsQueryInput["range"]) => {
  const now = new Date();

  if (range === "all") {
    return undefined;
  }

  const daysByRange = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  } as const;

  return new Date(now.getTime() - daysByRange[range] * DAY_MS);
};

const normalizeOption = (value: string | null) => value?.trim() ?? "";

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((first, second) =>
    first.localeCompare(second),
  );

const roundMetric = (value: number) => Math.round(value * 100) / 100;

const calculateSetVolume = (set: AnalyticsSetSource) =>
  Number(set.weightKg) * set.repetitions;

const calculateExerciseVolume = (exercise: AnalyticsExerciseSource) =>
  roundMetric(
    exercise.sets.reduce((total, set) => total + calculateSetVolume(set), 0),
  );

const calculateWorkoutVolume = (workout: AnalyticsWorkoutSource) =>
  roundMetric(
    workout.exercises.reduce(
      (total, exercise) => total + calculateExerciseVolume(exercise),
      0,
    ),
  );

const sortSources = (workouts: AnalyticsWorkoutSource[]) =>
  [...workouts].sort((first, second) => {
    const dateDelta = first.date.getTime() - second.date.getTime();

    if (dateDelta !== 0) {
      return dateDelta;
    }

    const createdAtDelta =
      first.createdAt.getTime() - second.createdAt.getTime();

    if (createdAtDelta !== 0) {
      return createdAtDelta;
    }

    return first.id.localeCompare(second.id);
  });

const createOptions = (
  sources: Awaited<ReturnType<typeof progressionAnalyticsRepository.findOptions>>,
): ProgressionAnalyticsOptions => ({
  workoutNames: uniqueSorted(sources.map((workout) => normalizeOption(workout.name))),
  workoutCategories: uniqueSorted(
    sources.map((workout) => normalizeOption(workout.category)),
  ),
  exerciseNames: uniqueSorted(
    sources.flatMap((workout) =>
      workout.exercises.map((exercise) => normalizeOption(exercise.name)),
    ),
  ),
});

const limitPoints = (points: ProgressionAnalyticsPoint[]) =>
  points.length > MAX_POINTS ? points.slice(points.length - MAX_POINTS) : points;

const buildProgressionComparison = (
  firstValue: number | undefined,
  latestValue: number | undefined,
  readyMessage: (percentageChange: number) => string,
) => {
  if (firstValue === undefined || latestValue === undefined) {
    return {
      firstValue: firstValue ?? null,
      latestValue: latestValue ?? null,
      message: "Complete more workouts to see progression trends",
      percentageChange: null,
      status: "not_enough_data" as const,
    };
  }

  if (firstValue <= 0) {
    return {
      firstValue,
      latestValue,
      message: "First recorded value has no volume to compare safely",
      percentageChange: null,
      status: "previous_zero" as const,
    };
  }

  const percentageChange = roundMetric(
    ((latestValue - firstValue) / firstValue) * 100,
  );

  return {
    firstValue,
    latestValue,
    message: readyMessage(percentageChange),
    percentageChange,
    status: "ready" as const,
  };
};

const createWorkoutPoints = (
  workouts: AnalyticsWorkoutSource[],
): ProgressionAnalyticsPoint[] =>
  limitPoints(
    sortSources(workouts).map((workout) => ({
      date: workout.date.toISOString(),
      label: workout.name,
      volume: calculateWorkoutVolume(workout),
    })),
  );

const createExercisePoints = (
  workouts: AnalyticsWorkoutSource[],
): ProgressionAnalyticsPoint[] =>
  limitPoints(
    sortSources(workouts).map((workout) => {
      const sets = workout.exercises.flatMap((exercise) => exercise.sets);
      const volume = workout.exercises.reduce(
        (total, exercise) => total + calculateExerciseVolume(exercise),
        0,
      );
      const maxWeight = sets.length
        ? Math.max(...sets.map((set) => Number(set.weightKg)))
        : 0;
      const averageReps = sets.length
        ? sets.reduce((total, set) => total + set.repetitions, 0) / sets.length
        : 0;
      const averageWeight = sets.length
        ? sets.reduce((total, set) => total + Number(set.weightKg), 0) /
          sets.length
        : 0;

      return {
        date: workout.date.toISOString(),
        label: workout.exercises[0]?.name ?? "Exercise",
        volume: roundMetric(volume),
        maxWeight: roundMetric(maxWeight),
        averageReps: roundMetric(averageReps),
        averageWeight: roundMetric(averageWeight),
      };
    }),
  );

const sum = (values: number[]) =>
  roundMetric(values.reduce((total, value) => total + value, 0));

const average = (values: number[]) =>
  values.length ? roundMetric(sum(values) / values.length) : 0;

const metricValue = (
  point: ProgressionAnalyticsPoint,
  metric: ExerciseAnalyticsMetric,
) => {
  if (metric === "max-weight") {
    return point.maxWeight ?? 0;
  }

  if (metric === "average-reps") {
    return point.averageReps ?? 0;
  }

  return point.volume;
};

const createWorkoutInsights = (
  points: ProgressionAnalyticsPoint[],
): WorkoutAnalyticsInsights => {
  const volumes = points.map((point) => point.volume);
  const firstPoint = points[0];
  const latestPoint = points.at(-1);

  return {
    averageVolume: average(volumes),
    highestVolume: volumes.length ? Math.max(...volumes) : 0,
    kind: "workout",
    progression: buildProgressionComparison(
      points.length > 1 ? firstPoint?.volume : undefined,
      points.length > 1 ? latestPoint?.volume : undefined,
      (percentageChange) => {
        const sign = percentageChange > 0 ? "+" : "";
        return `${sign}${percentageChange}% progression since first workout`;
      },
    ),
    totalAccumulatedVolume: sum(volumes),
    workoutsAnalyzed: points.length,
  };
};

const createExerciseInsights = (
  points: ProgressionAnalyticsPoint[],
  metric: ExerciseAnalyticsMetric,
): ExerciseAnalyticsInsights => {
  const volumes = points.map((point) => point.volume);
  const weights = points.flatMap((point) =>
    typeof point.averageWeight === "number" ? [point.averageWeight] : [],
  );
  const firstPoint = points[0];
  const latestPoint = points.at(-1);

  return {
    averageWeight: average(weights),
    highestWeight: points.length
      ? Math.max(...points.map((point) => point.maxWeight ?? 0))
      : 0,
    kind: "exercise",
    progression: buildProgressionComparison(
      points.length > 1 && firstPoint ? metricValue(firstPoint, metric) : undefined,
      points.length > 1 && latestPoint
        ? metricValue(latestPoint, metric)
        : undefined,
      (percentageChange) => {
        const sign = percentageChange > 0 ? "+" : "";
        return `${sign}${percentageChange}% progression`;
      },
    ),
    sessionsAnalyzed: points.length,
    totalAccumulatedVolume: sum(volumes),
  };
};

export const progressionAnalyticsService = {
  async getAnalytics(
    userId: string,
    query: ProgressionAnalyticsQueryInput,
  ): Promise<ProgressionAnalyticsResponse> {
    const options = createOptions(
      await progressionAnalyticsRepository.findOptions(userId),
    );

    if (!query.target || !query.selectedValue) {
      return {
        options,
        points: [],
        insights: null,
        filters: {
          target: query.target,
          workoutFilter: query.workoutFilter,
          selectedValue: query.selectedValue,
          range: query.range,
          exerciseMetric: query.exerciseMetric,
        },
      };
    }

    const workouts = await progressionAnalyticsRepository.findSources({
      userId,
      fromDate: rangeToFromDate(query.range),
      workoutName:
        query.target === "workout" && query.workoutFilter === "name"
          ? query.selectedValue
          : undefined,
      workoutCategory:
        query.target === "workout" && query.workoutFilter === "category"
          ? query.selectedValue
          : undefined,
      exerciseName:
        query.target === "exercise" ? query.selectedValue : undefined,
    });
    const points =
      query.target === "exercise"
        ? createExercisePoints(workouts)
        : createWorkoutPoints(workouts);

    return {
      options,
      points,
      insights:
        query.target === "exercise"
          ? createExerciseInsights(points, query.exerciseMetric)
          : createWorkoutInsights(points),
      filters: {
        target: query.target,
        workoutFilter: query.workoutFilter,
        selectedValue: query.selectedValue,
        range: query.range,
        exerciseMetric: query.exerciseMetric,
      },
    };
  },
};
