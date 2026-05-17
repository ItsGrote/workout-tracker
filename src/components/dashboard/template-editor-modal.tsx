"use client";

import { FormEvent, useEffect, useState } from "react";
import type {
  ApiSetType,
  WorkoutTemplateResponse,
} from "@/components/dashboard/types";

type SetType = "warm-up" | "recognition-activation" | "working";

type TemplateSetDraft = {
  id: string;
  setType: SetType;
};

type TemplateExerciseDraft = {
  id: string;
  name: string;
  sets: TemplateSetDraft[];
};

type TemplateEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (template: WorkoutTemplateResponse) => void;
  template: WorkoutTemplateResponse | null;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const normalizeSetType = (setType: ApiSetType): SetType => {
  if (setType === "WARM_UP") {
    return "warm-up";
  }

  if (setType === "RECOGNITION_ACTIVATION") {
    return "recognition-activation";
  }

  if (setType === "WORKING") {
    return "working";
  }

  return setType;
};

const createSet = (): TemplateSetDraft => ({
  id: createId(),
  setType: "working",
});

const createExercise = (): TemplateExerciseDraft => ({
  id: createId(),
  name: "Exercise",
  sets: [createSet()],
});

const readTemplateError = async (response: Response) => {
  const fallback = "Could not save template. Check the fields and try again.";

  try {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await response.json()) as {
        error?: string;
        issues?: { message?: string }[];
      };

      return body.issues?.[0]?.message ?? body.error ?? fallback;
    }

    return (await response.text()) || fallback;
  } catch {
    return fallback;
  }
};

export function TemplateEditorModal({
  isOpen,
  onClose,
  onSaved,
  template,
}: TemplateEditorModalProps) {
  const [name, setName] = useState("New template");
  const [category, setCategory] = useState("General");
  const [exercises, setExercises] = useState<TemplateExerciseDraft[]>([
    createExercise(),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(template?.name ?? "New template");
    setCategory(template?.category ?? "General");
    setExercises(
      template
        ? template.exercises.map((exercise) => ({
            id: createId(),
            name: exercise.name,
            sets: exercise.sets.map((set) => ({
              id: createId(),
              setType: normalizeSetType(set.setType),
            })),
          }))
        : [createExercise()],
    );
    setError(null);
    setIsSaving(false);
  }, [isOpen, template]);

  if (!isOpen) {
    return null;
  }

  const updateExercise = (
    exerciseId: string,
    update: Partial<TemplateExerciseDraft>,
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
    update: Partial<TemplateSetDraft>,
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

  const validateForm = () => {
    if (!name.trim()) {
      return "Template name is required.";
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
      const response = await fetch(
        template ? `/api/templates/${template.id}` : "/api/templates",
        {
          body: JSON.stringify({
            name: name.trim(),
            category: category.trim() || null,
            exercises: exercises.map((exercise, exerciseIndex) => ({
              name: exercise.name.trim(),
              order: exerciseIndex + 1,
              sets: exercise.sets.map((set, setIndex) => ({
                setType: set.setType,
                order: setIndex + 1,
              })),
            })),
          }),
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: template ? "PATCH" : "POST",
        },
      );

      if (!response.ok) {
        setError(await readTemplateError(response));
        return;
      }

      onSaved((await response.json()) as WorkoutTemplateResponse);
      onClose();
    } catch {
      setError("Could not reach the server while saving the template.");
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
            <h2 className="text-xl font-semibold">
              {template ? "Edit template" : "Create template"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Templates store exercise structure only. Weight and reps are filled
              when you save a real workout.
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Template name
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Category
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Exercises</h3>
          <button
            className="rounded bg-[var(--foreground)] px-3 py-2 text-sm font-medium text-white"
            onClick={() =>
              setExercises((current) => [...current, createExercise()])
            }
            type="button"
          >
            + Add exercise
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
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
                      updateExercise(exercise.id, { name: event.target.value })
                    }
                    value={exercise.name}
                  />
                </label>
                <button
                  className="rounded border border-[#e1b8b8] px-3 py-2 text-sm font-medium text-[#7b3b3b]"
                  onClick={() =>
                    setExercises((current) =>
                      current.filter((item) => item.id !== exercise.id),
                    )
                  }
                  type="button"
                >
                  Remove exercise
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Set types</p>
                <button
                  className="rounded border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium"
                  onClick={() =>
                    updateExercise(exercise.id, {
                      sets: [...exercise.sets, createSet()],
                    })
                  }
                  type="button"
                >
                  + Add set
                </button>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {exercise.sets.map((set, setIndex) => (
                  <div
                    className="grid gap-3 rounded border border-[var(--border)] bg-white p-3 sm:grid-cols-[1fr_auto]"
                    key={set.id}
                  >
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Set {setIndex + 1}
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
                      onClick={() =>
                        updateExercise(exercise.id, {
                          sets: exercise.sets.filter(
                            (item) => item.id !== set.id,
                          ),
                        })
                      }
                      type="button"
                    >
                      Remove set
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
          {isSaving ? "Saving template..." : "Save template"}
        </button>
      </form>
    </div>
  );
}
