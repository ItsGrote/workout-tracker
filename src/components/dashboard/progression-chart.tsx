"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProgressionPoint } from "./types";

type ProgressionChartProps = {
  points: ProgressionPoint[];
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(new Date(date));

export function ProgressionChart({ points }: ProgressionChartProps) {
  const chartData = points.map((point) => ({
    ...point,
    dateLabel: formatDate(point.date),
  }));

  return (
    <section className="rounded border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Volume Over Time</h2>
        <p className="text-sm text-[var(--muted)]">
          Total workout volume grouped by workout date.
        </p>
      </div>

      <div className="mt-6 h-72 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#d9dee5" strokeDasharray="3 3" />
              <XAxis
                dataKey="dateLabel"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "#eef2f5" }}
                formatter={(value) => [`${value}`, "Volume"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.label ?? "Workout"
                }
              />
              <Bar dataKey="totalVolume" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
            No progression data yet.
          </div>
        )}
      </div>
    </section>
  );
}

