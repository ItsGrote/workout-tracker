"use client";

import type { PersonalRecord, WorkoutSummaryResponse } from "./types";

type WorkoutSummaryPopupProps = {
  onClose: () => void;
  summary: WorkoutSummaryResponse | null;
};

const metricLabel: Record<PersonalRecord["metric"], string> = {
  "highest-weight": "max weight",
  "best-repetitions": "reps",
  "exercise-volume": "volume",
  "workout-volume": "workout volume",
  "category-workout-volume": "category volume",
};

export function WorkoutSummaryPopup({
  onClose,
  summary,
}: WorkoutSummaryPopupProps) {
  if (!summary) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 p-4">
      <section className="w-full max-w-xl rounded border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
          Workout complete
        </p>
        <h2 className="mt-3 text-2xl font-semibold">
          Your session is saved.
        </h2>

        <div className="mt-5 grid gap-3">
          <div className="rounded border border-[var(--border)] bg-[var(--accent-soft)] p-4">
            <p className="text-sm font-semibold">Volume comparison</p>
            <p className="mt-1 text-lg font-semibold">
              {summary.comparison.message}
            </p>
          </div>

          <div className="rounded border border-[var(--border)] p-4">
            <p className="text-sm font-semibold">Total volume</p>
            <p className="mt-1 text-2xl font-semibold">
              {summary.totalVolume}
            </p>
          </div>

          <div className="rounded border border-[var(--border)] p-4">
            <p className="text-sm font-semibold">
              {summary.personalRecords.length} personal records achieved
            </p>
            <ul className="mt-3 grid gap-2 text-sm">
              {summary.personalRecords.length > 0 ? (
                summary.personalRecords.map((record) => (
                  <li
                    className="rounded bg-[#fbfcfd] px-3 py-2"
                    key={`${record.workoutId}-${record.exerciseId}-${record.metric}-${record.value}`}
                  >
                    <span className="font-semibold">
                      {record.exerciseName ?? record.workoutName ?? "Workout"}:
                    </span>{" "}
                    {metricLabel[record.metric]}
                  </li>
                ))
              ) : (
                <li className="text-[var(--muted)]">
                  No new records this time. Still logged, still moving.
                </li>
              )}
            </ul>
          </div>

          {summary.streaks.weekly || summary.streaks.monthly ? (
            <div className="rounded border border-[var(--border)] p-4">
              <p className="text-sm font-semibold">Active streaks</p>
              <div className="mt-3 grid gap-2 text-sm">
                {summary.streaks.weekly ? (
                  <p>
                    Weekly streak:{" "}
                    <span className="font-semibold">
                      {summary.streaks.weekly.trainedDays}/
                      {summary.streaks.weekly.goal}
                    </span>
                  </p>
                ) : null}
                {summary.streaks.monthly ? (
                  <p>
                    Monthly streak:{" "}
                    <span className="font-semibold">
                      {summary.streaks.monthly.trainedDays}/
                      {summary.streaks.monthly.goal}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <button
          className="mt-5 rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          onClick={onClose}
          type="button"
        >
          Done
        </button>
      </section>
    </div>
  );
}
