import { z } from "zod";

const idSchema = z.string().trim().min(1).max(128);
const nameSchema = z.string().trim().min(1).max(80);
const categorySchema = z.string().trim().min(1).max(60);
const dateSchema = z.coerce
  .date()
  .refine((date) => !Number.isNaN(date.getTime()), "Invalid date");

export const userIdSchema = idSchema;

export const progressionFiltersSchema = z
  .object({
    exerciseName: nameSchema.optional(),
    category: categorySchema.optional(),
    fromDate: dateSchema.optional(),
    toDate: dateSchema.optional(),
  })
  .refine(
    (data) =>
      !data.fromDate ||
      !data.toDate ||
      data.fromDate.getTime() <= data.toDate.getTime(),
    {
      message: "fromDate must be before or equal to toDate",
      path: ["fromDate"],
    },
  );

export type ProgressionFiltersInput = z.infer<typeof progressionFiltersSchema>;

