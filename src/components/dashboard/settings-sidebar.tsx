"use client";

import { useEffect, useMemo, useState } from "react";
import type { GoalsResponse } from "./types";

type SettingsSection = "streak" | "popups";

type SettingsSidebarProps = {
  activeSection: SettingsSection;
  arePersonalRecordPopupsEnabled: boolean;
  areWorkoutSummaryPopupsEnabled: boolean;
  goals: GoalsResponse;
  isOpen: boolean;
  onClose: () => void;
  onPersonalRecordPopupsChange: (enabled: boolean) => void;
  onSaved: (goals: GoalsResponse) => void;
  onWorkoutSummaryPopupsChange: (enabled: boolean) => void;
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

const inputClassName =
  "min-h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 font-normal text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 disabled:cursor-not-allowed disabled:bg-[var(--accent-soft)] disabled:opacity-70";

const primaryButtonClassName =
  "min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55";

const secondaryButtonClassName =
  "min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm shadow-[#1f3a45]/5 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20";

const settingCardClassName =
  "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm shadow-[#1f3a45]/5";

const toggleTrackClassName = (enabled: boolean) =>
  `relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
    enabled
      ? "border-[var(--accent)] bg-[var(--accent)]"
      : "border-[var(--border)] bg-[var(--accent-soft)]"
  } peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)]/20`;

const toggleThumbClassName = (enabled: boolean) =>
  `inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
    enabled ? "translate-x-6" : "translate-x-1"
  }`;

export function SettingsSidebar({
  activeSection,
  arePersonalRecordPopupsEnabled,
  areWorkoutSummaryPopupsEnabled,
  goals,
  isOpen,
  onClose,
  onPersonalRecordPopupsChange,
  onSaved,
  onWorkoutSummaryPopupsChange,
}: SettingsSidebarProps) {
  const [section, setSection] = useState<SettingsSection>(activeSection);
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [monthlyEnabled, setMonthlyEnabled] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSection(activeSection);
    setWeeklyEnabled(goals.weeklyGoal !== null);
    setMonthlyEnabled(goals.monthlyGoal !== null);
    setWeeklyGoal(goals.weeklyGoal?.toString() ?? "");
    setMonthlyGoal(goals.monthlyGoal?.toString() ?? "");
    setError(null);
    setSuccess(null);
  }, [activeSection, goals, isOpen]);

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
    setSuccess(null);
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
    setSuccess(null);
    if (!enabled) {
      setMonthlyGoal("");
    }
  };

  const saveSettings = async () => {
    setError(null);
    setSuccess(null);

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
      setSuccess("Streak settings saved.");
    } catch {
      setError(
        "Could not reach the server while saving streak settings. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/35 sm:p-3">
      <aside className="ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-[#1f3a45]/20 sm:rounded-l-2xl sm:border">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-4 sm:p-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
              Settings
            </p>
            <h2 className="mt-2 text-2xl font-semibold">User settings</h2>
          </div>
          <button
            className={secondaryButtonClassName}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[180px_minmax(0,1fr)]">
          <nav className="grid grid-cols-2 gap-2 border-b border-[var(--border)] p-3 md:flex md:flex-col md:border-b-0 md:border-r">
            {[
              ["streak", "Streak settings"],
              ["popups", "Popup settings"],
            ].map(([value, label]) => (
              <button
                className={`min-h-11 w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold shadow-sm shadow-[#1f3a45]/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 ${
                  section === value
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
                }`}
                key={value}
                onClick={() => {
                  setSection(value as SettingsSection);
                  setError(null);
                  setSuccess(null);
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
            {section === "streak" ? (
              <div className="pb-24">
                <h3 className="text-lg font-semibold">Streak settings</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Streak progress counts unique training days, not multiple
                  workouts on the same day.
                </p>

                <div className="mt-5 grid gap-4">
                  <div className={settingCardClassName}>
                    <label className="flex items-start justify-between gap-4">
                      <input
                        checked={weeklyEnabled}
                        className="peer sr-only"
                        onChange={(event) =>
                          requestWeeklyToggle(event.target.checked)
                        }
                        type="checkbox"
                      />
                      <span>
                        <span className="font-semibold">
                          Enable weekly streak
                        </span>
                        <span className="mt-1 block text-sm text-[var(--muted)]">
                          Pick 1 to 7 training days inside each week.
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={toggleTrackClassName(weeklyEnabled)}
                      >
                        <span className={toggleThumbClassName(weeklyEnabled)} />
                      </span>
                    </label>
                    {weeklyEnabled ? (
                      <label className="mt-4 flex flex-col gap-2 text-sm font-medium">
                        Weekly goal
                        <input
                          className={inputClassName}
                          inputMode="numeric"
                          max="7"
                          min="1"
                          onChange={(event) => {
                            setWeeklyGoal(event.target.value);
                            setSuccess(null);
                          }}
                          type="number"
                          value={weeklyGoal}
                        />
                      </label>
                    ) : null}
                  </div>

                  <div className={settingCardClassName}>
                    <label className="flex items-start justify-between gap-4">
                      <input
                        checked={monthlyEnabled}
                        className="peer sr-only"
                        onChange={(event) =>
                          requestMonthlyToggle(event.target.checked)
                        }
                        type="checkbox"
                      />
                      <span>
                        <span className="font-semibold">
                          Enable monthly streak
                        </span>
                        <span className="mt-1 block text-sm text-[var(--muted)]">
                          Pick 1 to 31 training days inside each month.
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={toggleTrackClassName(monthlyEnabled)}
                      >
                        <span className={toggleThumbClassName(monthlyEnabled)} />
                      </span>
                    </label>
                    {monthlyEnabled ? (
                      <label className="mt-4 flex flex-col gap-2 text-sm font-medium">
                        Monthly goal
                        <input
                          className={inputClassName}
                          inputMode="numeric"
                          max="31"
                          min="1"
                          onChange={(event) => {
                            setMonthlyGoal(event.target.value);
                            setSuccess(null);
                          }}
                          type="number"
                          value={monthlyGoal}
                        />
                      </label>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pb-6">
                <h3 className="text-lg font-semibold">Popup settings</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Control celebration pop-ups without changing the records or
                  goals calculated by the backend.
                </p>
                <p className="mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--muted)]">
                  Popup preferences are saved immediately on this device.
                </p>
                <div className={`mt-4 ${settingCardClassName}`}>
                  <label className="flex items-start justify-between gap-4">
                    <input
                      checked={arePersonalRecordPopupsEnabled}
                      className="peer sr-only"
                      onChange={(event) =>
                        onPersonalRecordPopupsChange(event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>
                      <span className="font-semibold">
                        Enable personal record pop-ups
                      </span>
                      <span className="mt-1 block text-sm text-[var(--muted)]">
                        PRs are still calculated when this is off; only the
                        celebration pop-up is hidden.
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={toggleTrackClassName(
                        arePersonalRecordPopupsEnabled,
                      )}
                    >
                      <span
                        className={toggleThumbClassName(
                          arePersonalRecordPopupsEnabled,
                        )}
                      />
                    </span>
                  </label>
                </div>
                <div className={`mt-4 ${settingCardClassName}`}>
                  <label className="flex items-start justify-between gap-4">
                    <input
                      checked={areWorkoutSummaryPopupsEnabled}
                      className="peer sr-only"
                      onChange={(event) =>
                        onWorkoutSummaryPopupsChange(event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>
                      <span className="font-semibold">
                        Enable workout summary popup
                      </span>
                      <span className="mt-1 block text-sm text-[var(--muted)]">
                        Shows volume comparison, total volume, records and
                        active streak progress after saving a workout.
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={toggleTrackClassName(
                        areWorkoutSummaryPopupsEnabled,
                      )}
                    >
                      <span
                        className={toggleThumbClassName(
                          areWorkoutSummaryPopupsEnabled,
                        )}
                      />
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {section === "streak" ? (
          <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_-12px_24px_rgba(31,58,69,0.06)]">
            {error || validationError ? (
              <p className="mb-3 rounded-lg border border-[#e1b8b8] bg-[#fff7f7] px-3 py-2 text-sm text-[#7b3b3b]">
                {error ?? validationError}
              </p>
            ) : null}
            {success ? (
              <p className="mb-3 rounded-lg border border-[#b8d9c2] bg-[#f6fff8] px-3 py-2 text-sm text-[#315f3c]">
                {success}
              </p>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-xs leading-5 text-[var(--muted)]">
                Save applies only streak goals. Popup settings save immediately.
              </p>
              <button
                className={`w-full sm:w-auto ${primaryButtonClassName}`}
                disabled={isSaving || Boolean(validationError)}
                onClick={saveSettings}
                type="button"
              >
                {isSaving ? "Saving settings..." : "Save streak settings"}
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
