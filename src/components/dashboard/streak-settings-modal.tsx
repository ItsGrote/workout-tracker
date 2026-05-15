"use client";

import { useEffect, useMemo, useState } from "react";
import type { GoalsResponse } from "./types";

type StreakSettingsModalProps = {
  goals: GoalsResponse;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (goals: GoalsResponse) => void;
};

const parseGoal = (value: string) => {
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }

  return Number(value);
};

const readGoalError = async (response: Response) => {
  const fallbackMessage = "Could not save streak settings. Please try again.";

  try {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await response.json()) as {
        error?: string;
        issues?: { message?: string }[];
      };

      return body.issues?.[0]?.message ?? body.error ?? fallbackMessage;
    }

    const text = await response.text();
    return text || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export function StreakSettingsModal({
  goals,
  isOpen,
  onClose,
  onSaved,
}: StreakSettingsModalProps) {
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [monthlyEnabled, setMonthlyEnabled] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setWeeklyEnabled(goals.weeklyGoal !== null);
    setMonthlyEnabled(goals.monthlyGoal !== null);
    setWeeklyGoal(goals.weeklyGoal?.toString() ?? "");
    setMonthlyGoal(goals.monthlyGoal?.toString() ?? "");
    setError(null);
  }, [goals, isOpen]);

  const validationError = useMemo(() => {
    if (weeklyEnabled) {
      const parsedWeeklyGoal = parseGoal(weeklyGoal);

      if (!parsedWeeklyGoal || parsedWeeklyGoal < 1 || parsedWeeklyGoal > 7) {
        return "Weekly goal must be a whole number from 1 to 7.";
      }
    }

    if (monthlyEnabled) {
      const parsedMonthlyGoal = parseGoal(monthlyGoal);

      if (
        !parsedMonthlyGoal ||
        parsedMonthlyGoal < 1 ||
        parsedMonthlyGoal > 31
      ) {
        return "Monthly goal must be a whole number from 1 to 31.";
      }
    }

    return null;
  }, [monthlyEnabled, monthlyGoal, weeklyEnabled, weeklyGoal]);

  if (!isOpen) {
    return null;
  }

  const requestWeeklyToggle = (enabled: boolean) => {
    if (
      !enabled &&
      goals.weeklyGoal !== null &&
      !window.confirm(
        "Disabling this streak will remove your saved goal and hide this streak card. Do you want to continue?",
      )
    ) {
      return;
    }

    setWeeklyEnabled(enabled);
    if (!enabled) {
      setWeeklyGoal("");
    }
  };

  const requestMonthlyToggle = (enabled: boolean) => {
    if (
      !enabled &&
      goals.monthlyGoal !== null &&
      !window.confirm(
        "Disabling this streak will remove your saved goal and hide this streak card. Do you want to continue?",
      )
    ) {
      return;
    }

    setMonthlyEnabled(enabled);
    if (!enabled) {
      setMonthlyGoal("");
    }
  };

  const saveSettings = async () => {
    setError(null);

    if (validationError) {
      setError(validationError);
      return;
    }

    const nextWeeklyGoal = weeklyEnabled ? parseGoal(weeklyGoal) : null;
    const nextMonthlyGoal = monthlyEnabled ? parseGoal(monthlyGoal) : null;

    setIsSaving(true);

    try {
      const response = await fetch("/api/goals", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklyGoal: nextWeeklyGoal,
          monthlyGoal: nextMonthlyGoal,
        }),
      });

      if (!response.ok) {
        setError(await readGoalError(response));
        return;
      }

      onSaved((await response.json()) as GoalsResponse);
      onClose();
    } catch (caughtError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to save streak settings", caughtError);
      }

      setError(
        "Could not reach the server while saving streak settings. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 sm:items-center sm:justify-center">
      <section className="w-full max-w-xl rounded border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
              Settings
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Streak goals</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Each streak counts unique training days, not multiple workouts on
              the same day.
            </p>
          </div>
          <button
            className="rounded border border-[var(--border)] px-3 py-2 text-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded border border-[var(--border)] p-4">
            <label className="flex items-start gap-3">
              <input
                checked={weeklyEnabled}
                className="mt-1"
                onChange={(event) => requestWeeklyToggle(event.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="font-semibold">Enable weekly streak</span>
                <span className="mt-1 block text-sm text-[var(--muted)]">
                  Pick 1 to 7 training days inside each week.
                </span>
              </span>
            </label>
            {weeklyEnabled ? (
              <label className="mt-4 flex flex-col gap-2 text-sm font-medium">
                Weekly goal
                <input
                  className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                  inputMode="numeric"
                  max="7"
                  min="1"
                  onChange={(event) => setWeeklyGoal(event.target.value)}
                  type="number"
                  value={weeklyGoal}
                />
              </label>
            ) : null}
          </div>

          <div className="rounded border border-[var(--border)] p-4">
            <label className="flex items-start gap-3">
              <input
                checked={monthlyEnabled}
                className="mt-1"
                onChange={(event) => requestMonthlyToggle(event.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="font-semibold">Enable monthly streak</span>
                <span className="mt-1 block text-sm text-[var(--muted)]">
                  Pick 1 to 31 training days inside each month.
                </span>
              </span>
            </label>
            {monthlyEnabled ? (
              <label className="mt-4 flex flex-col gap-2 text-sm font-medium">
                Monthly goal
                <input
                  className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                  inputMode="numeric"
                  max="31"
                  min="1"
                  onChange={(event) => setMonthlyGoal(event.target.value)}
                  type="number"
                  value={monthlyGoal}
                />
              </label>
            ) : null}
          </div>
        </div>

        {error || validationError ? (
          <p className="mt-4 rounded border border-[#e1b8b8] bg-[#fff7f7] px-3 py-2 text-sm text-[#7b3b3b]">
            {error ?? validationError}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded border border-[var(--border)] px-3 py-2 text-sm font-medium"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isSaving || Boolean(validationError)}
            onClick={saveSettings}
            type="button"
          >
            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </section>
    </div>
  );
}
