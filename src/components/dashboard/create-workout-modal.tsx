"use client";

import { FormEvent, useEffect, useState } from "react";
import type {
  CreateWorkoutInitialDraft,
  WorkoutResponse,
  WorkoutTemplateResponse,
} from "./types";
import {
  createDefaultWorkoutFormDraft,
  createExerciseDraft,
  createSetDraft,
  createWorkoutFormDraftFromTemplate,
  type CreateWorkoutFormDraft,
  type ExerciseDraft,
  type PublicSetType,
  type SetDraft,
} from "./workout-editor-utils";

type CreateWorkoutModalProps = {
  initialDraft?: CreateWorkoutInitialDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (workout: WorkoutResponse) => void;
  templates: WorkoutTemplateResponse[];
};

const readCreateError = async (
  response: Response,
  fallbackMessage = "Could not create workout. Check the fields and try again.",
) => {

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
  initialDraft,
  isOpen,
  onClose,
  onCreated,
  templates,
}: CreateWorkoutModalProps) {
  const [workoutName, setWorkoutName] = useState("Push A");
  const [category, setCategory] = useState("Chest");
  const [date, setDate] = useState(createDefaultWorkoutFormDraft().date);
  const [exercises, setExercises] = useState<ExerciseDraft[]>([
    createExerciseDraft(),
  ]);
  const [applyingTemplateId, setApplyingTemplateId] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyWorkoutDraft = (draft: CreateWorkoutFormDraft) => {
    setWorkoutName(draft.name);
    setCategory(draft.category);
    setDate(draft.date);
    setExercises(draft.exercises);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    applyWorkoutDraft(
      initialDraft
        ? createWorkoutFormDraftFromTemplate(initialDraft)
        : createDefaultWorkoutFormDraft(),
    );
    setError(null);
    setIsSaving(false);
    setApplyingTemplateId(null);
  }, [initialDraft, isOpen]);

  if (!isOpen) {
    return null;
  }

  const updateExercise = (
    exerciseId: string,
    update: Partial<ExerciseDraft>,
  ) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.draftId === exerciseId
          ? { ...exercise, ...update }
          : exercise,
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
        exercise.draftId === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.draftId === setId ? { ...set, ...update } : set,
              ),
            }
          : exercise,
      ),
    );
  };

  const addExercise = () => {
    setExercises((current) => [
      ...current,
      { ...createExerciseDraft(), name: `Exercise ${current.length + 1}` },
    ]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises((current) =>
      current.filter((exercise) => exercise.draftId !== exerciseId),
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.draftId === exerciseId
          ? { ...exercise, sets: [...exercise.sets, createSetDraft()] }
          : exercise,
      ),
    );
  };

  const applyTemplate = async (template: WorkoutTemplateResponse) => {
    setError(null);
    setApplyingTemplateId(template.id);

    try {
      const response = await fetch(`/api/templates/${template.id}/start`, {
        credentials: "include",
        method: "POST",
      });

      if (!response.ok) {
        setError(
          await readCreateError(
            response,
            "Could not apply template. It may have been deleted.",
          ),
        );
        return;
      }

      const draft = (await response.json()) as CreateWorkoutInitialDraft;
      applyWorkoutDraft(createWorkoutFormDraftFromTemplate(draft));
    } catch {
      setError("Could not reach the server while applying the template.");
    } finally {
      setApplyingTemplateId(null);
    }
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.draftId === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.draftId !== setId),
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

        <section className="mt-5 rounded border border-[var(--border)] bg-[#fbfcfd] p-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold">Use template</h3>
            <p className="text-sm text-[var(--muted)]">
              Fill this workout from a saved structure. Reps and weight stay
              empty until you complete the real workout.
            </p>
          </div>

          {templates.length === 0 ? (
            <p className="mt-3 rounded border border-dashed border-[var(--border)] bg-white p-3 text-sm text-[var(--muted)]">
              No templates yet.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {templates.map((template) => {
                const isApplying = applyingTemplateId === template.id;

                return (
                  <button
                    className="rounded border border-[var(--border)] bg-white px-3 py-2 text-left text-sm font-medium disabled:opacity-60"
                    disabled={isSaving || applyingTemplateId !== null}
                    key={template.id}
                    onClick={() => void applyTemplate(template)}
                    type="button"
                  >
                    {isApplying ? "Applying..." : template.name}
                    <span className="block text-xs font-normal text-[var(--muted)]">
                      {template.category ?? "No category"} ·{" "}
                      {template.exercises.length} exercises
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

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
              key={exercise.draftId}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
                  Exercise {exerciseIndex + 1}
                  <input
                    className="rounded border border-[var(--border)] bg-white px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                    onChange={(event) =>
                      updateExercise(exercise.draftId, {
                        name: event.target.value,
                      })
                    }
                    value={exercise.name}
                  />
                </label>
                <button
                  className="rounded border border-[#e1b8b8] px-3 py-2 text-sm font-medium text-[#7b3b3b]"
                  onClick={() => removeExercise(exercise.draftId)}
                  type="button"
                >
                  Remove exercise
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Sets</p>
                <button
                  className="rounded border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium"
                  onClick={() => addSet(exercise.draftId)}
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
                    key={set.draftId}
                  >
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Weight
                      <input
                        className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                        min="0"
                        onChange={(event) =>
                          updateSet(exercise.draftId, set.draftId, {
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
                          updateSet(exercise.draftId, set.draftId, {
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
                          updateSet(exercise.draftId, set.draftId, {
                            setType: event.target.value as PublicSetType,
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
                      onClick={() =>
                        removeSet(exercise.draftId, set.draftId)
                      }
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
          disabled={isSaving || applyingTemplateId !== null}
          type="submit"
        >
          {isSaving ? "Saving workout..." : "Save complete workout"}
        </button>
      </form>
    </div>
  );
}
