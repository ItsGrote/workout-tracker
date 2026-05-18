export function DashboardLoading() {
  const skeletonClassName =
    "animate-pulse rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] shadow-sm shadow-[#1f3a45]/5";

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className={`${skeletonClassName} h-16`} />
        <div className={`${skeletonClassName} h-44`} />
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
      </section>
    </main>
  );
}
