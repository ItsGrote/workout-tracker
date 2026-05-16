import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_USER_A_ID } from "../factories/workout.factory";

const personalRecordRepositoryMock = vi.hoisted(() => ({
  findRecordSources: vi.fn(),
}));

vi.mock("@/server/repositories/personal-record.repository", () => ({
  personalRecordRepository: personalRecordRepositoryMock,
}));

type ExerciseInput = {
  name: string;
  sets: Array<{ repetitions: number; weightKg: number | string }>;
};

const recordWorkout = (
  id: string,
  date: string,
  exercises: ExerciseInput[],
  overrides: { category?: string | null; name?: string } = {},
) => ({
  id,
  name: overrides.name ?? "Push A",
  category: overrides.category ?? "Chest",
  date: new Date(date),
  createdAt: new Date(date),
  exercises: exercises.map((exercise, exerciseIndex) => ({
    id: `${id}_exercise_${exerciseIndex + 1}`,
    name: exercise.name,
    sets: exercise.sets.map((set, setIndex) => ({
      id: `${id}_set_${exerciseIndex + 1}_${setIndex + 1}`,
      repetitions: set.repetitions,
      weightKg: set.weightKg,
    })),
  })),
});

describe("personalRecordService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects a new max weight PR", async () => {
    const { personalRecordService } = await import(
      "@/server/services/personal-record.service"
    );
    personalRecordRepositoryMock.findRecordSources.mockResolvedValueOnce([
      recordWorkout("workout_old", "2026-05-01T12:00:00.000Z", [
        { name: "Bench Press", sets: [{ repetitions: 8, weightKg: 60 }] },
      ]),
      recordWorkout("workout_new", "2026-05-10T12:00:00.000Z", [
        { name: "Bench Press", sets: [{ repetitions: 6, weightKg: 70 }] },
      ]),
    ]);

    const result = await personalRecordService.getPersonalRecords(
      TEST_USER_A_ID,
      {
        fromDate: new Date("2026-05-10T00:00:00.000Z"),
        workoutId: "workout_new",
      },
    );

    expect(result.newRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          exerciseName: "Bench Press",
          metric: "highest-weight",
          previousValue: 60,
          value: 70,
        }),
      ]),
    );
  });

  it("detects a new reps PR", async () => {
    const { personalRecordService } = await import(
      "@/server/services/personal-record.service"
    );
    personalRecordRepositoryMock.findRecordSources.mockResolvedValueOnce([
      recordWorkout("workout_old", "2026-05-01T12:00:00.000Z", [
        { name: "Pull-up", sets: [{ repetitions: 8, weightKg: 0 }] },
      ]),
      recordWorkout("workout_new", "2026-05-10T12:00:00.000Z", [
        { name: "Pull-up", sets: [{ repetitions: 12, weightKg: 0 }] },
      ]),
    ]);

    const result = await personalRecordService.getPersonalRecords(
      TEST_USER_A_ID,
      {
        fromDate: new Date("2026-05-10T00:00:00.000Z"),
        workoutId: "workout_new",
      },
    );

    expect(result.newRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          exerciseName: "Pull-up",
          metric: "best-repetitions",
          previousValue: 8,
          value: 12,
        }),
      ]),
    );
  });

  it("detects a new exercise volume PR", async () => {
    const { personalRecordService } = await import(
      "@/server/services/personal-record.service"
    );
    personalRecordRepositoryMock.findRecordSources.mockResolvedValueOnce([
      recordWorkout("workout_old", "2026-05-01T12:00:00.000Z", [
        { name: "Squat", sets: [{ repetitions: 5, weightKg: 80 }] },
      ]),
      recordWorkout("workout_new", "2026-05-10T12:00:00.000Z", [
        {
          name: "Squat",
          sets: [
            { repetitions: 5, weightKg: 90 },
            { repetitions: 5, weightKg: 90 },
          ],
        },
      ]),
    ]);

    const result = await personalRecordService.getPersonalRecords(
      TEST_USER_A_ID,
      {
        fromDate: new Date("2026-05-10T00:00:00.000Z"),
        workoutId: "workout_new",
      },
    );

    expect(result.newRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          exerciseName: "Squat",
          metric: "exercise-volume",
          previousValue: 400,
          value: 900,
        }),
      ]),
    );
  });

  it("does not create false positives when values tie previous records", async () => {
    const { personalRecordService } = await import(
      "@/server/services/personal-record.service"
    );
    personalRecordRepositoryMock.findRecordSources.mockResolvedValueOnce([
      recordWorkout("workout_old", "2026-05-01T12:00:00.000Z", [
        { name: "Bench Press", sets: [{ repetitions: 10, weightKg: 60 }] },
      ]),
      recordWorkout("workout_new", "2026-05-10T12:00:00.000Z", [
        { name: "Bench Press", sets: [{ repetitions: 10, weightKg: 60 }] },
      ]),
    ]);

    const result = await personalRecordService.getPersonalRecords(
      TEST_USER_A_ID,
      {
        fromDate: new Date("2026-05-10T00:00:00.000Z"),
        workoutId: "workout_new",
      },
    );

    expect(result.newRecords).toEqual([]);
  });

  it("keeps records separated by exercise name", async () => {
    const { personalRecordService } = await import(
      "@/server/services/personal-record.service"
    );
    personalRecordRepositoryMock.findRecordSources.mockResolvedValueOnce([
      recordWorkout("workout_old", "2026-05-01T12:00:00.000Z", [
        { name: "Bench Press", sets: [{ repetitions: 8, weightKg: 80 }] },
      ]),
      recordWorkout("workout_new", "2026-05-10T12:00:00.000Z", [
        { name: "Squat", sets: [{ repetitions: 8, weightKg: 80 }] },
      ]),
    ]);

    const result = await personalRecordService.getPersonalRecords(
      TEST_USER_A_ID,
      {},
    );

    expect(
      result.records.filter((record) => record.metric === "highest-weight"),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ exerciseName: "Bench Press", value: 80 }),
        expect.objectContaining({ exerciseName: "Squat", value: 80 }),
      ]),
    );
  });

  it("queries PR data only for the authenticated user", async () => {
    const { personalRecordService } = await import(
      "@/server/services/personal-record.service"
    );
    personalRecordRepositoryMock.findRecordSources.mockResolvedValueOnce([]);

    await personalRecordService.getPersonalRecords(TEST_USER_A_ID, {
      exerciseName: "Bench Press",
      workoutCategory: "Chest",
      toDate: new Date("2026-05-31T23:59:59.999Z"),
    });

    expect(personalRecordRepositoryMock.findRecordSources).toHaveBeenCalledWith({
      userId: TEST_USER_A_ID,
      exerciseName: "Bench Press",
      workoutCategory: "Chest",
      toDate: new Date("2026-05-31T23:59:59.999Z"),
    });
  });

  it("does not create PRs when no saved workouts are returned", async () => {
    const { personalRecordService } = await import(
      "@/server/services/personal-record.service"
    );
    personalRecordRepositoryMock.findRecordSources.mockResolvedValueOnce([]);

    const result = await personalRecordService.getPersonalRecords(
      TEST_USER_A_ID,
      {},
    );

    expect(result.records).toEqual([]);
    expect(result.newRecords).toEqual([]);
  });
});
