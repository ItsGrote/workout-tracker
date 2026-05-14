import { z } from "zod";
import { EXERCISE_SET_TYPES } from "@/server/types/workout.types";

const nameSchema = z.string().trim().min(1).max(80);
const categorySchema = z.string().trim().min(1).max(60);
const orderSchema = z.number().int().min(1).max(100);
const repetitionsSchema = z.number().int().min(0).max(300);
const weightSchema = z.number().min(0).max(2000);
const idSchema = z.string().trim().min(1).max(128);
const dateSchema = z.coerce
  .date()
  .refine((date) => !Number.isNaN(date.getTime()), "Invalid date");

export const exerciseSetTypeSchema = z.enum(EXERCISE_SET_TYPES);

export const exerciseSetSchema = z.object({
  repetitions: repetitionsSchema,
  weightKg: weightSchema,
  setType: exerciseSetTypeSchema,
  order: orderSchema,
});

export const exerciseSchema = z.object({
  name: nameSchema,
  order: orderSchema,
  sets: z.array(exerciseSetSchema).min(1).max(30),
});

export const createWorkoutSchema = z.object({
  name: nameSchema,
  category: categorySchema.optional(),
  date: dateSchema,
  exercises: z.array(exerciseSchema).min(1).max(50),
});

export const updateWorkoutSchema = z
  .object({
    name: nameSchema.optional(),
    category: categorySchema.nullable().optional(),
    date: dateSchema.optional(),
    exercises: z.array(exerciseSchema).min(1).max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const workoutFiltersSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    category: categorySchema.optional(),
    fromDate: dateSchema.optional(),
    toDate: dateSchema.optional(),
    exerciseName: nameSchema.optional(),
    search: z.string().trim().min(1).max(80).optional(),
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

export const workoutIdSchema = z.object({
  id: idSchema,
});

export const userIdSchema = idSchema;

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type WorkoutFiltersInput = z.infer<typeof workoutFiltersSchema>;
export type WorkoutIdInput = z.infer<typeof workoutIdSchema>;
