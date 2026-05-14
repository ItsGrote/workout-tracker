import { z } from "zod";

const idSchema = z.string().trim().min(1).max(128);
const positiveInteger = z.number().int().positive();

export const userIdSchema = idSchema;

export const updateGoalSchema = z
  .object({
    weeklyGoal: positiveInteger.max(7).nullable().optional(),
    monthlyGoal: positiveInteger.max(31).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one goal must be provided",
  });

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

