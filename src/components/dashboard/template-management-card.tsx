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
    <section className="rounded border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Templates</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Save workout structure and start faster without counting progress
            until the real workout is saved.
          </p>
        </div>
        <button
          className="rounded bg-[var(--foreground)] px-3 py-2 text-sm font-medium text-white"
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
              className="flex flex-col gap-3 rounded border border-[var(--border)] p-3 lg:flex-row lg:items-center lg:justify-between"
              key={template.id}
            >
              <div>
                <p className="font-medium">
                  {template.name} - {template.category ?? "No category"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {template.exercises.length} exercises ·{" "}
                  {template.exercises.reduce(
                    (total, exercise) => total + exercise.sets.length,
                    0,
                  )}{" "}
                  set slots
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={isBusy}
                  onClick={() => onStart(template)}
                  type="button"
                >
                  Start workout
                </button>
                <button
                  className="rounded border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
                  disabled={isBusy}
                  onClick={() => onEdit(template)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="rounded border border-[#e1b8b8] px-3 py-2 text-sm font-medium text-[#7b3b3b] disabled:opacity-60"
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
          <p className="rounded border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
            No templates yet. Create one from scratch or save an existing
            workout as a template.
          </p>
        )}
      </div>
    </section>
  );
}
