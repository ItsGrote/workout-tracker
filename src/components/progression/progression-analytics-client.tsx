"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  buildAnalyticsSearchParams,
  getSelectedOptions,
  type AnalyticsTarget,
  type ExerciseMetric,
  type RangeOption,
  type WorkoutFilter,
} from "./progression-analytics-state";
import { SearchableSelect } from "./searchable-select";

type ChartKind = "bar" | "line";

type AnalyticsPoint = {
  date: string;
  label: string;
  volume: number;
  maxWeight?: number;
  averageReps?: number;
  averageWeight?: number;
};

type AnalyticsComparison = {
  firstValue: number | null;
  latestValue: number | null;
  message: string;
  percentageChange: number | null;
  status: "ready" | "not_enough_data" | "previous_zero";
};

type WorkoutInsights = {
  averageVolume: number;
  highestVolume: number;
  kind: "workout";
  progression: AnalyticsComparison;
  totalAccumulatedVolume: number;
  workoutsAnalyzed: number;
};

type ExerciseInsights = {
  averageWeight: number;
  highestWeight: number;
  kind: "exercise";
  progression: AnalyticsComparison;
  sessionsAnalyzed: number;
  totalAccumulatedVolume: number;
};

type AnalyticsResponse = {
  options: {
    workoutNames: string[];
    workoutCategories: string[];
    exerciseNames: string[];
  };
  points: AnalyticsPoint[];
  insights: WorkoutInsights | ExerciseInsights | null;
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

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);

const formatVolume = (value: number) => `${formatNumber(value)}kg`;

const insightCardClass =
  "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm shadow-[#1f3a45]/5";

const filterPanelClassName =
  "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm shadow-[#1f3a45]/5";

const emptyStateClassName =
  "rounded-2xl border border-dashed border-[#d8c3a5] bg-[var(--accent-soft)] p-5 text-sm leading-6 text-[var(--muted)] shadow-sm shadow-[#1f3a45]/5 sm:p-6";

const loadingBlockClassName =
  "animate-pulse rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] shadow-sm shadow-[#1f3a45]/5";

const selectClassName =
  "min-h-11 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 font-normal text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 disabled:cursor-not-allowed disabled:bg-[var(--accent-soft)] disabled:opacity-70";

const secondaryActionClassName =
  "min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm shadow-[#1f3a45]/5 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20";

const primaryActionClassName =
  "min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1f3a45]/10 transition hover:bg-[#172b33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

const checkboxClassName =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--accent)]";

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
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const requestSequenceRef = useRef(0);

  const selectedOptions = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return getSelectedOptions(analytics.options, target, workoutFilter);
  }, [analytics, target, workoutFilter]);

  const loadAnalytics = useCallback(async () => {
    if (!hasLoadedPreferences) {
      return;
    }

    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const params = buildAnalyticsSearchParams({
        range,
        exerciseMetric,
        selectedValue,
        target,
        workoutFilter,
      });

      const nextAnalytics = await requestAnalytics(params);
      if (requestSequenceRef.current !== requestId) {
        return;
      }

      setAnalytics(nextAnalytics);
    } catch (caughtError) {
      if (requestSequenceRef.current !== requestId) {
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load progression analytics.",
      );
    } finally {
      if (requestSequenceRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [
    exerciseMetric,
    hasLoadedPreferences,
    range,
    selectedValue,
    target,
    workoutFilter,
  ]);

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
    setHasLoadedPreferences(true);
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (!hasLoadedPreferences || typeof window === "undefined") {
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
    hasLoadedPreferences,
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
        <nav className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm shadow-[#1f3a45]/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              className={secondaryActionClassName}
              href="/"
            >
              Dashboard
            </Link>
            <Link
              className={primaryActionClassName}
              href="/progression"
            >
              Progression
            </Link>
          </div>
          <LogoutButton />
        </nav>

        <header className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm shadow-[#1f3a45]/5 sm:p-6">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
              Progression analytics
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              Investigate the evolution behind each session.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Choose a workout or exercise, narrow the timeframe and read the
              trend through volume, load and repetition signals.
            </p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
          <div className={filterPanelClassName}>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              What are you analyzing?
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Switch between workout-level volume and exercise-level
              performance trends.
            </p>

            <div className="mt-4 grid gap-2">
              <button
                className={`min-h-14 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 ${
                  target === "workout"
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm shadow-[#1f3a45]/15"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                }`}
                onClick={() => {
                  setTarget("workout");
                  setSelectedValue("");
                }}
                type="button"
              >
                <span className="block text-sm font-semibold">
                  Workout Analytics
                </span>
                <span className="mt-1 block text-xs opacity-80">
                  Compare full workout volume over time.
                </span>
              </button>
              <button
                className={`min-h-14 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 ${
                  target === "exercise"
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm shadow-[#1f3a45]/15"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                }`}
                onClick={() => {
                  setTarget("exercise");
                  setSelectedValue("");
                }}
                type="button"
              >
                <span className="block text-sm font-semibold">
                  Exercise Analytics
                </span>
                <span className="mt-1 block text-xs opacity-80">
                  Track volume, weight and reps for one movement.
                </span>
              </button>
            </div>
          </div>

          <div className={filterPanelClassName}>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Analysis filters
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Keep the chart focused on the exact trend you want to inspect.
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {target === "workout" ? (
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Workout filter
                  <select
                    className={selectClassName}
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

              <div className={target === "workout" ? "" : "md:col-span-2"}>
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
                    target
                      ? "Search and select an option"
                      : "Choose analytics type first"
                  }
                  value={selectedValue}
                />
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium">
                Time range
                <select
                  className={selectClassName}
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

              <label className="flex flex-col gap-2 text-sm font-medium">
                Chart style
                <select
                  className={selectClassName}
                  onChange={(event) => setChartKind(event.target.value as ChartKind)}
                  value={chartKind}
                >
                  <option value="bar">Bar chart</option>
                  <option value="line">Line chart</option>
                </select>
              </label>

              {target === "exercise" ? (
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Y axis metric
                  <select
                    className={selectClassName}
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
              ) : null}
            </div>

            {target === "exercise" ? (
              <label className="mt-4 flex min-h-11 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium">
                <input
                  className={checkboxClassName}
                  checked={showAverageWeight}
                  onChange={(event) =>
                    setShowAverageWeight(event.target.checked)
                  }
                  type="checkbox"
                />
                Show average weight
              </label>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm shadow-[#1f3a45]/5 sm:p-6">
          {isLoading ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className={`${loadingBlockClassName} h-3 w-36`} />
                  <div className={`${loadingBlockClassName} mt-3 h-6 w-64 max-w-full`} />
                  <div className={`${loadingBlockClassName} mt-3 h-3 w-72 max-w-full`} />
                </div>
                <div className={`${loadingBlockClassName} h-10 w-48 max-w-full`} />
              </div>
              <div className={`${loadingBlockClassName} h-[320px] sm:h-[380px]`} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className={`${loadingBlockClassName} h-28`} />
                <div className={`${loadingBlockClassName} h-28`} />
                <div className={`${loadingBlockClassName} h-28`} />
                <div className={`${loadingBlockClassName} h-28`} />
                <div className={`${loadingBlockClassName} h-28`} />
              </div>
              <p className="sr-only">Loading progression analytics.</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-[#e1b8b8] bg-[#fff7f7] p-5 text-sm text-[#7b3b3b] shadow-sm shadow-[#1f3a45]/5">
              <p className="inline-flex rounded-full border border-[#e1b8b8] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Analytics unavailable
              </p>
              <p className="mt-3 font-semibold text-[#2b1515]">
                We could not load this progression view.
              </p>
              <p className="mt-1 leading-6">{error}</p>
              <p className="mt-1 leading-6 text-[#7b3b3b]/80">
                Your workouts are safe. Try changing the filter or refreshing
                the page.
              </p>
            </div>
          ) : hasNoData ? (
            <div className={emptyStateClassName}>
              <p className="inline-flex rounded-full border border-[#d8c3a5] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                No training history
              </p>
              <p className="mt-3 font-semibold text-[var(--foreground)]">
                No workouts found yet.
              </p>
              <p className="mt-1">
                Save your first workout to unlock progression analytics.
              </p>
            </div>
          ) : !canShowChart ? (
            <div className={emptyStateClassName}>
              <p className="inline-flex rounded-full border border-[#d8c3a5] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                Choose a signal
              </p>
              <p className="mt-3 font-semibold text-[var(--foreground)]">
                Choose what evolution you want to inspect.
              </p>
              <p className="mt-1">
                Select Workout Analytics or Exercise Analytics, then pick a
                saved item to build the chart.
              </p>
            </div>
          ) : chartData.length === 0 ? (
            <div className={emptyStateClassName}>
              <p className="inline-flex rounded-full border border-[#d8c3a5] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                More data needed
              </p>
              <p className="mt-3 font-semibold text-[var(--foreground)]">
                Not enough data yet to build this chart.
              </p>
              <p className="mt-1">
                Continue logging workouts in this selection to reveal the
                progression line.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
                    {target === "exercise"
                      ? "Exercise evolution"
                      : "Workout evolution"}
                  </p>
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
                  <p className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--muted)]">
                    Add more workouts to see a clearer trend.
                  </p>
                ) : null}
              </div>

              <div className="mt-5 h-[360px] sm:h-[420px]">
                <ResponsiveContainer height="100%" width="100%">
                  {chartKind === "bar" ? (
                    <BarChart data={chartData}>
                      <CartesianGrid stroke="#d8cfc1" strokeDasharray="3 3" />
                      <XAxis dataKey="displayDate" tickLine={false} />
                      <YAxis tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                        }}
                        cursor={{ fill: "#efe4d3" }}
                      />
                      <Bar
                        dataKey="chartValue"
                        fill="var(--accent)"
                        radius={[6, 6, 0, 0]}
                      />
                      {target === "exercise" && showAverageWeight ? (
                        <Bar
                          dataKey="averageWeight"
                          fill="#8d7658"
                          radius={[6, 6, 0, 0]}
                        />
                      ) : null}
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="#d8cfc1" strokeDasharray="3 3" />
                      <XAxis dataKey="displayDate" tickLine={false} />
                      <YAxis tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                        }}
                      />
                      <Line
                        dataKey="chartValue"
                        stroke="var(--accent)"
                        strokeWidth={3}
                        type="monotone"
                      />
                      {target === "exercise" && showAverageWeight ? (
                        <Line
                          dataKey="averageWeight"
                          stroke="#8d7658"
                          strokeWidth={2}
                          type="monotone"
                        />
                      ) : null}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {analytics?.insights ? (
                <div className="mt-6">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {target === "exercise"
                        ? "Exercise insights"
                        : "Workout insights"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Read these as training signals, not scoreboard noise.
                    </p>
                  </div>
                  {analytics.insights.kind === "workout" ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <article className={insightCardClass}>
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          Evolution
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {analytics.insights.progression.percentageChange ===
                          null
                            ? "Not enough yet"
                            : `${analytics.insights.progression.percentageChange > 0 ? "+" : ""}${analytics.insights.progression.percentageChange}%`}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {analytics.insights.progression.message}
                        </p>
                      </article>
                      <article className={insightCardClass}>
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          Highest volume
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {formatVolume(analytics.insights.highestVolume)}
                        </p>
                      </article>
                      <article className={insightCardClass}>
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          Average volume
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {formatVolume(analytics.insights.averageVolume)}
                        </p>
                      </article>
                      <article className={insightCardClass}>
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          Total accumulated volume
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {formatVolume(
                            analytics.insights.totalAccumulatedVolume,
                          )}
                        </p>
                      </article>
                      <article className={insightCardClass}>
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          Workouts analyzed
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {analytics.insights.workoutsAnalyzed}
                        </p>
                      </article>
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <article className={insightCardClass}>
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          Progression
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {analytics.insights.progression.percentageChange ===
                          null
                            ? "Not enough yet"
                            : `${analytics.insights.progression.percentageChange > 0 ? "+" : ""}${analytics.insights.progression.percentageChange}%`}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {analytics.insights.progression.message}
                        </p>
                      </article>
                      <article className={insightCardClass}>
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          Highest weight
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {formatVolume(analytics.insights.highestWeight)}
                        </p>
                      </article>
                      <article className={insightCardClass}>
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          Average weight
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {formatVolume(analytics.insights.averageWeight)}
                        </p>
                      </article>
                      <article className={insightCardClass}>
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          Total accumulated volume
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {formatVolume(
                            analytics.insights.totalAccumulatedVolume,
                          )}
                        </p>
                      </article>
                      <article className={insightCardClass}>
                        <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                          Sessions analyzed
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {analytics.insights.sessionsAnalyzed}
                        </p>
                      </article>
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </section>
      </section>
    </main>
  );
}
