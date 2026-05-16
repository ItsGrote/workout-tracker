import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createWorkoutInput,
  createWorkoutRecord,
  TEST_USER_A_ID,
  TEST_USER_B_ID,
  TEST_WORKOUT_ID,
} from "../factories/workout.factory";
import {
  createWorkoutSchema,
  updateWorkoutSchema,
} from "@/server/validations/workout.validation";

const workoutRepositoryMock = vi.hoisted(() => ({
  createWithExercises: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
  updateWithExercises: vi.fn(),
}));

vi.mock("@/server/repositories/workout.repository", () => ({
  workoutRepository: workoutRepositoryMock,
}));

describe("workoutService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("creates a valid workout with mapped exercise sets", async () => {
    const { workoutService } = await import("@/server/services/workout.service");
    const input = createWorkoutSchema.parse(
      createWorkoutInput({
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
              {
                repetitions: 8,
                weightKg: 40,
                setType: "warm-up",
                order: 2,
              },
            ],
          },
          {
            name: "Incline Press",
            order: 2,
            sets: [
              {
                repetitions: 12,
                weightKg: 30,
                setType: "recognition-activation",
                order: 1,
              },
            ],
          },
        ],
      }),
    );

    workoutRepositoryMock.createWithExercises.mockResolvedValueOnce({
      id: TEST_WORKOUT_ID,
    });

    await workoutService.create(TEST_USER_A_ID, input);

    expect(workoutRepositoryMock.createWithExercises).toHaveBeenCalledWith({
      userId: TEST_USER_A_ID,
      name: "Push A",
      category: "Chest",
      date: input.date,
      exercises: [
        {
          name: "Bench Press",
          order: 1,
          sets: [
            {
              repetitions: 10,
              weightKg: 60,
              setType: "WORKING",
              order: 1,
            },
            {
              repetitions: 8,
              weightKg: 40,
              setType: "WARM_UP",
              order: 2,
            },
          ],
        },
        {
          name: "Incline Press",
          order: 2,
          sets: [
            {
              repetitions: 12,
              weightKg: 30,
              setType: "RECOGNITION_ACTIVATION",
              order: 1,
            },
          ],
        },
      ],
    });
  });

  it("blocks workout without name at validation boundary", () => {
    expect(() =>
      createWorkoutSchema.parse(createWorkoutInput({ name: "" })),
    ).toThrow();
  });

  it("blocks workout without exercises at validation boundary", () => {
    expect(() =>
      createWorkoutSchema.parse(createWorkoutInput({ exercises: [] })),
    ).toThrow();
  });

  it("updates a workout owned by the authenticated user", async () => {
    const { workoutService } = await import("@/server/services/workout.service");
    const input = updateWorkoutSchema.parse({
      name: "Push B",
      category: "Chest",
    });
    const updatedWorkout = { ...createWorkoutRecord(), name: "Push B" };
    workoutRepositoryMock.updateWithExercises.mockResolvedValueOnce(
      updatedWorkout,
    );

    await expect(
      workoutService.update(TEST_USER_A_ID, TEST_WORKOUT_ID, input),
    ).resolves.toBe(updatedWorkout);

    expect(workoutRepositoryMock.updateWithExercises).toHaveBeenCalledWith(
      TEST_WORKOUT_ID,
      TEST_USER_A_ID,
      {
        name: "Push B",
        category: "Chest",
        date: undefined,
        exercises: undefined,
      },
    );
  });

  it("does not update another user's workout", async () => {
    const { workoutService, WorkoutServiceError } = await import(
      "@/server/services/workout.service"
    );
    workoutRepositoryMock.updateWithExercises.mockResolvedValueOnce(null);

    await expect(
      workoutService.update(TEST_USER_B_ID, TEST_WORKOUT_ID, { name: "Hijack" }),
    ).rejects.toBeInstanceOf(WorkoutServiceError);
  });

  it("deletes a workout owned by the authenticated user", async () => {
    const { workoutService } = await import("@/server/services/workout.service");
    workoutRepositoryMock.delete.mockResolvedValueOnce({ count: 1 });

    await expect(
      workoutService.delete(TEST_USER_A_ID, TEST_WORKOUT_ID),
    ).resolves.toBeUndefined();
  });

  it("does not delete another user's workout", async () => {
    const { workoutService, WorkoutServiceError } = await import(
      "@/server/services/workout.service"
    );
    workoutRepositoryMock.delete.mockResolvedValueOnce({ count: 0 });

    await expect(
      workoutService.delete(TEST_USER_B_ID, TEST_WORKOUT_ID),
    ).rejects.toBeInstanceOf(WorkoutServiceError);
  });

  it("does not find another user's workout", async () => {
    const { workoutService, WorkoutServiceError } = await import(
      "@/server/services/workout.service"
    );
    workoutRepositoryMock.findById.mockResolvedValueOnce(null);

    await expect(
      workoutService.findById(TEST_USER_B_ID, TEST_WORKOUT_ID),
    ).rejects.toBeInstanceOf(WorkoutServiceError);
  });

  it("duplicates an owned workout using the current date instead of the source date", async () => {
    const now = new Date("2026-05-16T15:30:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const { workoutService } = await import("@/server/services/workout.service");
    workoutRepositoryMock.findById.mockResolvedValueOnce(createWorkoutRecord());
    workoutRepositoryMock.createWithExercises.mockResolvedValueOnce({
      id: "workout_copy_01",
    });

    await workoutService.duplicate(TEST_USER_A_ID, TEST_WORKOUT_ID);

    expect(workoutRepositoryMock.createWithExercises).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: TEST_USER_A_ID,
        name: "Push A (copy)",
        date: now,
      }),
    );
  });

  it("does not duplicate another user's workout", async () => {
    const { workoutService, WorkoutServiceError } = await import(
      "@/server/services/workout.service"
    );
    workoutRepositoryMock.findById.mockResolvedValueOnce(null);

    await expect(
      workoutService.duplicate(TEST_USER_B_ID, TEST_WORKOUT_ID),
    ).rejects.toBeInstanceOf(WorkoutServiceError);
  });

  it("supports replacing all previous exercises with one new valid exercise", async () => {
    const { workoutService } = await import("@/server/services/workout.service");
    const input = updateWorkoutSchema.parse({
      exercises: [
        {
          name: "New Exercise",
          order: 1,
          sets: [
            {
              repetitions: 12,
              weightKg: 25,
              setType: "working",
              order: 1,
            },
          ],
        },
      ],
    });
    workoutRepositoryMock.updateWithExercises.mockResolvedValueOnce({
      ...createWorkoutRecord(),
      exercises: [],
    });

    await workoutService.update(TEST_USER_A_ID, TEST_WORKOUT_ID, input);

    expect(
      workoutRepositoryMock.updateWithExercises.mock.calls[0][2].exercises,
    ).toEqual([
      {
        name: "New Exercise",
        order: 1,
        sets: [
          {
            repetitions: 12,
            weightKg: 25,
            setType: "WORKING",
            order: 1,
          },
        ],
      },
    ]);
  });
});
