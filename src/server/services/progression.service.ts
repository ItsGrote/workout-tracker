import { progressionRepository } from "@/server/repositories/progression.repository";
import type {
  ProgressionPoint,
  ProgressionResponse,
} from "@/server/types/progression.types";
import type { ProgressionFiltersInput } from "@/server/validations/progression.validation";
import {
  calculateExerciseVolume,
  calculateWorkoutVolume,
  roundMetric,
} from "@/server/services/workout-metrics";

const formatDate = (date: Date) => date.toISOString();

const formatFilters = (filters: ProgressionFiltersInput) => ({
  exerciseName: filters.exerciseName,
  category: filters.category,
  fromDate: filters.fromDate?.toISOString(),
  toDate: filters.toDate?.toISOString(),
});

export const progressionService = {
  async getVolumeProgression(
    userId: string,
    filters: ProgressionFiltersInput,
  ): Promise<ProgressionResponse> {
    const workouts = await progressionRepository.findWorkoutVolumeSources({
      userId,
      exerciseName: filters.exerciseName,
      category: filters.category,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });

    const points: ProgressionPoint[] = filters.exerciseName
      ? workouts.flatMap((workout) =>
          workout.exercises.map((exercise) => ({
            date: formatDate(workout.date),
            label: exercise.name,
            totalVolume: calculateExerciseVolume(exercise),
            exerciseName: exercise.name,
            workoutCategory: workout.category,
          })),
        )
      : workouts.map((workout) => ({
          date: formatDate(workout.date),
          label: workout.name,
          totalVolume: calculateWorkoutVolume(workout),
          workoutCategory: workout.category,
        }));

    return {
      filters: formatFilters(filters),
      totalVolume: roundMetric(
        points.reduce((total, point) => total + point.totalVolume, 0),
      ),
      points,
    };
  },
};
