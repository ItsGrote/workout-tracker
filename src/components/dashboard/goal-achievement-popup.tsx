"use client";

type GoalAchievementPopupProps = {
  message: string | null;
  onClose: () => void;
};

export function GoalAchievementPopup({
  message,
  onClose,
}: GoalAchievementPopupProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/35 p-3 sm:items-center">
      <section className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] text-center shadow-2xl shadow-[#1f3a45]/20 sm:rounded-2xl">
        <div className="min-h-0 overflow-y-auto p-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
            Goal achieved
          </p>
          <h2 className="mt-3 text-2xl font-semibold">{message}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Consistency compounds quietly. This one counts.
          </p>
        </div>
        <footer className="border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_-12px_24px_rgba(31,58,69,0.06)]">
          <button
            className="min-h-11 w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            onClick={onClose}
            type="button"
          >
            Nice
          </button>
        </footer>
      </section>
    </div>
  );
}
