import type { ConsistencyResponse, GoalsResponse } from "./types";

type ConsistencyCardProps = {
  consistency: ConsistencyResponse;
  goals: GoalsResponse;
  onEditGoals: () => void;
};

const statusLabel: Record<ConsistencyResponse["weekly"]["status"], string> = {
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
};

export function ConsistencyCard({
  consistency,
  goals,
  onEditGoals,
}: ConsistencyCardProps) {
  const hasWeeklyGoal = goals.weeklyGoal !== null;
  const hasMonthlyGoal = goals.monthlyGoal !== null;
  const enabledGoalCount = Number(hasWeeklyGoal) + Number(hasMonthlyGoal);
  const gridClassName =
    enabledGoalCount === 2 ? "mt-6 grid gap-4 sm:grid-cols-2" : "mt-6 grid";

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm shadow-[#1f3a45]/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Consistency</h2>
          <p className="text-sm text-[var(--muted)]">
            Streak progress counts unique training days.
          </p>
        </div>
        <button
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium shadow-sm shadow-[#1f3a45]/5 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20"
          onClick={onEditGoals}
          type="button"
        >
          Settings
        </button>
      </div>

      {!hasWeeklyGoal && !hasMonthlyGoal ? (
        <div className="mt-6 rounded-lg border border-dashed border-[var(--border)] bg-[var(--accent-soft)] p-4 text-sm text-[var(--muted)]">
          No streak is enabled yet. Open Settings to activate weekly or monthly
          consistency goals.
        </div>
      ) : null}

      <div className={gridClassName}>
        {hasWeeklyGoal ? (
          <button
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-sm shadow-[#1f3a45]/5 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20"
            onClick={onEditGoals}
            type="button"
          >
            <p className="text-sm text-[var(--muted)]">Weekly Goal</p>
            <p className="mt-2 text-2xl font-semibold">
              {consistency.weekly.trainedDays}/{goals.weeklyGoal ?? "?"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {consistency.weekly.remaining ?? "-"} remaining
            </p>
            <div className="mt-4 h-2 rounded bg-[var(--accent-soft)]">
              <div
                className="h-2 rounded bg-[var(--accent)]"
                style={{ width: `${consistency.weekly.completionPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium">
              {statusLabel[consistency.weekly.status]}
            </p>
          </button>
        ) : null}

        {hasMonthlyGoal ? (
          <button
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-sm shadow-[#1f3a45]/5 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20"
            onClick={onEditGoals}
            type="button"
          >
            <p className="text-sm text-[var(--muted)]">Monthly Goal</p>
            <p className="mt-2 text-2xl font-semibold">
              {consistency.monthly.trainedDays}/{goals.monthlyGoal ?? "?"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {consistency.monthly.completionPercentage}% complete
            </p>
            <div className="mt-4 h-2 rounded bg-[var(--accent-soft)]">
              <div
                className="h-2 rounded bg-[#8d7658]"
                style={{ width: `${consistency.monthly.completionPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-medium">
              {consistency.completedWeekStreak} completed week streak
            </p>
          </button>
        ) : null}
      </div>
    </section>
  );
}
