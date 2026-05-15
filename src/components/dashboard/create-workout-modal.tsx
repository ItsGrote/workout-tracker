"use client";

import { FormEvent, useState } from "react";

type CreateWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const todayForInput = () => new Date().toISOString().slice(0, 10);

export function CreateWorkoutModal({
  isOpen,
  onClose,
  onCreated,
}: CreateWorkoutModalProps) {
  const [workoutName, setWorkoutName] = useState("Push A");
  const [category, setCategory] = useState("Chest");
  const [date, setDate] = useState(todayForInput());
  const [exerciseName, setExerciseName] = useState("Bench Press");
  const [weightKg, setWeightKg] = useState("40");
  const [repetitions, setRepetitions] = useState("10");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsedWeight = Number(weightKg);
    const parsedRepetitions = Number(repetitions);

    if (!workoutName.trim() || !exerciseName.trim()) {
      setError("Workout and exercise names are required.");
      return;
    }

    if (parsedWeight < 0 || parsedRepetitions < 0) {
      setError("Weight and repetitions cannot be negative.");
      return;
    }

    setIsSaving(true);

    const response = await fetch("/api/workouts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: workoutName,
        category,
        date: new Date(`${date}T12:00:00.000Z`).toISOString(),
        exercises: [
          {
            name: exerciseName,
            order: 1,
            sets: [
              {
                repetitions: parsedRepetitions,
                weightKg: parsedWeight,
                setType: "working",
                order: 1,
              },
            ],
          },
        ],
      }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setError("Could not create workout. Check the fields and try again.");
      return;
    }

    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 sm:items-center sm:justify-center">
      <form
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl sm:max-w-lg"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Create workout</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Save one workout and one exercise to start tracking progress.
            </p>
          </div>
          <button
            className="rounded border border-[var(--border)] px-3 py-1 text-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Workout name
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              onChange={(event) => setWorkoutName(event.target.value)}
              value={workoutName}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Category
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Date
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              onChange={(event) => setDate(event.target.value)}
              type="date"
              value={date}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Exercise
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              onChange={(event) => setExerciseName(event.target.value)}
              value={exerciseName}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Weight kg
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              min="0"
              onChange={(event) => setWeightKg(event.target.value)}
              step="0.5"
              type="number"
              value={weightKg}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Repetitions
            <input
              className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
              min="0"
              onChange={(event) => setRepetitions(event.target.value)}
              type="number"
              value={repetitions}
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded border border-[#e1b8b8] bg-[#fff7f7] px-3 py-2 text-sm text-[#7b3b3b]">
            {error}
          </p>
        ) : null}

        <button
          className="mt-5 w-full rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Saving..." : "+ Save workout"}
        </button>
      </form>
    </div>
  );
}

