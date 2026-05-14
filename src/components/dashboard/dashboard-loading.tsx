export function DashboardLoading() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="h-20 animate-pulse rounded bg-[#e7ebef]" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded bg-[#e7ebef]" />
          <div className="h-32 animate-pulse rounded bg-[#e7ebef]" />
          <div className="h-32 animate-pulse rounded bg-[#e7ebef]" />
        </div>
        <div className="h-80 animate-pulse rounded bg-[#e7ebef]" />
      </section>
    </main>
  );
}

