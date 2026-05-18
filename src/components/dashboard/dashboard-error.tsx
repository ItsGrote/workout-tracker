type DashboardErrorProps = {
  message: string;
  onRetry: () => void;
};

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center">
        <div className="w-full rounded-2xl border border-[#e1b8b8] bg-[#fff7f7] p-5 shadow-sm shadow-[#1f3a45]/5 sm:p-6">
          <div className="inline-flex rounded-full border border-[#e1b8b8] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b3b3b]">
            Loading issue
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-[#2b1515]">
            We could not load your training data.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7b3b3b]">
            {message}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b3b3b]/80">
            Your saved workouts are not changed. Try again when the connection
            is stable.
          </p>
        <button
          className="mt-5 min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
        </div>
      </section>
    </main>
  );
}
