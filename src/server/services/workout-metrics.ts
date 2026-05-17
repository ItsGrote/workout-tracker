export type VolumeSetSource = {
  repetitions: number;
  weightKg: { toString(): string } | number | string;
};

export type VolumeExerciseSource = {
  sets: VolumeSetSource[];
};

export type VolumeWorkoutSource = {
  exercises: VolumeExerciseSource[];
};

export const roundMetric = (value: number) => Math.round(value * 100) / 100;

export const calculateSetVolume = (set: VolumeSetSource) =>
  Number(set.weightKg) * set.repetitions;

export const calculateExerciseVolume = (exercise: VolumeExerciseSource) =>
  roundMetric(
    exercise.sets.reduce((total, set) => total + calculateSetVolume(set), 0),
  );

export const calculateWorkoutVolume = (workout: VolumeWorkoutSource) =>
  roundMetric(
    workout.exercises.reduce(
      (total, exercise) => total + calculateExerciseVolume(exercise),
      0,
    ),
  );
