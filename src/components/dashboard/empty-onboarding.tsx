type EmptyOnboardingProps = {
  onCreateWorkout: () => void;
};

export function EmptyOnboarding({ onCreateWorkout }: EmptyOnboardingProps) {
  return (
    <section className="rounded border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
            First workout
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Start with one workout and one exercise.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Add a simple session now. Once it is saved, your dashboard can show
            volume, consistency progress and future personal records.
          </p>
          <button
            className="mt-5 rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            onClick={onCreateWorkout}
            type="button"
          >
            + Create first workout
          </button>
        </div>

        <ol className="grid gap-3 text-sm">
          <li className="rounded border border-[var(--border)] p-3">
            1. Create a workout for today
          </li>
          <li className="rounded border border-[var(--border)] p-3">
            2. Add one exercise and one set
          </li>
          <li className="rounded border border-[var(--border)] p-3">
            3. Watch your volume graph appear
          </li>
        </ol>
      </div>
    </section>
  );
}

