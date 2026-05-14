const architectureSteps = [
  "Route / Controller",
  "Validation",
  "Service",
  "Repository",
  "Database",
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
            MVP foundation
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Workout Evolution Tracker
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
            Base Next.js project prepared for an incremental workout progression
            app using a simple MVC + Service + Repository architecture.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {architectureSteps.map((step) => (
            <div
              className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 text-sm font-medium"
              key={step}
            >
              {step}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

