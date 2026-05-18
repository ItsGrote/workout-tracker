"use client";

import { useEffect, useMemo, useState } from "react";
import type { WorkoutResponse } from "./types";
import {
  createDraftId,
  createExerciseDraft,
  createSetDraft,
  draftToPayload,
  normalizeDraft,
  SET_TYPES,
  type ExerciseDraft,
  type PublicSetType,
  type SetDraft,
  validateWorkoutDraft,
  type WorkoutDraft,
  workoutToDraft,
} from "./workout-editor-utils";

type EditWorkoutModalProps = {
  workout: WorkoutResponse | null;
  onClose: () => void;
  onDeleted: (message: string) => void;
  onSaved: (message: string, workout: WorkoutResponse) => void;
};

type UnsavedAction = "close" | null;

const inputClassName =
  "min-h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 font-normal text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";

const selectClassName = inputClassName;

const primaryButtonClassName =
  "min-h-11 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55";

const secondaryButtonClassName =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-55";

const dangerButtonClassName =
  "min-h-11 rounded-md border border-[#d8aaa2] bg-[#fff8f5] px-4 py-2.5 text-sm font-semibold text-[#8a3326] transition hover:bg-[#fbece7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a3326]/20 disabled:cursor-not-allowed disabled:opacity-55";

const groupSetsByType = (sets: SetDraft[]) =>
  SET_TYPES.map((setType) => ({
    setType,
    sets: sets.filter((set) => set.setType === setType),
  }));

const readSaveError = async (response: Response) => {
  const fallbackMessage =
    "Could not save edits. Please review the workout and try again.";

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

export function EditWorkoutModal({
  workout,
  onClose,
  onDeleted,
  onSaved,
}: EditWorkoutModalProps) {
  const initialDraft = useMemo(
    () => (workout ? workoutToDraft(workout) : null),
    [workout],
  );
  const [draft, setDraft] = useState<WorkoutDraft | null>(initialDraft);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    initialDraft?.exercises[0]?.draftId ?? null,
  );
  const [selectedSetType, setSelectedSetType] =
    useState<PublicSetType>("working");
  const [pendingUnsavedAction, setPendingUnsavedAction] =
    useState<UnsavedAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!initialDraft) {
      setDraft(null);
      setSelectedExerciseId(null);
      return;
    }

    setDraft(initialDraft);
    setSelectedExerciseId(initialDraft.exercises[0]?.draftId ?? null);
    setSelectedSetType("working");
    setPendingUnsavedAction(null);
    setError(null);
  }, [initialDraft]);

  if (!workout || !draft || !initialDraft) {
    return null;
  }

  const isDirty = normalizeDraft(draft) !== normalizeDraft(initialDraft);
  const selectedExercise =
    draft.exercises.find((exercise) => exercise.draftId === selectedExerciseId) ??
    draft.exercises[0] ??
    null;

  const updateDraft = (update: Partial<WorkoutDraft>) => {
    setDraft((current) => (current ? { ...current, ...update } : current));
  };

  const updateExercise = (
    exerciseDraftId: string,
    update: Partial<ExerciseDraft>,
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            exercises: current.exercises.map((exercise) =>
              exercise.draftId === exerciseDraftId
                ? { ...exercise, ...update }
                : exercise,
            ),
          }
        : current,
    );
  };

  const updateSet = (
    exerciseDraftId: string,
    setDraftId: string,
    update: Partial<SetDraft>,
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            exercises: current.exercises.map((exercise) =>
              exercise.draftId === exerciseDraftId
                ? {
                    ...exercise,
                    sets: exercise.sets.map((set) =>
                      set.draftId === setDraftId ? { ...set, ...update } : set,
                    ),
                  }
                : exercise,
            ),
          }
        : current,
    );
  };

  const addExercise = () => {
    const exercise = {
      ...createExerciseDraft(`Exercise ${draft.exercises.length + 1}`),
      draftId: createDraftId(),
    };

    setDraft((current) =>
      current
        ? { ...current, exercises: [...current.exercises, exercise] }
        : current,
    );
    setSelectedExerciseId(exercise.draftId);
  };

  const removeExercise = (exerciseDraftId: string) => {
    const exercise = draft.exercises.find(
      (item) => item.draftId === exerciseDraftId,
    );

    if (!exercise) {
      return;
    }

    if (
      !window.confirm(
        `Delete ${exercise.name || "this exercise"} and all of its sets from this draft?`,
      )
    ) {
      return;
    }

    const nextExercises = draft.exercises.filter(
      (item) => item.draftId !== exerciseDraftId,
    );

    updateDraft({ exercises: nextExercises });
    setSelectedExerciseId(nextExercises[0]?.draftId ?? null);
  };

  const addSet = (exerciseDraftId: string, setType = selectedSetType) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            exercises: current.exercises.map((exercise) =>
              exercise.draftId === exerciseDraftId
                ? {
                    ...exercise,
                    sets: [...exercise.sets, { ...createSetDraft(), setType }],
                  }
                : exercise,
            ),
          }
        : current,
    );
  };

  const removeSet = (exerciseDraftId: string, setDraftId: string) => {
    if (!window.confirm("Delete this set from this draft?")) {
      return;
    }

    setDraft((current) =>
      current
        ? {
            ...current,
            exercises: current.exercises.map((exercise) =>
              exercise.draftId === exerciseDraftId
                ? {
                    ...exercise,
                    sets: exercise.sets.filter(
                      (set) => set.draftId !== setDraftId,
                    ),
                  }
                : exercise,
            ),
          }
        : current,
    );
  };

  const saveDraft = async () => {
    setError(null);
    const validationError = validateWorkoutDraft(draft);

    if (validationError) {
      setError(validationError);
      return false;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftToPayload(draft)),
      });

      if (!response.ok) {
        setError(await readSaveError(response));
        return false;
      }

      onSaved(
        "Workout edits saved. Charts are being refreshed.",
        (await response.json()) as WorkoutResponse,
      );
    } catch (caughtError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to save workout edits", caughtError);
      }

      setError(
        "Could not reach the server while saving. Please check your connection and try again.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }

    return true;
  };

  const deleteWorkout = async () => {
    setError(null);

    if (
      !window.confirm(
        "Deleting this workout will also delete all exercises and sets inside it. Do you want to continue?",
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        setError(await readSaveError(response));
        return;
      }

      onDeleted("Workout deleted. Dashboard data has been refreshed.");
    } catch (caughtError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to delete workout", caughtError);
      }

      setError(
        "Could not reach the server while deleting. Please check your connection and try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const requestClose = () => {
    if (isDirty) {
      setPendingUnsavedAction("close");
      return;
    }

    onClose();
  };

  const handleSaveAndClose = async () => {
    const saved = await saveDraft();

    if (saved) {
      setPendingUnsavedAction(null);
      onClose();
    }
  };

  const visibleSets =
    selectedExercise?.sets.filter((set) => set.setType === selectedSetType) ??
    [];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-3 sm:items-center sm:justify-center">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl shadow-[#1f3a45]/15 sm:max-w-5xl sm:rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
              Edit workout
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {draft.name || "Untitled workout"} - {draft.category || "Category"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Changes stay in this editor until you click Save edits.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={secondaryButtonClassName}
              onClick={requestClose}
              type="button"
            >
              Close
            </button>
            <button
              className={primaryButtonClassName}
              disabled={isSaving || isDeleting}
              onClick={saveDraft}
              type="button"
            >
              {isSaving ? "Saving..." : "Save edits"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Workout name
            <input
              className={inputClassName}
              onChange={(event) => updateDraft({ name: event.target.value })}
              value={draft.name}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Category
            <input
              className={inputClassName}
              onChange={(event) =>
                updateDraft({ category: event.target.value })
              }
              value={draft.category}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Date
            <input
              className={inputClassName}
              onChange={(event) => updateDraft({ date: event.target.value })}
              type="date"
              value={draft.date}
            />
          </label>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] p-3 shadow-sm shadow-[#1f3a45]/5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">Exercises</h3>
              <button
                className={primaryButtonClassName}
                onClick={addExercise}
                type="button"
              >
                + Add
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {draft.exercises.map((exercise) => (
                <button
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 ${
                    selectedExercise?.draftId === exercise.draftId
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold"
                      : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  }`}
                  key={exercise.draftId}
                  onClick={() => setSelectedExerciseId(exercise.draftId)}
                  type="button"
                >
                  {exercise.name || "Unnamed exercise"}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] p-4 shadow-sm shadow-[#1f3a45]/5">
            {selectedExercise ? (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
                    Exercise name
                    <input
                      className={inputClassName}
                      onChange={(event) =>
                        updateExercise(selectedExercise.draftId, {
                          name: event.target.value,
                        })
                      }
                      value={selectedExercise.name}
                    />
                  </label>
                  <button
                    className={dangerButtonClassName}
                    onClick={() => removeExercise(selectedExercise.draftId)}
                    type="button"
                  >
                    Delete exercise
                  </button>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold">Sets - set type</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {groupSetsByType(selectedExercise.sets).map((group) => (
                      <button
                        className={`min-h-11 rounded-lg border px-3 py-2 text-center text-sm leading-5 break-words transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 ${
                          selectedSetType === group.setType
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold"
                            : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                        }`}
                        key={group.setType}
                        onClick={() => setSelectedSetType(group.setType)}
                        type="button"
                      >
                        {group.setType} ({group.sets.length})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <h4 className="font-semibold">{selectedSetType} sets</h4>
                  <button
                    className={secondaryButtonClassName}
                    onClick={() => addSet(selectedExercise.draftId)}
                    type="button"
                  >
                    + Add set
                  </button>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  {visibleSets.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
                      No sets for this type yet.
                    </div>
                  ) : null}

                  {visibleSets.map((set) => (
                    <div
                      className="grid min-w-0 gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm shadow-[#1f3a45]/5 sm:grid-cols-[minmax(88px,0.7fr)_minmax(88px,0.7fr)] lg:grid-cols-[96px_96px_minmax(150px,1fr)_auto]"
                      key={set.draftId}
                    >
                      <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
                        Reps
                        <input
                          className={inputClassName}
                          min="1"
                          onChange={(event) =>
                            updateSet(selectedExercise.draftId, set.draftId, {
                              repetitions: event.target.value,
                            })
                          }
                          type="number"
                          value={set.repetitions}
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-2 text-sm font-medium">
                        Weight
                        <input
                          className={inputClassName}
                          min="0"
                          onChange={(event) =>
                            updateSet(selectedExercise.draftId, set.draftId, {
                              weightKg: event.target.value,
                            })
                          }
                          step="0.5"
                          type="number"
                          value={set.weightKg}
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-2 text-sm font-medium sm:col-span-2 lg:col-span-1">
                        Set type
                        <select
                          className={selectClassName}
                          onChange={(event) =>
                            updateSet(selectedExercise.draftId, set.draftId, {
                              setType: event.target.value as PublicSetType,
                            })
                          }
                          value={set.setType}
                        >
                          {SET_TYPES.map((setType) => (
                            <option key={setType} value={setType}>
                              {setType}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className={`${dangerButtonClassName} sm:self-end`}
                        onClick={() =>
                          removeSet(selectedExercise.draftId, set.draftId)
                        }
                        type="button"
                      >
                        Delete set
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
                Add an exercise to continue.
              </div>
            )}
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded border border-[#e1b8b8] bg-[#fff7f7] px-3 py-2 text-sm text-[#7b3b3b]">
            {error}
          </p>
        ) : null}

        <div className="sticky bottom-0 -mx-5 mt-6 border-t border-[var(--border)] bg-[var(--surface)] px-5 pb-1 pt-4">
          <button
            className={dangerButtonClassName}
            disabled={isSaving || isDeleting}
            onClick={deleteWorkout}
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete workout"}
          </button>
        </div>

        {pendingUnsavedAction ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl shadow-[#1f3a45]/15">
              <h3 className="text-lg font-semibold">Unsaved changes</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Save your edits before leaving, discard them, or cancel and keep
                editing.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <button
                  className={primaryButtonClassName}
                  disabled={isSaving}
                  onClick={handleSaveAndClose}
                  type="button"
                >
                  Save changes
                </button>
                <button
                  className={dangerButtonClassName}
                  onClick={onClose}
                  type="button"
                >
                  Discard changes
                </button>
                <button
                  className={secondaryButtonClassName}
                  onClick={() => setPendingUnsavedAction(null)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
