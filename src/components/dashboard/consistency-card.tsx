import type { ConsistencyResponse, GoalsResponse } from "./types";

type ConsistencyCardProps = {
  consistency: ConsistencyResponse;
  goals: GoalsResponse;
};

const statusLabel: Record<ConsistencyResponse["weekly"]["status"], string> = {
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
};

export function ConsistencyCard({ consistency, goals }: ConsistencyCardProps) {
  const weeklyGoalLabel = goals.weeklyGoal ?? "set a goal";
  const monthlyGoalLabel = goals.monthlyGoal ?? "set a goal";

  return (
    <section className="rounded border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Consistency</h2>
        <p className="text-sm text-[var(--muted)]">
          Weekly progress counts unique training days.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted)]">Weekly Goal</p>
          <p className="mt-2 text-2xl font-semibold">
            {consistency.weekly.trainedDays}/{weeklyGoalLabel}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {consistency.weekly.remaining ?? "-"} remaining
          </p>
          <div className="mt-4 h-2 rounded bg-[#e7ebef]">
            <div
              className="h-2 rounded bg-[var(--accent)]"
              style={{ width: `${consistency.weekly.completionPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-medium">
            {statusLabel[consistency.weekly.status]}
          </p>
        </div>

        <div className="rounded border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted)]">Monthly Goal</p>
          <p className="mt-2 text-2xl font-semibold">
            {consistency.monthly.trainedDays}/{monthlyGoalLabel}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {consistency.monthly.completionPercentage}% complete
          </p>
          <div className="mt-4 h-2 rounded bg-[#e7ebef]">
            <div
              className="h-2 rounded bg-[#4f6f91]"
              style={{ width: `${consistency.monthly.completionPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-medium">
            {consistency.completedWeekStreak} completed week streak
          </p>
        </div>
      </div>
    </section>
  );
}
