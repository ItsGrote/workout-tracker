import { z } from "zod";

const idSchema = z.string().trim().min(1).max(128);

export const workoutSummaryIdSchema = z.object({
  id: idSchema,
});
