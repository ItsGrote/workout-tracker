type DashboardErrorProps = {
  message: string;
  onRetry: () => void;
};

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-3xl rounded-xl border border-[#e1b8b8] bg-[#fff7f7] p-6 shadow-sm shadow-[#1f3a45]/5">
        <h1 className="text-2xl font-semibold text-[#2b1515]">
          We could not load your training data
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#7b3b3b]">{message}</p>
        <button
          className="mt-5 min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
