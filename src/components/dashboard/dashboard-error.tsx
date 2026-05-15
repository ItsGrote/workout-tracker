type DashboardErrorProps = {
  message: string;
  onRetry: () => void;
};

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-3xl rounded border border-[#e1b8b8] bg-[#fff7f7] p-6">
        <h1 className="text-2xl font-semibold text-[#2b1515]">
          We could not load your training data
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#7b3b3b]">{message}</p>
        <button
          className="mt-5 rounded bg-[#101214] px-4 py-2 text-sm font-medium text-white"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
