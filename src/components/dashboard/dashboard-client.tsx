"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ConsistencyCard } from "./consistency-card";
import { DashboardError } from "./dashboard-error";
import { DashboardLoading } from "./dashboard-loading";
import { PersonalRecordsCard } from "./personal-records-card";
import { ProgressionChart } from "./progression-chart";
import { SummaryCard } from "./summary-card";
import type { DashboardData } from "./types";
import { LogoutButton } from "@/components/auth/logout-button";

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

      setData({ progression, consistency, goals, personalRecords });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load dashboard data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const topRecordCount = data?.personalRecords.records.length ?? 0;
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
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
            Private dashboard
          </p>
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Workout Evolution Tracker
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Initial MVP dashboard using authenticated backend endpoints.
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Total Volume"
            value={data.progression.totalVolume.toString()}
            detail="All saved workout volume available for this user."
          />
          <SummaryCard
            label="Latest Workout Volume"
            value={latestVolume}
            detail="Most recent point returned by progression data."
          />
          <SummaryCard
            label="Personal Records"
            value={topRecordCount.toString()}
            detail="Calculated best efforts from existing workouts."
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <ProgressionChart points={data.progression.points} />
          <ConsistencyCard consistency={data.consistency} goals={data.goals} />
        </div>

        <PersonalRecordsCard personalRecords={data.personalRecords} />
      </section>
    </main>
  );
}
