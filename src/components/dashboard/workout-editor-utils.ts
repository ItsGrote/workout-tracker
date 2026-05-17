import type {
  ApiSetType,
  CreateWorkoutInitialDraft,
  WorkoutResponse,
} from "./types";

export type PublicSetType = "warm-up" | "recognition-activation" | "working";

export type SetDraft = {
  draftId: string;
  id?: string;
  weightKg: string;
  repetitions: string;
  setType: PublicSetType;
};

export type ExerciseDraft = {
  draftId: string;
  id?: string;
  name: string;
  sets: SetDraft[];
};

export type WorkoutDraft = {
  id?: string;
  name: string;
  category: string;
  date: string;
  exercises: ExerciseDraft[];
};

export type CreateWorkoutFormDraft = {
  category: string;
  date: string;
  exercises: ExerciseDraft[];
  name: string;
};

export const SET_TYPES: PublicSetType[] = [
  "warm-up",
  "recognition-activation",
  "working",
];

export const createDraftId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const todayForInput = () => new Date().toISOString().slice(0, 10);

export const toPublicSetType = (setType: ApiSetType): PublicSetType => {
  if (setType === "WARM_UP" || setType === "warm-up") {
    return "warm-up";
  }

  if (
    setType === "RECOGNITION_ACTIVATION" ||
    setType === "recognition-activation"
  ) {
    return "recognition-activation";
  }

  return "working";
};

export const createSetDraft = (): SetDraft => ({
  draftId: createDraftId(),
  weightKg: "40",
  repetitions: "10",
  setType: "working",
});

export const createExerciseDraft = (name = "Bench Press"): ExerciseDraft => ({
  draftId: createDraftId(),
  name,
  sets: [createSetDraft()],
});

export const createDefaultWorkoutFormDraft = (): CreateWorkoutFormDraft => ({
  category: "Chest",
  date: todayForInput(),
  exercises: [createExerciseDraft()],
  name: "Push A",
});

export const createWorkoutFormDraftFromTemplate = (
  draft: CreateWorkoutInitialDraft,
): CreateWorkoutFormDraft => ({
  category: draft.category ?? "",
  date: todayForInput(),
  exercises: draft.exercises.map((exercise) => ({
    draftId: createDraftId(),
    name: exercise.name,
    sets: exercise.sets.map((set) => ({
      draftId: createDraftId(),
      repetitions: set.repetitions ?? "",
      setType: toPublicSetType(set.setType),
      weightKg: set.weightKg ?? "",
    })),
  })),
  name: draft.name,
});

export const workoutToDraft = (workout: WorkoutResponse): WorkoutDraft => ({
  id: workout.id,
  name: workout.name,
  category: workout.category ?? "",
  date: new Date(workout.date).toISOString().slice(0, 10),
  exercises: workout.exercises
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((exercise) => ({
      draftId: createDraftId(),
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((set) => ({
          draftId: createDraftId(),
          id: set.id,
          weightKg: String(set.weightKg),
          repetitions: String(set.repetitions),
          setType: toPublicSetType(set.setType),
        })),
    })),
});

export const draftToPayload = (draft: WorkoutDraft) => ({
  name: draft.name.trim(),
  category: draft.category.trim(),
  date: new Date(`${draft.date}T12:00:00.000Z`).toISOString(),
  exercises: draft.exercises.map((exercise, exerciseIndex) => ({
    name: exercise.name.trim(),
    order: exerciseIndex + 1,
    sets: exercise.sets.map((set, setIndex) => ({
      repetitions: Number(set.repetitions),
      weightKg: Number(set.weightKg),
      setType: set.setType,
      order: setIndex + 1,
    })),
  })),
});

export const validateWorkoutDraft = (draft: WorkoutDraft) => {
  if (!draft.name.trim()) {
    return "Workout name is required.";
  }

  if (!draft.category.trim()) {
    return "Workout category is required.";
  }

  if (!draft.date) {
    return "Workout date is required.";
  }

  if (draft.exercises.length === 0) {
    return "Add at least one exercise before saving.";
  }

  for (const [exerciseIndex, exercise] of draft.exercises.entries()) {
    if (!exercise.name.trim()) {
      return `Exercise ${exerciseIndex + 1} needs a name.`;
    }

    if (exercise.sets.length === 0) {
      return `${exercise.name} needs at least one set.`;
    }

    for (const [setIndex, set] of exercise.sets.entries()) {
      const weight = Number(set.weightKg);
      const repetitions = Number(set.repetitions);

      if (set.weightKg === "" || !Number.isFinite(weight) || weight < 0) {
        return `${exercise.name}, set ${setIndex + 1}: weight must be zero or higher.`;
      }

      if (
        set.repetitions === "" ||
        !Number.isInteger(repetitions) ||
        repetitions <= 0
      ) {
        return `${exercise.name}, set ${setIndex + 1}: repetitions must be a positive whole number.`;
      }

      if (!SET_TYPES.includes(set.setType)) {
        return `${exercise.name}, set ${setIndex + 1}: choose a valid set type.`;
      }
    }
  }

  return null;
};

export const normalizeDraft = (draft: WorkoutDraft) =>
  JSON.stringify(draftToPayload(draft));
