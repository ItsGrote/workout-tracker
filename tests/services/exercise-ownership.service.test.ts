import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TEST_EXERCISE_ID,
  TEST_SET_ID,
  TEST_USER_A_ID,
  TEST_USER_B_ID,
  TEST_WORKOUT_ID,
} from "../factories/workout.factory";

const workoutRepositoryMock = vi.hoisted(() => ({
  findById: vi.fn(),
}));

const exerciseRepositoryMock = vi.hoisted(() => ({
  createWithSets: vi.fn(),
  delete: vi.fn(),
  findByIdForUser: vi.fn(),
  update: vi.fn(),
}));

const exerciseSetRepositoryMock = vi.hoisted(() => ({
  delete: vi.fn(),
  findByIdForUser: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/server/repositories/workout.repository", () => ({
  workoutRepository: workoutRepositoryMock,
}));

vi.mock("@/server/repositories/exercise.repository", () => ({
  exerciseRepository: exerciseRepositoryMock,
}));

vi.mock("@/server/repositories/exercise-set.repository", () => ({
  exerciseSetRepository: exerciseSetRepositoryMock,
}));

describe("exercise and set ownership services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an exercise with multiple sets only inside an owned workout", async () => {
    const { exerciseService } = await import("@/server/services/exercise.service");
    workoutRepositoryMock.findById.mockResolvedValueOnce({
      id: TEST_WORKOUT_ID,
    });
    exerciseRepositoryMock.createWithSets.mockResolvedValueOnce({
      id: TEST_EXERCISE_ID,
    });

    await exerciseService.create(TEST_USER_A_ID, TEST_WORKOUT_ID, {
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
    });

    expect(exerciseRepositoryMock.createWithSets).toHaveBeenCalledWith({
      workoutId: TEST_WORKOUT_ID,
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
    });
  });

  it("does not create an exercise in another user's workout", async () => {
    const { exerciseService, ExerciseServiceError } = await import(
      "@/server/services/exercise.service"
    );
    workoutRepositoryMock.findById.mockResolvedValueOnce(null);

    await expect(
      exerciseService.create(TEST_USER_B_ID, TEST_WORKOUT_ID, {
        name: "Bench Press",
        order: 1,
        sets: [],
      }),
    ).rejects.toBeInstanceOf(ExerciseServiceError);
  });

  it("does not edit an exercise from another user's workout", async () => {
    const { exerciseService, ExerciseServiceError } = await import(
      "@/server/services/exercise.service"
    );
    exerciseRepositoryMock.findByIdForUser.mockResolvedValueOnce(null);

    await expect(
      exerciseService.update(TEST_USER_B_ID, TEST_EXERCISE_ID, {
        name: "Hijack",
      }),
    ).rejects.toBeInstanceOf(ExerciseServiceError);
  });

  it("does not edit an exercise that belongs to a different workout route", async () => {
    const { exerciseService, ExerciseServiceError } = await import(
      "@/server/services/exercise.service"
    );
    exerciseRepositoryMock.findByIdForUser.mockResolvedValueOnce({
      id: TEST_EXERCISE_ID,
      workoutId: "workout_other_01",
    });

    await expect(
      exerciseService.update(
        TEST_USER_A_ID,
        TEST_EXERCISE_ID,
        { name: "Bench Press" },
        TEST_WORKOUT_ID,
      ),
    ).rejects.toBeInstanceOf(ExerciseServiceError);
  });

  it("does not delete an exercise from another user's workout", async () => {
    const { exerciseService, ExerciseServiceError } = await import(
      "@/server/services/exercise.service"
    );
    exerciseRepositoryMock.findByIdForUser.mockResolvedValueOnce(null);

    await expect(
      exerciseService.delete(TEST_USER_B_ID, TEST_EXERCISE_ID),
    ).rejects.toBeInstanceOf(ExerciseServiceError);
  });

  it("does not edit a set from another user's workout", async () => {
    const { exerciseSetService, ExerciseSetServiceError } = await import(
      "@/server/services/exercise-set.service"
    );
    exerciseSetRepositoryMock.findByIdForUser.mockResolvedValueOnce(null);

    await expect(
      exerciseSetService.update(TEST_USER_B_ID, TEST_SET_ID, {
        repetitions: 12,
      }),
    ).rejects.toBeInstanceOf(ExerciseSetServiceError);
  });

  it("does not edit a set that belongs to a different exercise route", async () => {
    const { exerciseSetService, ExerciseSetServiceError } = await import(
      "@/server/services/exercise-set.service"
    );
    exerciseSetRepositoryMock.findByIdForUser.mockResolvedValueOnce({
      id: TEST_SET_ID,
      exerciseId: "exercise_other_01",
    });

    await expect(
      exerciseSetService.updateForExercise(
        TEST_USER_A_ID,
        TEST_EXERCISE_ID,
        TEST_SET_ID,
        { repetitions: 12 },
      ),
    ).rejects.toBeInstanceOf(ExerciseSetServiceError);
  });

  it("does not delete a set from another user's workout", async () => {
    const { exerciseSetService, ExerciseSetServiceError } = await import(
      "@/server/services/exercise-set.service"
    );
    exerciseSetRepositoryMock.findByIdForUser.mockResolvedValueOnce(null);

    await expect(
      exerciseSetService.delete(TEST_USER_B_ID, TEST_SET_ID),
    ).rejects.toBeInstanceOf(ExerciseSetServiceError);
  });
});
