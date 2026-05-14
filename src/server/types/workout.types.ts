export const EXERCISE_SET_TYPES = [
  "warm-up",
  "recognition-activation",
  "working",
] as const;

export type ExerciseSetType = (typeof EXERCISE_SET_TYPES)[number];

export type ExerciseSetInput = {
  repetitions: number;
  weightKg: number;
  setType: ExerciseSetType;
  order: number;
};

export type ExerciseInput = {
  name: string;
  order: number;
  sets: ExerciseSetInput[];
};

export type WorkoutInput = {
  name: string;
  category?: string;
  date: Date;
  exercises: ExerciseInput[];
};

export type WorkoutFilters = {
  category?: string;
  fromDate?: Date;
  toDate?: Date;
  exerciseName?: string;
  search?: string;
};

