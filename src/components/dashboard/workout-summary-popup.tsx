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
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/35 p-3 sm:items-center">
      <section className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-[#1f3a45]/20 sm:rounded-2xl">
        <header className="border-b border-[var(--border)] p-5 sm:p-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
            Workout complete
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Your session is saved.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            A quick reward snapshot from the workout you just logged.
          </p>
        </header>

        <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] p-4">
              <p className="text-sm font-semibold">Volume comparison</p>
              <p className="mt-1 text-lg font-semibold">
                {summary.comparison.message}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm font-semibold">Total volume</p>
              <p className="mt-1 text-2xl font-semibold">
                {summary.totalVolume}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm font-semibold">
                {summary.personalRecords.length} personal records achieved
              </p>
              <ul className="mt-3 grid gap-2 text-sm">
                {summary.personalRecords.length > 0 ? (
                  summary.personalRecords.map((record) => (
                    <li
                      className="rounded-lg bg-[var(--accent-soft)] px-3 py-2"
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
              <div className="rounded-xl border border-[var(--border)] p-4">
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
        </div>

        <footer className="border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_-12px_24px_rgba(31,58,69,0.06)]">
          <button
            className="min-h-11 w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            onClick={onClose}
            type="button"
          >
            Continue
          </button>
        </footer>
      </section>
    </div>
  );
}
