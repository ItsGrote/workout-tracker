import { z } from "zod";
import { EXERCISE_SET_TYPES } from "@/server/types/workout.types";

const idSchema = z.string().trim().min(1).max(128);
const nameSchema = z.string().trim().min(1).max(80);
const orderSchema = z.number().int().min(1).max(100);
const repetitionsSchema = z.number().int().min(0).max(300);
const weightSchema = z.number().min(0).max(2000);
const dateSchema = z.coerce
  .date()
  .refine((date) => !Number.isNaN(date.getTime()), "Invalid date");

export const exerciseSetTypeSchema = z.enum(EXERCISE_SET_TYPES);

export const exerciseSetPayloadSchema = z.object({
  repetitions: repetitionsSchema,
  weightKg: weightSchema,
  setType: exerciseSetTypeSchema,
  order: orderSchema,
});

export const createExerciseSchema = z.object({
  name: nameSchema,
  order: orderSchema,
  sets: z.array(exerciseSetPayloadSchema).min(1).max(30).optional(),
});

export const updateExerciseSchema = z
  .object({
    name: nameSchema.optional(),
    order: orderSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const createExerciseSetSchema = exerciseSetPayloadSchema;

export const updateExerciseSetSchema = exerciseSetPayloadSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const exerciseHistoryFiltersSchema = z
  .object({
    name: nameSchema.optional(),
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

export const workoutIdSchema = z.object({ workoutId: idSchema });
export const exerciseIdSchema = z.object({ exerciseId: idSchema });
export const setIdSchema = z.object({ setId: idSchema });
export const userIdSchema = idSchema;

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type CreateExerciseSetInput = z.infer<typeof createExerciseSetSchema>;
export type UpdateExerciseSetInput = z.infer<typeof updateExerciseSetSchema>;
export type ExerciseHistoryFiltersInput = z.infer<
  typeof exerciseHistoryFiltersSchema
>;

