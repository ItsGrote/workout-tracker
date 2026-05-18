"use client";

import type { PersonalRecord } from "./types";

type PersonalRecordPopupProps = {
  records: PersonalRecord[];
  onClose: () => void;
};

const metricLabel: Record<PersonalRecord["metric"], string> = {
  "highest-weight": "new max weight",
  "best-repetitions": "new reps record",
  "exercise-volume": "new volume record",
  "workout-volume": "new workout volume record",
  "category-workout-volume": "new category volume record",
};

export function PersonalRecordPopup({
  records,
  onClose,
}: PersonalRecordPopupProps) {
  if (records.length === 0) {
    return null;
  }

  const title =
    records.length === 1
      ? "1 new personal record achieved"
      : `${records.length} new personal records achieved`;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/35 p-3 sm:items-center">
      <section className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-[#1f3a45]/20 sm:rounded-2xl">
        <header className="border-b border-[var(--border)] p-5 sm:p-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
            Personal record
          </p>
          <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Your saved workout unlocked new performance markers.
          </p>
        </header>
        <ul className="grid min-h-0 gap-2 overflow-y-auto p-5 text-sm sm:p-6">
          {records.map((record) => (
            <li
              className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-2"
              key={`${record.workoutId}-${record.exerciseId}-${record.metric}-${record.value}`}
            >
              <span className="font-semibold">
                {record.exerciseName ?? record.workoutName ?? "Workout"}:
              </span>{" "}
              {metricLabel[record.metric]}
            </li>
          ))}
        </ul>
        <footer className="border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_-12px_24px_rgba(31,58,69,0.06)]">
          <button
            className="min-h-11 w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            onClick={onClose}
            type="button"
          >
            Celebrate
          </button>
        </footer>
      </section>
    </div>
  );
}
