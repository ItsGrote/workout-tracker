export function DashboardLoading() {
  const skeletonClassName =
    "animate-pulse rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] shadow-sm shadow-[#1f3a45]/5";
  const skeletonLineClassName =
    "h-3 animate-pulse rounded-full bg-[#d8c3a5]/45";

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className={`${skeletonClassName} flex h-16 items-center justify-between px-4`}>
          <div className={`${skeletonLineClassName} w-32`} />
          <div className={`${skeletonLineClassName} hidden w-24 sm:block`} />
        </div>
        <div className={`${skeletonClassName} h-44 p-5`}>
          <div className={`${skeletonLineClassName} w-28`} />
          <div className={`${skeletonLineClassName} mt-4 h-5 w-64 max-w-full`} />
          <div className={`${skeletonLineClassName} mt-3 w-80 max-w-full`} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.35fr)]">
          <div className="flex flex-col gap-6">
            <div className={`${skeletonClassName} h-56`} />
            <div className={`${skeletonClassName} h-64`} />
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`${skeletonClassName} h-32`} />
              <div className={`${skeletonClassName} h-32`} />
              <div className={`${skeletonClassName} h-32`} />
            </div>
            <div className={`${skeletonClassName} h-80`} />
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <div className={`${skeletonClassName} h-72`} />
          <div className={`${skeletonClassName} h-72`} />
        </div>
        <p className="sr-only">Loading your workout dashboard.</p>
      </section>
    </main>
  );
}
