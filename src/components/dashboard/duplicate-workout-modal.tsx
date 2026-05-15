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

    const response = await fetch(`/api/workouts/${selectedWorkoutId}/duplicate`, {
      method: "POST",
      credentials: "include",
    });

    setIsDuplicating(false);

    if (!response.ok) {
      setError("Could not duplicate workout. Please try again.");
      return;
    }

    const duplicated = (await response.json()) as WorkoutResponse;
    onDuplicated(duplicated);
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
            className="rounded border border-[var(--border)] px-3 py-1 text-sm"
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
                className={`rounded border p-3 text-sm ${
                  selectedWorkoutId === workout.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)]"
                }`}
                key={workout.id}
              >
                <input
                  className="mr-2"
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
          className="mt-5 w-full rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
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
