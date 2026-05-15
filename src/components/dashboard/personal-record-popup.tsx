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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 p-4">
      <section className="w-full max-w-lg rounded border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
          Personal record
        </p>
        <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
        <ul className="mt-4 grid gap-2 text-sm">
          {records.map((record) => (
            <li
              className="rounded border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-2"
              key={`${record.workoutId}-${record.exerciseId}-${record.metric}-${record.value}`}
            >
              <span className="font-semibold">
                {record.exerciseName ?? record.workoutName ?? "Workout"}:
              </span>{" "}
              {metricLabel[record.metric]}
            </li>
          ))}
        </ul>
        <button
          className="mt-5 rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          onClick={onClose}
          type="button"
        >
          Celebrate
        </button>
      </section>
    </div>
  );
}
