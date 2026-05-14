import { progressionRepository } from "@/server/repositories/progression.repository";
import type {
  ProgressionPoint,
  ProgressionResponse,
} from "@/server/types/progression.types";
import type { ProgressionFiltersInput } from "@/server/validations/progression.validation";

type WorkoutVolumeSource = Awaited<
  ReturnType<typeof progressionRepository.findWorkoutVolumeSources>
>[number];

type ExerciseVolumeSource = WorkoutVolumeSource["exercises"][number];
type SetVolumeSource = ExerciseVolumeSource["sets"][number];

const roundVolume = (volume: number) => Math.round(volume * 100) / 100;

const calculateSetVolume = (set: SetVolumeSource) =>
  Number(set.weightKg) * set.repetitions;

const calculateExerciseVolume = (exercise: ExerciseVolumeSource) =>
  roundVolume(
    exercise.sets.reduce((total, set) => total + calculateSetVolume(set), 0),
  );

const calculateWorkoutVolume = (workout: WorkoutVolumeSource) =>
  roundVolume(
    workout.exercises.reduce(
      (total, exercise) => total + calculateExerciseVolume(exercise),
      0,
    ),
  );

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
      totalVolume: roundVolume(
        points.reduce((total, point) => total + point.totalVolume, 0),
      ),
      points,
    };
  },
};

