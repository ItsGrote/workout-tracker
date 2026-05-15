"use client";

import { FormEvent, useState } from "react";
import type { WorkoutResponse } from "./types";

type SetType = "warm-up" | "recognition-activation" | "working";

type SetDraft = {
  id: string;
  weightKg: string;
  repetitions: string;
  setType: SetType;
};

type ExerciseDraft = {
  id: string;
  name: string;
  sets: SetDraft[];
};

type CreateWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (workout: WorkoutResponse) => void;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const todayForInput = () => new Date().toISOString().slice(0, 10);

const createSet = (): SetDraft => ({
  id: createId(),
  weightKg: "40",
  repetitions: "10",
  setType: "working",
});

const createExercise = (): ExerciseDraft => ({
  id: createId(),
  name: "Bench Press",
  sets: [createSet()],
});

const readCreateError = async (response: Response) => {
  const fallbackMessage = "Could not create workout. Check the fields and try again.";

  try {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await response.json()) as {
        error?: string;
        issues?: { message?: string }[];
      };

      return body.issues?.[0]?.message ?? body.error ?? fallbackMessage;
    }

    const text = await response.text();
    return text || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export function CreateWorkoutModal({
  isOpen,
  onClose,
  onCreated,
}: CreateWorkoutModalProps) {
  const [workoutName, setWorkoutName] = useState("Push A");
  const [category, setCategory] = useState("Chest");
  const [date, setDate] = useState(todayForInput());
  const [exercises, setExercises] = useState<ExerciseDraft[]>([
    createExercise(),
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const updateExercise = (
    exerciseId: string,
    update: Partial<ExerciseDraft>,
  ) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, ...update } : exercise,
      ),
    );
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    update: Partial<SetDraft>,
  ) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, ...update } : set,
              ),
            }
          : exercise,
      ),
    );
  };

  const addExercise = () => {
    setExercises((current) => [
      ...current,
      { ...createExercise(), name: `Exercise ${current.length + 1}` },
    ]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises((current) =>
      current.filter((exercise) => exercise.id !== exerciseId),
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, createSet()] }
          : exercise,
      ),
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise,
      ),
    );
  };

  const validateForm = () => {
    if (!workoutName.trim()) {
      return "Workout name is required.";
    }

    if (!category.trim()) {
      return "Workout category is required.";
    }

    if (!date) {
      return "Workout date is required.";
    }

    if (exercises.length === 0) {
      return "Add at least one exercise before saving.";
    }

    for (const [exerciseIndex, exercise] of exercises.entries()) {
      if (!exercise.name.trim()) {
        return `Exercise ${exerciseIndex + 1} needs a name.`;
      }

      if (exercise.sets.length === 0) {
        return `${exercise.name} needs at least one set.`;
      }

      for (const [setIndex, set] of exercise.sets.entries()) {
        const parsedWeight = Number(set.weightKg);
        const parsedRepetitions = Number(set.repetitions);

        if (
          set.weightKg === "" ||
          !Number.isFinite(parsedWeight) ||
          parsedWeight < 0
        ) {
          return `${exercise.name}, set ${setIndex + 1}: weight must be zero or higher.`;
        }

        if (
          set.repetitions === "" ||
          !Number.isInteger(parsedRepetitions) ||
          parsedRepetitions <= 0
        ) {
          return `${exercise.name}, set ${setIndex + 1}: repetitions must be a positive whole number.`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workoutName.trim(),
          category: category.trim(),
          date: new Date(`${date}T12:00:00.000Z`).toISOString(),
          exercises: exercises.map((exercise, exerciseIndex) => ({
            name: exercise.name.trim(),
            order: exerciseIndex + 1,
            sets: exercise.sets.map((set, setIndex) => ({
              repetitions: Number(set.repetitions),
              weightKg: Number(set.weightKg),
              setType: set.setType,
              order: setIndex + 1,
            })),
          })),
        }),
      });

      if (!response.ok) {
        setError(await readCreateError(response));
        return;
      }

      onCreated((await response.json()) as WorkoutResponse);
      onClose();
    } catch (caughtError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to create workout", caughtError);
      }

      setError(
        "Could not reach the server while creating the workout. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 sm:items-center sm:justify-center">
      <form
        className="max-h-[92vh] w-full overflow-y-auto rounded border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl sm:max-w-3xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Create workout</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Add as many exercises and sets as this session needs.
            </p>
          </div>
          <button
            className="rounded border border-[var(--border)] px-3 py-1 text-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-1">
            Workout name
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              onChange={(event) => setWorkoutName(event.target.value)}
              value={workoutName}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-1">
            Category
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-1">
            Date
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              onChange={(event) => setDate(event.target.value)}
              type="date"
              value={date}
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Exercises</h3>
          <button
            className="rounded bg-[var(--foreground)] px-3 py-2 text-sm font-medium text-white"
            onClick={addExercise}
            type="button"
          >
            + Add exercise
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {exercises.length === 0 ? (
            <div className="rounded border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
              No exercises yet. Add at least one exercise to save this workout.
            </div>
          ) : null}

          {exercises.map((exercise, exerciseIndex) => (
            <section
              className="rounded border border-[var(--border)] bg-[#fbfcfd] p-4"
              key={exercise.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
                  Exercise {exerciseIndex + 1}
                  <input
                    className="rounded border border-[var(--border)] bg-white px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                    onChange={(event) =>
                      updateExercise(exercise.id, {
                        name: event.target.value,
                      })
                    }
                    value={exercise.name}
                  />
                </label>
                <button
                  className="rounded border border-[#e1b8b8] px-3 py-2 text-sm font-medium text-[#7b3b3b]"
                  onClick={() => removeExercise(exercise.id)}
                  type="button"
                >
                  Remove exercise
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Sets</p>
                <button
                  className="rounded border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium"
                  onClick={() => addSet(exercise.id)}
                  type="button"
                >
                  + Add set
                </button>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {exercise.sets.length === 0 ? (
                  <div className="rounded border border-dashed border-[var(--border)] bg-white p-3 text-sm text-[var(--muted)]">
                    No sets yet. Add at least one set for this exercise.
                  </div>
                ) : null}

                {exercise.sets.map((set, setIndex) => (
                  <div
                    className="grid gap-3 rounded border border-[var(--border)] bg-white p-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]"
                    key={set.id}
                  >
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Weight
                      <input
                        className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                        min="0"
                        onChange={(event) =>
                          updateSet(exercise.id, set.id, {
                            weightKg: event.target.value,
                          })
                        }
                        step="0.5"
                        type="number"
                        value={set.weightKg}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Reps
                      <input
                        className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                        min="0"
                        onChange={(event) =>
                          updateSet(exercise.id, set.id, {
                            repetitions: event.target.value,
                          })
                        }
                        type="number"
                        value={set.repetitions}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Set type
                      <select
                        className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                        onChange={(event) =>
                          updateSet(exercise.id, set.id, {
                            setType: event.target.value as SetType,
                          })
                        }
                        value={set.setType}
                      >
                        <option value="warm-up">warm-up</option>
                        <option value="recognition-activation">
                          recognition-activation
                        </option>
                        <option value="working">working</option>
                      </select>
                    </label>
                    <button
                      className="rounded border border-[#e1b8b8] px-3 py-2 text-sm font-medium text-[#7b3b3b] sm:self-end"
                      onClick={() => removeSet(exercise.id, set.id)}
                      type="button"
                    >
                      Remove set {setIndex + 1}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {error ? (
          <p className="mt-4 rounded border border-[#e1b8b8] bg-[#fff7f7] px-3 py-2 text-sm text-[#7b3b3b]">
            {error}
          </p>
        ) : null}

        <button
          className="mt-5 w-full rounded bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Saving workout..." : "Save complete workout"}
        </button>
      </form>
    </div>
  );
}
