import { TEST_USER_A_ID } from "./workout.factory";
import type { CreateWorkoutTemplateInput } from "@/server/validations/template.validation";

export const TEST_TEMPLATE_ID = "template_test_01";
export const TEST_TEMPLATE_EXERCISE_ID = "template_exercise_test_01";
export const TEST_TEMPLATE_SET_ID = "template_set_test_01";

export const createTemplateInput = (
  overrides: Partial<CreateWorkoutTemplateInput> = {},
): CreateWorkoutTemplateInput => ({
  name: "Chest + Arms",
  category: "Chest + Arms",
  exercises: [
    {
      name: "Bench Press",
      order: 1,
      sets: [
        {
          setType: "working",
          order: 1,
        },
      ],
    },
  ],
  ...overrides,
});

export const createTemplateRecord = () => ({
  id: TEST_TEMPLATE_ID,
  userId: TEST_USER_A_ID,
  name: "Chest + Arms",
  category: "Chest + Arms",
  createdAt: new Date("2026-05-01T12:00:00.000Z"),
  updatedAt: new Date("2026-05-01T12:00:00.000Z"),
  exercises: [
    {
      id: TEST_TEMPLATE_EXERCISE_ID,
      templateId: TEST_TEMPLATE_ID,
      name: "Bench Press",
      order: 1,
      sets: [
        {
          id: TEST_TEMPLATE_SET_ID,
          exerciseTemplateId: TEST_TEMPLATE_EXERCISE_ID,
          setType: "WORKING",
          order: 1,
        },
      ],
    },
  ],
});
