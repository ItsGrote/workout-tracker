"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AchievementBanner } from "./achievement-banner";
import { ConsistencyCard } from "./consistency-card";
import { CreateWorkoutModal } from "./create-workout-modal";
import { DashboardNav } from "./dashboard-nav";
import { DashboardError } from "./dashboard-error";
import { DashboardLoading } from "./dashboard-loading";
import { EmptyOnboarding } from "./empty-onboarding";
import { PersonalRecordsCard } from "./personal-records-card";
import { ProgressionChart } from "./progression-chart";
import { SummaryCard } from "./summary-card";
import type { DashboardData } from "./types";

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
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [progression, consistency, goals, personalRecords] =
        await Promise.all([
          requestJson<DashboardData["progression"]>("/api/progression"),
          requestJson<DashboardData["consistency"]>("/api/consistency"),
          requestJson<DashboardData["goals"]>("/api/goals"),
          requestJson<DashboardData["personalRecords"]>(
            "/api/personal-records",
          ),
        ]);

      const nextData = { progression, consistency, goals, personalRecords };
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

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

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
          <ConsistencyCard consistency={data.consistency} goals={data.goals} />
          <ProgressionChart points={data.progression.points} />
        </div>

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
      </section>
    </main>
  );
}
