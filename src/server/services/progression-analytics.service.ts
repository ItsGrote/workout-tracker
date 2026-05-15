import { progressionAnalyticsRepository } from "@/server/repositories/progression-analytics.repository";
import type {
  ProgressionAnalyticsOptions,
  ProgressionAnalyticsPoint,
  ProgressionAnalyticsResponse,
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

const createWorkoutPoints = (
  workouts: AnalyticsWorkoutSource[],
): ProgressionAnalyticsPoint[] =>
  limitPoints(
    workouts.map((workout) => ({
      date: workout.date.toISOString(),
      label: workout.name,
      volume: calculateWorkoutVolume(workout),
    })),
  );

const createExercisePoints = (
  workouts: AnalyticsWorkoutSource[],
): ProgressionAnalyticsPoint[] =>
  limitPoints(
    workouts.map((workout) => {
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

    return {
      options,
      points:
        query.target === "exercise"
          ? createExercisePoints(workouts)
          : createWorkoutPoints(workouts),
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
