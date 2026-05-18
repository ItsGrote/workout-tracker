type EmptyOnboardingProps = {
  onCreateWorkout: () => void;
};

export function EmptyOnboarding({ onCreateWorkout }: EmptyOnboardingProps) {
  return (
    <section className="rounded-2xl border border-dashed border-[#d8c3a5] bg-[var(--accent-soft)] p-5 shadow-sm shadow-[#1f3a45]/5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-[#d8c3a5] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            Start your evolution
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Log one workout to make progress visible.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Add a simple session now. Once it is saved, volume, consistency and
            personal records start turning your training into feedback.
          </p>
          <button
            className="mt-5 min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            onClick={onCreateWorkout}
            type="button"
          >
            + Create first workout
          </button>
        </div>

        <ol className="grid gap-3 text-sm">
          <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm shadow-[#1f3a45]/5">
            1. Create a workout for today
          </li>
          <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm shadow-[#1f3a45]/5">
            2. Add one exercise and one set
          </li>
          <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm shadow-[#1f3a45]/5">
            3. Watch your volume graph appear
          </li>
        </ol>
      </div>
    </section>
  );
}
