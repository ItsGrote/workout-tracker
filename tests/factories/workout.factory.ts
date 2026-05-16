import type { CreateWorkoutInput } from "@/server/validations/workout.validation";

export const TEST_USER_A_ID = "user_test_a_01";
export const TEST_USER_B_ID = "user_test_b_01";
export const TEST_WORKOUT_ID = "workout_test_01";
export const TEST_EXERCISE_ID = "exercise_test_01";
export const TEST_SET_ID = "set_test_01";

export const createWorkoutInput = (
  overrides: Partial<CreateWorkoutInput> = {},
): CreateWorkoutInput => ({
  name: "Push A",
  category: "Chest",
  date: new Date("2026-05-10T12:00:00.000Z"),
  exercises: [
    {
      name: "Bench Press",
      order: 1,
      sets: [
        {
          repetitions: 10,
          weightKg: 60,
          setType: "working",
          order: 1,
        },
      ],
    },
  ],
  ...overrides,
});

export const createWorkoutRecord = () => ({
  id: TEST_WORKOUT_ID,
  userId: TEST_USER_A_ID,
  name: "Push A",
  category: "Chest",
  date: new Date("2026-05-01T12:00:00.000Z"),
  createdAt: new Date("2026-05-01T12:00:00.000Z"),
  updatedAt: new Date("2026-05-01T12:00:00.000Z"),
  exercises: [
    {
      id: TEST_EXERCISE_ID,
      workoutId: TEST_WORKOUT_ID,
      name: "Bench Press",
      order: 1,
      sets: [
        {
          id: TEST_SET_ID,
          exerciseId: TEST_EXERCISE_ID,
          repetitions: 10,
          weightKg: 60,
          setType: "WORKING",
          order: 1,
        },
      ],
    },
  ],
});
