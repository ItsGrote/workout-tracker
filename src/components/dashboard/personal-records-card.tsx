import type { PersonalRecordsResponse } from "./types";

type PersonalRecordsCardProps = {
  personalRecords: PersonalRecordsResponse;
};

const metricLabel: Record<string, string> = {
  "highest-weight": "Highest weight",
  "best-repetitions": "Best repetitions",
  "exercise-volume": "Exercise volume",
  "workout-volume": "Workout volume",
  "category-workout-volume": "Category volume",
};

export function PersonalRecordsCard({
  personalRecords,
}: PersonalRecordsCardProps) {
  const records = personalRecords.records.slice(0, 5);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm shadow-[#1f3a45]/5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Personal Records</h2>
        <p className="text-sm text-[var(--muted)]">
          Current best results calculated from saved workouts.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {records.length > 0 ? (
          records.map((record) => (
            <div
              className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm shadow-[#1f3a45]/5"
              key={`${record.metric}-${record.scope}-${record.exerciseName ?? record.workoutName ?? record.workoutCategory}`}
            >
              <div>
                <p className="font-medium">
                  {metricLabel[record.metric] ?? record.metric}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {record.exerciseName ?? record.workoutCategory ?? record.workoutName}
                </p>
              </div>
              <p className="shrink-0 rounded-md bg-[var(--accent-soft)] px-2.5 py-1 text-lg font-semibold text-[var(--accent)]">
                {record.value}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--accent-soft)] p-4">
            <p className="font-medium">No records unlocked yet</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Save workouts with exercises and sets. Your first best weight,
              reps and volume records will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
