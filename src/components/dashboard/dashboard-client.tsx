"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AchievementBanner } from "./achievement-banner";
import { ConsistencyCard } from "./consistency-card";
import { CreateWorkoutModal } from "./create-workout-modal";
import { DashboardNav } from "./dashboard-nav";
import { DashboardError } from "./dashboard-error";
import { DashboardLoading } from "./dashboard-loading";
import { DuplicateWorkoutModal } from "./duplicate-workout-modal";
import { EditWorkoutModal } from "./edit-workout-modal";
import { EmptyOnboarding } from "./empty-onboarding";
import { GoalAchievementPopup } from "./goal-achievement-popup";
import { PersonalRecordPopup } from "./personal-record-popup";
import { PersonalRecordsCard } from "./personal-records-card";
import { ProgressionChart } from "./progression-chart";
import { SettingsSidebar } from "./settings-sidebar";
import { SummaryCard } from "./summary-card";
import { TemplateEditorModal } from "./template-editor-modal";
import { TemplateManagementCard } from "./template-management-card";
import { WorkoutManagementCard } from "./workout-management-card";
import { WorkoutSummaryPopup } from "./workout-summary-popup";
import type {
  CreateWorkoutInitialDraft,
  DashboardData,
  PersonalRecord,
  WorkoutResponse,
  WorkoutSummaryResponse,
  WorkoutTemplateResponse,
} from "./types";

const PERSONAL_RECORD_POPUPS_KEY =
  "workout-evolution-personal-record-popups-enabled";
const WORKOUT_SUMMARY_POPUPS_KEY =
  "workout-evolution-workout-summary-popups-enabled";
const SHOWN_PERSONAL_RECORD_KEY_PREFIX =
  "workout-evolution-personal-record-shown";

type SettingsSection = "streak" | "popups";

class UnauthorizedRequestError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "UnauthorizedRequestError";
  }
}

const isUnauthorizedRequestError = (
  error: unknown,
): error is UnauthorizedRequestError => error instanceof UnauthorizedRequestError;

const requestJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(path, {
    credentials: "include",
  });

  if (response.status === 401) {
    throw new UnauthorizedRequestError();
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  return response.json() as Promise<T>;
};

const readApiError = async (response: Response, fallback: string) => {
  try {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await response.json()) as {
        error?: string;
        issues?: { message?: string }[];
      };

      return body.issues?.[0]?.message ?? body.error ?? fallback;
    }

    return (await response.text()) || fallback;
  } catch {
    return fallback;
  }
};

export function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] =
    useState<SettingsSection>("streak");
  const [createWorkoutInitialDraft, setCreateWorkoutInitialDraft] =
    useState<CreateWorkoutInitialDraft | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutResponse | null>(
    null,
  );
  const [editingTemplate, setEditingTemplate] =
    useState<WorkoutTemplateResponse | null>(null);
  const [isTemplateActionLoading, setIsTemplateActionLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [goalAchievementMessage, setGoalAchievementMessage] = useState<
    string | null
  >(null);
  const [personalRecordPopupRecords, setPersonalRecordPopupRecords] = useState<
    PersonalRecord[]
  >([]);
  const [arePersonalRecordPopupsEnabled, setArePersonalRecordPopupsEnabled] =
    useState(true);
  const [areWorkoutSummaryPopupsEnabled, setAreWorkoutSummaryPopupsEnabled] =
    useState(true);
  const [pendingWorkoutSummary, setPendingWorkoutSummary] =
    useState<WorkoutSummaryResponse | null>(null);
  const [workoutSummaryPopup, setWorkoutSummaryPopup] =
    useState<WorkoutSummaryResponse | null>(null);

  const redirectToLogin = useCallback(() => {
    router.replace("/login");
  }, [router]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [progression, consistency, goals, personalRecords, workouts, templates] =
        await Promise.all([
          requestJson<DashboardData["progression"]>("/api/progression"),
          requestJson<DashboardData["consistency"]>("/api/consistency"),
          requestJson<DashboardData["goals"]>("/api/goals"),
          requestJson<DashboardData["personalRecords"]>(
            "/api/personal-records",
          ),
          requestJson<DashboardData["workouts"]>("/api/workouts"),
          requestJson<DashboardData["templates"]>("/api/templates"),
        ]);

      const nextData = {
        progression,
        consistency,
        goals,
        personalRecords,
        templates,
        workouts,
      };
      setData(nextData);

      return nextData;
    } catch (caughtError) {
      if (isUnauthorizedRequestError(caughtError)) {
        redirectToLogin();
        return null;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load dashboard data.",
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  const loadConsistencyData = useCallback(async () => {
    try {
      const [consistency, goals] = await Promise.all([
        requestJson<DashboardData["consistency"]>("/api/consistency"),
        requestJson<DashboardData["goals"]>("/api/goals"),
      ]);

      setData((current) =>
        current ? { ...current, consistency, goals } : current,
      );
    } catch (caughtError) {
      if (isUnauthorizedRequestError(caughtError)) {
        redirectToLogin();
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load consistency data.",
      );
    }
  }, [redirectToLogin]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setArePersonalRecordPopupsEnabled(
      window.localStorage.getItem(PERSONAL_RECORD_POPUPS_KEY) !== "false",
    );
    setAreWorkoutSummaryPopupsEnabled(
      window.localStorage.getItem(WORKOUT_SUMMARY_POPUPS_KEY) !== "false",
    );
  }, []);

  useEffect(() => {
    if (!data || typeof window === "undefined") {
      return;
    }

    const achievements = [
      {
        key: data.goals.weeklyGoal
          ? `weekly:${data.consistency.weekly.startDate}:${data.goals.weeklyGoal}`
          : null,
        achieved:
          data.goals.weeklyGoal !== null &&
          data.consistency.weekly.trainedDays >= data.goals.weeklyGoal,
        message: "Weekly goal achieved! Great job staying consistent.",
      },
      {
        key: data.goals.monthlyGoal
          ? `monthly:${data.consistency.monthly.startDate}:${data.goals.monthlyGoal}`
          : null,
        achieved:
          data.goals.monthlyGoal !== null &&
          data.consistency.monthly.trainedDays >= data.goals.monthlyGoal,
        message: "Monthly goal achieved! Your consistency is paying off.",
      },
    ];

    for (const achievement of achievements) {
      if (!achievement.key || !achievement.achieved) {
        continue;
      }

      const storageKey = `workout-evolution-goal-achieved:${achievement.key}`;

      if (!window.localStorage.getItem(storageKey)) {
        window.localStorage.setItem(storageKey, "shown");
        setGoalAchievementMessage(achievement.message);
        break;
      }
    }
  }, [data]);

  const topRecordCount = data?.personalRecords.records.length ?? 0;
  const hasWorkouts = (data?.progression.points.length ?? 0) > 0;
  const weeklyComplete = data?.consistency.weekly.status === "completed";
  const latestVolume = useMemo(() => {
    const latestPoint = data?.progression.points.at(-1);

    return latestPoint ? latestPoint.totalVolume.toString() : "0";
  }, [data]);

  const updatePersonalRecordPopupPreference = (enabled: boolean) => {
    setArePersonalRecordPopupsEnabled(enabled);
    window.localStorage.setItem(PERSONAL_RECORD_POPUPS_KEY, String(enabled));
  };

  const updateWorkoutSummaryPopupPreference = (enabled: boolean) => {
    setAreWorkoutSummaryPopupsEnabled(enabled);
    window.localStorage.setItem(WORKOUT_SUMMARY_POPUPS_KEY, String(enabled));
  };

  const openSettings = (section: SettingsSection) => {
    setActiveSettingsSection(section);
    setIsSettingsOpen(true);
  };

  const openCreateWorkout = (draft: CreateWorkoutInitialDraft | null = null) => {
    setCreateWorkoutInitialDraft(draft);
    setIsCreateOpen(true);
  };

  const showTemporaryBanner = (message: string) => {
    setBannerMessage(message);
    window.setTimeout(() => setBannerMessage(null), 5000);
  };

  const saveWorkoutAsTemplate = async (workout: WorkoutResponse) => {
    const templateName =
      window.prompt("Template name", `${workout.name} template`)?.trim() ?? "";

    if (!templateName) {
      return;
    }

    setIsTemplateActionLoading(true);

    try {
      const response = await fetch("/api/templates", {
        body: JSON.stringify({
          name: templateName,
          category: workout.category,
          exercises: workout.exercises.map((exercise, exerciseIndex) => ({
            name: exercise.name,
            order: exerciseIndex + 1,
            sets: exercise.sets.map((set, setIndex) => ({
              setType: set.setType,
              order: setIndex + 1,
            })),
          })),
        }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        showTemporaryBanner(
          await readApiError(response, "Could not save template."),
        );
        return;
      }

      await loadDashboard();
      showTemporaryBanner("Template saved. It will not affect progress yet.");
    } catch {
      showTemporaryBanner("Could not reach the server while saving template.");
    } finally {
      setIsTemplateActionLoading(false);
    }
  };

  const startWorkoutFromTemplate = async (template: WorkoutTemplateResponse) => {
    setIsTemplateActionLoading(true);

    try {
      const response = await fetch(`/api/templates/${template.id}/start`, {
        credentials: "include",
        method: "POST",
      });

      if (!response.ok) {
        showTemporaryBanner(
          await readApiError(response, "Could not start workout from template."),
        );
        return;
      }

      openCreateWorkout((await response.json()) as CreateWorkoutInitialDraft);
    } catch {
      showTemporaryBanner("Could not reach the server while starting template.");
    } finally {
      setIsTemplateActionLoading(false);
    }
  };

  const deleteTemplate = async (template: WorkoutTemplateResponse) => {
    const confirmed = window.confirm(
      "Deleting this template will not delete any saved workouts. Do you want to continue?",
    );

    if (!confirmed) {
      return;
    }

    setIsTemplateActionLoading(true);

    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        credentials: "include",
        method: "DELETE",
      });

      if (!response.ok) {
        showTemporaryBanner(
          await readApiError(response, "Could not delete template."),
        );
        return;
      }

      await loadDashboard();
      showTemporaryBanner("Template deleted. Saved workouts were not changed.");
    } catch {
      showTemporaryBanner("Could not reach the server while deleting template.");
    } finally {
      setIsTemplateActionLoading(false);
    }
  };

  const showPostWorkoutFeedback = useCallback(
    async (workout: WorkoutResponse) => {
      if (
        (!arePersonalRecordPopupsEnabled && !areWorkoutSummaryPopupsEnabled) ||
        typeof window === "undefined"
      ) {
        return;
      }

      try {
        const summary = await requestJson<WorkoutSummaryResponse>(
          `/api/workouts/${workout.id}/summary`,
        );
        const exerciseRecords = summary.personalRecords.filter(
          (record) =>
            record.scope === "exercise" &&
            [
              "highest-weight",
              "exercise-volume",
              "best-repetitions",
            ].includes(record.metric),
        );
        const unseenRecords = exerciseRecords.filter((record) => {
          const key = [
            SHOWN_PERSONAL_RECORD_KEY_PREFIX,
            record.workoutId,
            record.exerciseId,
            record.metric,
            record.value,
          ].join(":");

          return !window.localStorage.getItem(key);
        });

        if (unseenRecords.length === 0) {
          if (areWorkoutSummaryPopupsEnabled) {
            setWorkoutSummaryPopup(summary);
          }
          return;
        }

        for (const record of unseenRecords) {
          const key = [
            SHOWN_PERSONAL_RECORD_KEY_PREFIX,
            record.workoutId,
            record.exerciseId,
            record.metric,
            record.value,
          ].join(":");
          window.localStorage.setItem(key, "shown");
        }

        if (arePersonalRecordPopupsEnabled) {
          setPendingWorkoutSummary(
            areWorkoutSummaryPopupsEnabled ? summary : null,
          );
          setPersonalRecordPopupRecords(unseenRecords);
          return;
        }

        if (areWorkoutSummaryPopupsEnabled) {
          setWorkoutSummaryPopup(summary);
        }
      } catch (caughtError) {
        if (isUnauthorizedRequestError(caughtError)) {
          redirectToLogin();
          return;
        }

        setBannerMessage(
          "Workout saved, but the summary could not be checked right now.",
        );
        window.setTimeout(() => setBannerMessage(null), 5000);
      }
    },
    [
      arePersonalRecordPopupsEnabled,
      areWorkoutSummaryPopupsEnabled,
      redirectToLogin,
    ],
  );

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (error || !data) {
    return (
      <DashboardError
        message={error ?? "Dashboard data could not be loaded."}
        onRetry={loadDashboard}
      />
    );
  }

  return (
    <main className="min-h-screen px-4 pb-24 pt-5 sm:px-6 sm:pb-8 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <DashboardNav />

        <header className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm shadow-[#1f3a45]/5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                Training command center
              </p>
              <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">
                Your progress is already happening.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Log the next session, keep streaks visible and watch the volume
                story build before physical changes catch up.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm shadow-[#1f3a45]/5 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20"
                onClick={() => openSettings("streak")}
                type="button"
              >
                Settings
              </button>
              <button
                aria-label="Create workout"
                className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-5 z-40 h-14 w-14 rounded-full bg-[var(--accent)] text-3xl font-light leading-none text-white shadow-xl shadow-[#1f3a45]/25 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 sm:static sm:min-h-11 sm:w-auto sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-sm sm:font-semibold"
                onClick={() => openCreateWorkout()}
                title="Create workout"
                type="button"
              >
                +
                <span className="hidden sm:inline"> Create workout</span>
              </button>
            </div>
          </div>
        </header>

        {bannerMessage ? <AchievementBanner message={bannerMessage} /> : null}
        {weeklyComplete ? (
          <AchievementBanner message="Weekly goal completed. That streak energy counts." />
        ) : null}

        {!hasWorkouts ? (
          <EmptyOnboarding onCreateWorkout={() => openCreateWorkout()} />
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.35fr)]">
          <div className="flex flex-col gap-6">
            <div className="order-2 xl:order-1">
              <ConsistencyCard
                consistency={data.consistency}
                goals={data.goals}
                onEditGoals={() => openSettings("streak")}
              />
            </div>

            <div className="order-1 xl:order-2">
              <TemplateManagementCard
                isBusy={isTemplateActionLoading}
                onCreate={() => {
                  setEditingTemplate(null);
                  setIsTemplateEditorOpen(true);
                }}
                onDelete={deleteTemplate}
                onEdit={(template) => {
                  setEditingTemplate(template);
                  setIsTemplateEditorOpen(true);
                }}
                onStart={startWorkoutFromTemplate}
                templates={data.templates}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <SummaryCard
                label="Total Volume"
                value={data.progression.totalVolume.toString()}
                detail="Every saved set converted into measurable progress."
              />
              <SummaryCard
                label="Latest Workout Volume"
                value={latestVolume}
                detail="Your most recent training volume point."
              />
              <SummaryCard
                label="Personal Records"
                value={topRecordCount.toString()}
                detail="Current best efforts from existing workouts."
              />
            </div>

            <ProgressionChart points={data.progression.points} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <WorkoutManagementCard
            workouts={data.workouts}
            onCreate={() => openCreateWorkout()}
            onDuplicate={() => setIsDuplicateOpen(true)}
            onEdit={setEditingWorkout}
            onSaveAsTemplate={saveWorkoutAsTemplate}
          />

          <PersonalRecordsCard personalRecords={data.personalRecords} />
        </div>

        <CreateWorkoutModal
          initialDraft={createWorkoutInitialDraft}
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setCreateWorkoutInitialDraft(null);
          }}
          onCreated={(workout) => {
            void loadDashboard().then((nextData) => {
              setBannerMessage(
                "Workout created. Your evolution graph just got a new point.",
              );
              window.setTimeout(() => setBannerMessage(null), 5000);

              if (nextData) {
                void showPostWorkoutFeedback(workout);
              }
            });
          }}
          templates={data.templates}
        />

        <TemplateEditorModal
          isOpen={isTemplateEditorOpen}
          onClose={() => {
            setIsTemplateEditorOpen(false);
            setEditingTemplate(null);
          }}
          onSaved={() => {
            void loadDashboard().then(() => {
              showTemporaryBanner("Template saved.");
            });
          }}
          template={editingTemplate}
        />

        <DuplicateWorkoutModal
          isOpen={isDuplicateOpen}
          onClose={() => setIsDuplicateOpen(false)}
          onDuplicated={(workout) => {
            setIsDuplicateOpen(false);
            setEditingWorkout(workout);
            void loadDashboard().then(() => {
              setBannerMessage(
                "Workout duplicated with today's date. Review it before saving edits.",
              );
              window.setTimeout(() => setBannerMessage(null), 5000);
            });
          }}
          workouts={data.workouts}
        />

        <EditWorkoutModal
          onClose={() => setEditingWorkout(null)}
          onDeleted={(message) => {
            setEditingWorkout(null);
            void loadDashboard().then(() => {
              setBannerMessage(message);
              window.setTimeout(() => setBannerMessage(null), 5000);
            });
          }}
          onSaved={(message, workout) => {
            setEditingWorkout(null);
            void loadDashboard().then(() => {
              setBannerMessage(message);
              window.setTimeout(() => setBannerMessage(null), 5000);
              void showPostWorkoutFeedback(workout);
            });
          }}
          workout={editingWorkout}
        />

        <SettingsSidebar
          activeSection={activeSettingsSection}
          arePersonalRecordPopupsEnabled={arePersonalRecordPopupsEnabled}
          areWorkoutSummaryPopupsEnabled={areWorkoutSummaryPopupsEnabled}
          goals={data.goals}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onPersonalRecordPopupsChange={updatePersonalRecordPopupPreference}
          onSaved={() => {
            void loadConsistencyData().then(() => {
              setBannerMessage("Streak settings saved.");
              window.setTimeout(() => setBannerMessage(null), 5000);
            });
          }}
          onWorkoutSummaryPopupsChange={updateWorkoutSummaryPopupPreference}
        />

        <GoalAchievementPopup
          message={goalAchievementMessage}
          onClose={() => setGoalAchievementMessage(null)}
        />

        <PersonalRecordPopup
          records={personalRecordPopupRecords}
          onClose={() => {
            setPersonalRecordPopupRecords([]);
            if (pendingWorkoutSummary) {
              setWorkoutSummaryPopup(pendingWorkoutSummary);
              setPendingWorkoutSummary(null);
            }
          }}
        />

        <WorkoutSummaryPopup
          summary={workoutSummaryPopup}
          onClose={() => setWorkoutSummaryPopup(null)}
        />
      </section>
    </main>
  );
}
