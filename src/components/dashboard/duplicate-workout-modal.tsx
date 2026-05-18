"use client";

import { useEffect, useState } from "react";
import type { WorkoutResponse } from "./types";

type DuplicateWorkoutModalProps = {
  isOpen: boolean;
  workouts: WorkoutResponse[];
  onClose: () => void;
  onDuplicated: (workout: WorkoutResponse) => void;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date));

const secondaryButtonClassName =
  "min-h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20";

const primaryButtonClassName =
  "min-h-11 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55";

const radioClassName = "h-4 w-4 accent-[var(--accent)]";

const readDuplicateError = async (response: Response) => {
  const fallbackMessage = "Could not duplicate workout. Please try again.";

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

export function DuplicateWorkoutModal({
  isOpen,
  workouts,
  onClose,
  onDuplicated,
}: DuplicateWorkoutModalProps) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(
    workouts[0]?.id ?? "",
  );
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !selectedWorkoutId && workouts[0]) {
      setSelectedWorkoutId(workouts[0].id);
    }
  }, [isOpen, selectedWorkoutId, workouts]);

  if (!isOpen) {
    return null;
  }

  const duplicateWorkout = async () => {
    if (!selectedWorkoutId) {
      setError("Select a workout to duplicate.");
      return;
    }

    setError(null);
    setIsDuplicating(true);

    try {
      const response = await fetch(
        `/api/workouts/${selectedWorkoutId}/duplicate`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        setError(await readDuplicateError(response));
        return;
      }

      const duplicated = (await response.json()) as WorkoutResponse;
      onDuplicated(duplicated);
    } catch {
      setError(
        "Could not reach the server while duplicating. Please try again.",
      );
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 sm:items-center sm:justify-center">
      <section className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl sm:max-w-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Duplicate workout</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Choose a previous workout. The copy will use today's date.
            </p>
          </div>
          <button
            className={secondaryButtonClassName}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {workouts.length > 0 ? (
            workouts.map((workout) => (
              <label
                className={`rounded-md border p-3 text-sm transition ${
                  selectedWorkoutId === workout.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                }`}
                key={workout.id}
              >
                <input
                  className={`${radioClassName} mr-2`}
                  checked={selectedWorkoutId === workout.id}
                  onChange={() => setSelectedWorkoutId(workout.id)}
                  type="radio"
                />
                <span className="font-medium">{workout.name}</span>
                <span className="ml-2 text-[var(--muted)]">
                  {workout.category ?? "No category"} - {formatDate(workout.date)}
                </span>
              </label>
            ))
          ) : (
            <p className="rounded border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
              No previous workouts available to duplicate.
            </p>
          )}
        </div>

        {error ? (
          <p className="mt-4 rounded border border-[#e1b8b8] bg-[#fff7f7] px-3 py-2 text-sm text-[#7b3b3b]">
            {error}
          </p>
        ) : null}

        <button
          className={`mt-5 w-full ${primaryButtonClassName}`}
          disabled={isDuplicating || workouts.length === 0}
          onClick={duplicateWorkout}
          type="button"
        >
          {isDuplicating ? "Duplicating..." : "Duplicate and edit"}
        </button>
      </section>
    </div>
  );
}
