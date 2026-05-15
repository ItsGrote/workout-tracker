export function DashboardLoading() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="h-16 animate-pulse rounded bg-[#e7ebef]" />
        <div className="h-24 animate-pulse rounded bg-[#e7ebef]" />
        <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.4fr)]">
          <div className="h-72 animate-pulse rounded bg-[#e7ebef]" />
          <div className="h-72 animate-pulse rounded bg-[#e7ebef]" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded bg-[#e7ebef]" />
          <div className="h-32 animate-pulse rounded bg-[#e7ebef]" />
          <div className="h-32 animate-pulse rounded bg-[#e7ebef]" />
        </div>
      </section>
    </main>
  );
}
