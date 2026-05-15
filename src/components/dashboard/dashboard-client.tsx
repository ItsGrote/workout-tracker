"use client";

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
import { PersonalRecordsCard } from "./personal-records-card";
import { ProgressionChart } from "./progression-chart";
import { StreakSettingsModal } from "./streak-settings-modal";
import { SummaryCard } from "./summary-card";
import { WorkoutManagementCard } from "./workout-management-card";
import type { DashboardData, WorkoutResponse } from "./types";

const requestJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(path, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  return response.json() as Promise<T>;
};

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isStreakSettingsOpen, setIsStreakSettingsOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutResponse | null>(
    null,
  );
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [goalAchievementMessage, setGoalAchievementMessage] = useState<
    string | null
  >(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [progression, consistency, goals, personalRecords, workouts] =
        await Promise.all([
          requestJson<DashboardData["progression"]>("/api/progression"),
          requestJson<DashboardData["consistency"]>("/api/consistency"),
          requestJson<DashboardData["goals"]>("/api/goals"),
          requestJson<DashboardData["personalRecords"]>(
            "/api/personal-records",
          ),
          requestJson<DashboardData["workouts"]>("/api/workouts"),
        ]);

      const nextData = {
        progression,
        consistency,
        goals,
        personalRecords,
        workouts,
      };
      setData(nextData);

      return nextData;
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load dashboard data.",
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load consistency data.",
      );
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

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
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <DashboardNav />

        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
            Training command center
          </p>
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Your progress is already happening.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                See consistency, volume and records before visible body changes
                catch up.
              </p>
            </div>
            <button
              className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-[var(--accent)] text-3xl font-light leading-none text-white shadow-xl sm:static sm:h-auto sm:w-auto sm:rounded sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
              onClick={() => setIsCreateOpen(true)}
              title="Create workout"
              type="button"
            >
              +
              <span className="hidden sm:inline"> Create workout</span>
            </button>
          </div>
        </header>

        {bannerMessage ? <AchievementBanner message={bannerMessage} /> : null}
        {weeklyComplete ? (
          <AchievementBanner message="Weekly goal completed. That streak energy counts." />
        ) : null}

        {!hasWorkouts ? (
          <EmptyOnboarding onCreateWorkout={() => setIsCreateOpen(true)} />
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.4fr)]">
          <ConsistencyCard
            consistency={data.consistency}
            goals={data.goals}
            onEditGoals={() => setIsStreakSettingsOpen(true)}
          />
          <ProgressionChart points={data.progression.points} />
        </div>

        <WorkoutManagementCard
          workouts={data.workouts}
          onCreate={() => setIsCreateOpen(true)}
          onDuplicate={() => setIsDuplicateOpen(true)}
          onEdit={setEditingWorkout}
        />

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

        <PersonalRecordsCard personalRecords={data.personalRecords} />

        <CreateWorkoutModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            const previousNewRecordCount = data.personalRecords.newRecords.length;

            void loadDashboard().then((nextData) => {
              const nextNewRecordCount =
                nextData?.personalRecords.newRecords.length ??
                previousNewRecordCount;

              setBannerMessage(
                nextNewRecordCount > previousNewRecordCount
                  ? "Workout created and a new personal record was unlocked."
                  : "Workout created. Your evolution graph just got a new point.",
              );
              window.setTimeout(() => setBannerMessage(null), 5000);
            });
          }}
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
          onSaved={(message) => {
            setEditingWorkout(null);
            void loadDashboard().then(() => {
              setBannerMessage(message);
              window.setTimeout(() => setBannerMessage(null), 5000);
            });
          }}
          workout={editingWorkout}
        />

        <StreakSettingsModal
          goals={data.goals}
          isOpen={isStreakSettingsOpen}
          onClose={() => setIsStreakSettingsOpen(false)}
          onSaved={() => {
            void loadConsistencyData().then(() => {
              setBannerMessage("Streak settings saved.");
              window.setTimeout(() => setBannerMessage(null), 5000);
            });
          }}
        />

        <GoalAchievementPopup
          message={goalAchievementMessage}
          onClose={() => setGoalAchievementMessage(null)}
        />
      </section>
    </main>
  );
}
