import { z } from "zod";
import { EXERCISE_SET_TYPES } from "@/server/types/workout.types";

const idSchema = z.string().trim().min(1).max(128);
const nameSchema = z.string().trim().min(1).max(80);
const categorySchema = z.string().trim().min(1).max(60);
const orderSchema = z.number().int().min(1).max(100);

export const templateSetTypeSchema = z.enum(EXERCISE_SET_TYPES);

export const exerciseSetTemplateSchema = z.object({
  setType: templateSetTypeSchema,
  order: orderSchema,
});

export const exerciseTemplateSchema = z.object({
  name: nameSchema,
  order: orderSchema,
  sets: z.array(exerciseSetTemplateSchema).min(1).max(30),
});

export const createWorkoutTemplateSchema = z.object({
  name: nameSchema,
  category: categorySchema.nullable().optional(),
  exercises: z.array(exerciseTemplateSchema).min(1).max(50),
});

export const updateWorkoutTemplateSchema = z
  .object({
    name: nameSchema.optional(),
    category: categorySchema.nullable().optional(),
    exercises: z.array(exerciseTemplateSchema).min(1).max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const templateIdSchema = z.object({
  id: idSchema,
});

export type CreateWorkoutTemplateInput = z.infer<
  typeof createWorkoutTemplateSchema
>;
export type UpdateWorkoutTemplateInput = z.infer<
  typeof updateWorkoutTemplateSchema
>;
