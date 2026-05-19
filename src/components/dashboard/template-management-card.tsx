import type { WorkoutTemplateResponse } from "./types";

type TemplateManagementCardProps = {
  isBusy: boolean;
  onCreate: () => void;
  onDelete: (template: WorkoutTemplateResponse) => void;
  onEdit: (template: WorkoutTemplateResponse) => void;
  onStart: (template: WorkoutTemplateResponse) => void;
  templates: WorkoutTemplateResponse[];
};

export function TemplateManagementCard({
  isBusy,
  onCreate,
  onDelete,
  onEdit,
  onStart,
  templates,
}: TemplateManagementCardProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm shadow-[#1f3a45]/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Templates</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Reusable structures for faster logging. They never count as
            completed workouts until you fill and save a real session.
          </p>
        </div>
        <button
          className="min-h-11 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          onClick={onCreate}
          type="button"
        >
          + Create template
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {templates.length > 0 ? (
          templates.map((template) => (
            <div
              className="flex flex-col gap-3 rounded-xl border border-[#d8c3a5] bg-[var(--accent-soft)] p-4 shadow-sm shadow-[#1f3a45]/5 transition hover:border-[var(--accent)] lg:flex-row lg:items-center lg:justify-between"
              key={template.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                    Structure preset
                  </span>
                  <span className="rounded-full border border-[#d8c3a5] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                    Not logged
                  </span>
                </div>
                <p className="mt-2 font-medium">
                  {template.name} - {template.category ?? "No category"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {template.exercises.length} exercises ·{" "}
                  {template.exercises.reduce(
                    (total, exercise) => total + exercise.sets.length,
                    0,
                  )}{" "}
                  set slots · no reps or weight saved
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="min-h-11 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isBusy}
                  onClick={() => onStart(template)}
                  type="button"
                >
                  Use template
                </button>
                <button
                  className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isBusy}
                  onClick={() => onEdit(template)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="min-h-11 rounded-lg border border-[#e1b8b8] bg-[#fff7f7] px-3 py-2 text-sm font-medium text-[#7b3b3b] transition hover:bg-[#fbecec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b3b3b]/20 disabled:cursor-not-allowed disabled:opacity-55"
                  disabled={isBusy}
                  onClick={() => onDelete(template)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#d8c3a5] bg-[var(--accent-soft)] p-4 text-sm text-[var(--muted)]">
            <span className="inline-flex rounded-full border border-[#d8c3a5] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              Structure shortcut
            </span>
            <p className="mt-3 font-semibold text-[var(--foreground)]">
              No structure presets yet.
            </p>
            <p className="mt-1 leading-6">
              Create a template for repeated workout structure. It will not log
              progress, streaks or PRs until you use it to save a real workout.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
