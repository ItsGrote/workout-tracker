import { z } from "zod";

export const progressionAnalyticsQuerySchema = z
  .object({
    target: z.enum(["workout", "exercise"]).optional(),
    workoutFilter: z.enum(["name", "category"]).optional(),
    selectedValue: z.string().trim().min(1).max(80).optional(),
    range: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d"),
    exerciseMetric: z
      .enum(["volume", "max-weight", "average-reps"])
      .default("volume"),
  })
  .refine(
    (data) =>
      data.target !== "workout" ||
      !data.selectedValue ||
      Boolean(data.workoutFilter),
    {
      message: "workoutFilter is required when selectedValue is used for workout analytics",
      path: ["workoutFilter"],
    },
  );

export type ProgressionAnalyticsQueryInput = z.infer<
  typeof progressionAnalyticsQuerySchema
>;
