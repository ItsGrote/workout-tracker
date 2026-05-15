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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 p-4">
      <section className="w-full max-w-md rounded border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
          Goal achieved
        </p>
        <h2 className="mt-3 text-2xl font-semibold">{message}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Consistency compounds quietly. This one counts.
        </p>
        <button
          className="mt-5 rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          onClick={onClose}
          type="button"
        >
          Nice
        </button>
      </section>
    </div>
  );
}
