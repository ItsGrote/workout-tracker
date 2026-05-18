import { consistencyService } from "@/server/services/consistency.service";
import {
  calculateWorkoutVolume,
  roundMetric,
} from "@/server/services/workout-metrics";
import { personalRecordService } from "@/server/services/personal-record.service";
import { workoutSummaryRepository } from "@/server/repositories/workout-summary.repository";
import type {
  WorkoutSummaryComparison,
  WorkoutSummaryResponse,
} from "@/server/types/workout-summary.types";

type SummaryWorkout = NonNullable<
  Awaited<ReturnType<typeof workoutSummaryRepository.findWorkoutById>>
>;

export class WorkoutSummaryServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const comparisonLabel = (workout: Pick<SummaryWorkout, "category" | "name">) =>
  workout.category ?? workout.name;

const buildNoPreviousComparison = (
  workout: SummaryWorkout,
): WorkoutSummaryComparison => ({
  message: `This is your first workout in this category`,
  percentageChange: null,
  previousLabel: null,
  previousVolume: null,
  status: "no_previous",
});

const buildComparison = (
  current: SummaryWorkout,
  previous: SummaryWorkout | null,
  currentVolume: number,
): WorkoutSummaryComparison => {
  if (!previous) {
    return buildNoPreviousComparison(current);
  }

  const previousVolume = calculateWorkoutVolume(previous);
  const previousLabel = comparisonLabel(previous);

  if (previousVolume <= 0) {
    return {
      message: `Previous ${previousLabel} workout had no volume to compare safely`,
      percentageChange: null,
      previousLabel,
      previousVolume,
      status: "previous_zero",
    };
  }

  const percentageChange = roundMetric(
    ((currentVolume - previousVolume) / previousVolume) * 100,
  );
  const sign = percentageChange > 0 ? "+" : "";

  return {
    message: `${sign}${percentageChange}% volume compared to your previous ${previousLabel} workout`,
    percentageChange,
    previousLabel,
    previousVolume,
    status: "compared",
  };
};

const findPreviousComparableWorkout = async (
  userId: string,
  workout: SummaryWorkout,
) => {
  const lookup = {
    currentCreatedAt: workout.createdAt,
    currentDate: workout.date,
    currentWorkoutId: workout.id,
    userId,
  };

  const previousByName = await workoutSummaryRepository.findPreviousByName({
    ...lookup,
    name: workout.name,
  });

  if (previousByName) {
    return previousByName;
  }

  if (!workout.category) {
    return null;
  }

  return workoutSummaryRepository.findPreviousByCategory({
    ...lookup,
    category: workout.category,
  });
};

export const workoutSummaryService = {
  async getSummary(
    userId: string,
    workoutId: string,
  ): Promise<WorkoutSummaryResponse> {
    const workout = await workoutSummaryRepository.findWorkoutById(
      workoutId,
      userId,
    );

    if (!workout) {
      throw new WorkoutSummaryServiceError("Workout not found", 404);
    }

    const [previousWorkout, personalRecords, consistency] = await Promise.all([
      findPreviousComparableWorkout(userId, workout),
      personalRecordService.getPersonalRecords(userId, { workoutId }),
      consistencyService.getConsistency(userId),
    ]);
    const totalVolume = calculateWorkoutVolume(workout);

    return {
      comparison: buildComparison(workout, previousWorkout, totalVolume),
      personalRecords: personalRecords.newRecords,
      streaks: {
        monthly:
          consistency.monthly.goal === null
            ? null
            : {
                goal: consistency.monthly.goal,
                trainedDays: consistency.monthly.trainedDays,
              },
        weekly:
          consistency.weekly.goal === null
            ? null
            : {
                goal: consistency.weekly.goal,
                trainedDays: consistency.weekly.trainedDays,
              },
      },
      totalVolume,
      workoutId,
    };
  },
};
