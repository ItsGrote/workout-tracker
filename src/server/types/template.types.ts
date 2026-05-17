import type { ExerciseSetType } from "@/server/types/workout.types";

export type ExerciseSetTemplateInput = {
  setType: ExerciseSetType;
  order: number;
};

export type ExerciseTemplateInput = {
  name: string;
  order: number;
  sets: ExerciseSetTemplateInput[];
};

export type WorkoutTemplateInput = {
  name: string;
  category?: string | null;
  exercises: ExerciseTemplateInput[];
};
