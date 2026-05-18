import { useEffect, useMemo, useState } from "react";
import type { WorkoutResponse } from "./types";

type WorkoutManagementCardProps = {
  workouts: WorkoutResponse[];
  onCreate: () => void;
  onDuplicate: () => void;
  onEdit: (workout: WorkoutResponse) => void;
  onSaveAsTemplate: (workout: WorkoutResponse) => void;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(new Date(date));

const WORKOUT_PAGE_SIZE = 6;

export function WorkoutManagementCard({
  workouts,
  onCreate,
  onDuplicate,
  onEdit,
  onSaveAsTemplate,
}: WorkoutManagementCardProps) {
  const [visibleCount, setVisibleCount] = useState(WORKOUT_PAGE_SIZE);
  const sortedWorkouts = useMemo(
    () =>
      workouts
        .slice()
        .sort(
          (first, second) =>
            new Date(second.date).getTime() - new Date(first.date).getTime(),
        ),
    [workouts],
  );
  const visibleWorkouts = sortedWorkouts.slice(0, visibleCount);
  const hasMoreWorkouts = visibleCount < sortedWorkouts.length;

  useEffect(() => {
    setVisibleCount(WORKOUT_PAGE_SIZE);
  }, [workouts]);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm shadow-[#1f3a45]/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Workouts</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Create, duplicate or edit saved workout structure.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
            onClick={onCreate}
            type="button"
          >
            + Create workout
          </button>
          <button
            className="rounded border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
            disabled={workouts.length === 0}
            onClick={onDuplicate}
            type="button"
          >
            Duplicate workout
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {visibleWorkouts.length > 0 ? (
          visibleWorkouts.map((workout) => (
            <div
              className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm shadow-[#1f3a45]/5 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] sm:flex-row sm:items-center sm:justify-between"
              key={workout.id}
            >
              <div>
                <p className="font-medium">
                  {workout.name} - {workout.category ?? "No category"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {formatDate(workout.date)} · {workout.exercises.length} exercises
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded border border-[var(--border)] px-3 py-2 text-sm font-medium"
                  onClick={() => onSaveAsTemplate(workout)}
                  type="button"
                >
                  Save as template
                </button>
                <button
                  className="rounded border border-[var(--border)] px-3 py-2 text-sm font-medium"
                  onClick={() => onEdit(workout)}
                  type="button"
                >
                  Edit workout
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--accent-soft)] p-4 text-sm text-[var(--muted)]">
            No workouts yet. Create your first workout to start tracking volume.
          </p>
        )}
      </div>

      {hasMoreWorkouts ? (
        <button
          className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium shadow-sm shadow-[#1f3a45]/5 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20"
          onClick={() =>
            setVisibleCount((current) =>
              Math.min(current + WORKOUT_PAGE_SIZE, sortedWorkouts.length),
            )
          }
          type="button"
        >
          View more
        </button>
      ) : null}
    </section>
  );
}
