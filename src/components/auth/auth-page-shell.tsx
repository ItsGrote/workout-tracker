import type { ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
};

const mockBars = [32, 48, 42, 68, 76, 92];

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="order-2 flex flex-col gap-5 lg:order-1">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
              Progress before mirrors
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
              See your training evolution before your body shows it.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
              Track volume, consistency and personal records from the workouts
              you already do. Small wins become visible sooner.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-sm text-[var(--muted)]">Weekly goal</p>
              <p className="mt-2 text-2xl font-semibold">3/4</p>
              <div className="mt-3 h-2 rounded bg-[#e7ebef]">
                <div className="h-2 w-3/4 rounded bg-[var(--accent)]" />
              </div>
            </div>
            <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-sm text-[var(--muted)]">New PR</p>
              <p className="mt-2 text-2xl font-semibold">Bench +5kg</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Unlocked today</p>
            </div>
            <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-sm text-[var(--muted)]">Streak</p>
              <p className="mt-2 text-2xl font-semibold">4 weeks</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Completed</p>
            </div>
          </div>

          <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex h-40 items-end gap-3">
              {mockBars.map((height, index) => (
                <div
                  className="flex-1 rounded-t bg-[var(--accent)] opacity-90"
                  key={index}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Example volume trend with mock data. Real data appears after login.
            </p>
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2">{children}</div>
      </section>
    </main>
  );
}

