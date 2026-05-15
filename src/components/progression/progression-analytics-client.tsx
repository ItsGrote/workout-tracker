"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LogoutButton } from "@/components/auth/logout-button";
import { SearchableSelect } from "./searchable-select";

type AnalyticsTarget = "workout" | "exercise";
type WorkoutFilter = "name" | "category";
type RangeOption = "7d" | "30d" | "90d" | "1y" | "all";
type ChartKind = "bar" | "line";
type ExerciseMetric = "volume" | "max-weight" | "average-reps";

type AnalyticsPoint = {
  date: string;
  label: string;
  volume: number;
  maxWeight?: number;
  averageReps?: number;
  averageWeight?: number;
};

type AnalyticsResponse = {
  options: {
    workoutNames: string[];
    workoutCategories: string[];
    exerciseNames: string[];
  };
  points: AnalyticsPoint[];
};

type SavedPreferences = {
  target?: AnalyticsTarget;
  workoutFilter?: WorkoutFilter;
  selectedValue?: string;
  range?: RangeOption;
  chartKind?: ChartKind;
  exerciseMetric?: ExerciseMetric;
  showAverageWeight?: boolean;
};

const PREFERENCES_KEY = "workout-evolution-progression-analytics";

const rangeOptions: { label: string; value: RangeOption }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "1 year", value: "1y" },
  { label: "All time", value: "all" },
];

const metricOptions: { label: string; value: ExerciseMetric }[] = [
  { label: "Volume", value: "volume" },
  { label: "Max weight", value: "max-weight" },
  { label: "Average reps", value: "average-reps" },
];

const metricKey: Record<ExerciseMetric, keyof AnalyticsPoint> = {
  volume: "volume",
  "max-weight": "maxWeight",
  "average-reps": "averageReps",
};

const metricLabel: Record<ExerciseMetric, string> = {
  volume: "Volume",
  "max-weight": "Max weight",
  "average-reps": "Average reps",
};

const requestAnalytics = async (params: URLSearchParams) => {
  const response = await fetch(`/api/progression/analytics?${params.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(body?.error ?? "Could not load progression analytics.");
  }

  return response.json() as Promise<AnalyticsResponse>;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(new Date(date));

const loadPreferences = (): SavedPreferences => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    return raw ? (JSON.parse(raw) as SavedPreferences) : {};
  } catch {
    return {};
  }
};

export function ProgressionAnalyticsClient() {
  const [target, setTarget] = useState<AnalyticsTarget | "">("");
  const [workoutFilter, setWorkoutFilter] = useState<WorkoutFilter>("name");
  const [selectedValue, setSelectedValue] = useState("");
  const [range, setRange] = useState<RangeOption>("30d");
  const [chartKind, setChartKind] = useState<ChartKind>("bar");
  const [exerciseMetric, setExerciseMetric] =
    useState<ExerciseMetric>("volume");
  const [showAverageWeight, setShowAverageWeight] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedOptions = useMemo(() => {
    if (!analytics) {
      return [];
    }

    if (target === "exercise") {
      return analytics.options.exerciseNames;
    }

    return workoutFilter === "name"
      ? analytics.options.workoutNames
      : analytics.options.workoutCategories;
  }, [analytics, target, workoutFilter]);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        range,
        exerciseMetric,
      });

      if (target) {
        params.set("target", target);
      }

      if (target === "workout") {
        params.set("workoutFilter", workoutFilter);
      }

      if (selectedValue) {
        params.set("selectedValue", selectedValue);
      }

      const nextAnalytics = await requestAnalytics(params);
      setAnalytics(nextAnalytics);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load progression analytics.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [exerciseMetric, range, selectedValue, target, workoutFilter]);

  useEffect(() => {
    const preferences = loadPreferences();

    if (preferences.target) {
      setTarget(preferences.target);
    }
    if (preferences.workoutFilter) {
      setWorkoutFilter(preferences.workoutFilter);
    }
    if (preferences.selectedValue) {
      setSelectedValue(preferences.selectedValue);
    }
    if (preferences.range) {
      setRange(preferences.range);
    }
    if (preferences.chartKind) {
      setChartKind(preferences.chartKind);
    }
    if (preferences.exerciseMetric) {
      setExerciseMetric(preferences.exerciseMetric);
    }
    if (typeof preferences.showAverageWeight === "boolean") {
      setShowAverageWeight(preferences.showAverageWeight);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        target: target || undefined,
        workoutFilter,
        selectedValue,
        range,
        chartKind,
        exerciseMetric,
        showAverageWeight,
      }),
    );
  }, [
    chartKind,
    exerciseMetric,
    range,
    selectedValue,
    showAverageWeight,
    target,
    workoutFilter,
  ]);

  useEffect(() => {
    if (!analytics || !selectedValue) {
      return;
    }

    if (!selectedOptions.includes(selectedValue)) {
      setSelectedValue("");
    }
  }, [analytics, selectedOptions, selectedValue]);

  const chartData = useMemo(
    () =>
      (analytics?.points ?? []).map((point) => ({
        ...point,
        chartValue:
          target === "exercise"
            ? Number(point[metricKey[exerciseMetric]] ?? 0)
            : point.volume,
        displayDate: formatDate(point.date),
      })),
    [analytics, exerciseMetric, target],
  );

  const hasNoData =
    analytics &&
    analytics.options.workoutNames.length === 0 &&
    analytics.options.exerciseNames.length === 0;
  const canShowChart = Boolean(target && selectedValue);
  const selectionEmptyMessage =
    target === "exercise" ? "No exercises found yet." : "No workouts found yet.";

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <nav className="flex flex-col gap-3 rounded border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--muted)]"
              href="/"
            >
              Dashboard
            </Link>
            <Link
              className="rounded bg-[var(--foreground)] px-3 py-2 text-sm font-medium text-white"
              href="/progression"
            >
              Progression
            </Link>
          </div>
          <LogoutButton />
        </nav>

        <header>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
            Custom analytics
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Build the exact evolution chart you want.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Pick a workout or exercise, choose a timeframe, then switch between
            volume, load and repetition trends.
          </p>
        </header>

        <section className="rounded border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="grid gap-4 lg:grid-cols-4">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Chart type
              <select
                className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                onChange={(event) => {
                  setTarget(event.target.value as AnalyticsTarget);
                  setSelectedValue("");
                }}
                value={target}
              >
                <option value="">Choose chart type</option>
                <option value="workout">Workout</option>
                <option value="exercise">Exercise</option>
              </select>
            </label>

            {target === "workout" ? (
              <label className="flex flex-col gap-2 text-sm font-medium">
                Workout filter
                <select
                  className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                  onChange={(event) => {
                    setWorkoutFilter(event.target.value as WorkoutFilter);
                    setSelectedValue("");
                  }}
                  value={workoutFilter}
                >
                  <option value="name">Workout name</option>
                  <option value="category">Workout category</option>
                </select>
              </label>
            ) : null}

            <SearchableSelect
              disabled={!target || isLoading}
              emptyMessage={selectionEmptyMessage}
              label={
                target === "exercise"
                  ? "Exercise"
                  : workoutFilter === "name"
                    ? "Workout name"
                    : "Workout category"
              }
              onChange={setSelectedValue}
              options={selectedOptions}
              placeholder={
                target ? "Search and select an option" : "Choose chart type first"
              }
              value={selectedValue}
            />

            <label className="flex flex-col gap-2 text-sm font-medium">
              Time range
              <select
                className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                onChange={(event) => setRange(event.target.value as RangeOption)}
                value={range}
              >
                {rangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Chart style
              <select
                className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                onChange={(event) => setChartKind(event.target.value as ChartKind)}
                value={chartKind}
              >
                <option value="bar">Bar chart</option>
                <option value="line">Line chart</option>
              </select>
            </label>

            {target === "exercise" ? (
              <>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Y axis
                  <select
                    className="rounded border border-[var(--border)] px-3 py-2 font-normal outline-none focus:border-[var(--accent)]"
                    onChange={(event) =>
                      setExerciseMetric(event.target.value as ExerciseMetric)
                    }
                    value={exerciseMetric}
                  >
                    {metricOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-end gap-2 pb-2 text-sm font-medium">
                  <input
                    checked={showAverageWeight}
                    onChange={(event) =>
                      setShowAverageWeight(event.target.checked)
                    }
                    type="checkbox"
                  />
                  Show average weight
                </label>
              </>
            ) : null}
          </div>
        </section>

        <section className="rounded border border-[var(--border)] bg-[var(--surface)] p-5">
          {isLoading ? (
            <p className="rounded border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
              Loading progression options...
            </p>
          ) : error ? (
            <div className="rounded border border-[#e1b8b8] bg-[#fff7f7] p-4 text-sm text-[#7b3b3b]">
              {error}
            </div>
          ) : hasNoData ? (
            <p className="rounded border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
              No workouts found yet.
            </p>
          ) : !canShowChart ? (
            <p className="rounded border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
              Choose a chart type and select a saved item to build a custom
              progression chart.
            </p>
          ) : chartData.length === 0 ? (
            <p className="rounded border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
              Not enough data yet to build this chart.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedValue} -{" "}
                    {target === "exercise"
                      ? metricLabel[exerciseMetric]
                      : "Workout volume"}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {chartData.length} point{chartData.length === 1 ? "" : "s"}{" "}
                    ordered by date.
                  </p>
                </div>
                {chartData.length === 1 ? (
                  <p className="rounded border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)]">
                    Add more workouts to see a clearer trend.
                  </p>
                ) : null}
              </div>

              <div className="mt-5 h-[340px]">
                <ResponsiveContainer height="100%" width="100%">
                  {chartKind === "bar" ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="displayDate" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="chartValue" fill="var(--accent)" />
                      {target === "exercise" && showAverageWeight ? (
                        <Bar dataKey="averageWeight" fill="#4f6f91" />
                      ) : null}
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="displayDate" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        dataKey="chartValue"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        type="monotone"
                      />
                      {target === "exercise" && showAverageWeight ? (
                        <Line
                          dataKey="averageWeight"
                          stroke="#4f6f91"
                          strokeWidth={2}
                          type="monotone"
                        />
                      ) : null}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
