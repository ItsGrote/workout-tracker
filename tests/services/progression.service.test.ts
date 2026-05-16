import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_USER_A_ID } from "../factories/workout.factory";

const progressionRepositoryMock = vi.hoisted(() => ({
  findWorkoutVolumeSources: vi.fn(),
}));

vi.mock("@/server/repositories/progression.repository", () => ({
  progressionRepository: progressionRepositoryMock,
}));

const workoutSource = (
  overrides: {
    category?: string | null;
    date?: Date;
    exercises?: Array<{
      name: string;
      sets: Array<{ repetitions: number; weightKg: number | string }>;
    }>;
    id?: string;
    name?: string;
  } = {},
) => ({
  id: overrides.id ?? "workout_01",
  name: overrides.name ?? "Push A",
  category: overrides.category ?? "Chest",
  date: overrides.date ?? new Date("2026-05-01T12:00:00.000Z"),
  exercises:
    overrides.exercises?.map((exercise, exerciseIndex) => ({
      id: `exercise_${exerciseIndex + 1}`,
      name: exercise.name,
      sets: exercise.sets.map((set, setIndex) => ({
        id: `set_${exerciseIndex + 1}_${setIndex + 1}`,
        repetitions: set.repetitions,
        weightKg: set.weightKg,
      })),
    })) ?? [],
});

describe("progressionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates workout volume with multiple exercises and sets", async () => {
    const { progressionService } = await import(
      "@/server/services/progression.service"
    );
    progressionRepositoryMock.findWorkoutVolumeSources.mockResolvedValueOnce([
      workoutSource({
        exercises: [
          {
            name: "Bench Press",
            sets: [
              { repetitions: 10, weightKg: 20 },
              { repetitions: 8, weightKg: 25 },
            ],
          },
          {
            name: "Chest Fly",
            sets: [{ repetitions: 12, weightKg: 10 }],
          },
        ],
      }),
    ]);

    const result = await progressionService.getVolumeProgression(
      TEST_USER_A_ID,
      {},
    );

    expect(result.totalVolume).toBe(520);
    expect(result.points).toEqual([
      expect.objectContaining({
        label: "Push A",
        totalVolume: 520,
        workoutCategory: "Chest",
      }),
    ]);
  });

  it("calculates exercise volume with different weights and repetitions", async () => {
    const { progressionService } = await import(
      "@/server/services/progression.service"
    );
    progressionRepositoryMock.findWorkoutVolumeSources.mockResolvedValueOnce([
      workoutSource({
        exercises: [
          {
            name: "Bench Press",
            sets: [
              { repetitions: 10, weightKg: 20 },
              { repetitions: 8, weightKg: 25 },
              { repetitions: 6, weightKg: 30 },
            ],
          },
        ],
      }),
    ]);

    const result = await progressionService.getVolumeProgression(
      TEST_USER_A_ID,
      { exerciseName: "Bench Press" },
    );

    expect(result.totalVolume).toBe(580);
    expect(result.points[0]).toMatchObject({
      exerciseName: "Bench Press",
      label: "Bench Press",
      totalVolume: 580,
    });
  });

  it("does not break when an exercise has no valid sets", async () => {
    const { progressionService } = await import(
      "@/server/services/progression.service"
    );
    progressionRepositoryMock.findWorkoutVolumeSources.mockResolvedValueOnce([
      workoutSource({
        exercises: [{ name: "Bench Press", sets: [] }],
      }),
    ]);

    const result = await progressionService.getVolumeProgression(
      TEST_USER_A_ID,
      { exerciseName: "Bench Press" },
    );

    expect(result.totalVolume).toBe(0);
    expect(result.points[0]?.totalVolume).toBe(0);
  });

  it("returns points in the ascending order provided by the repository", async () => {
    const { progressionService } = await import(
      "@/server/services/progression.service"
    );
    progressionRepositoryMock.findWorkoutVolumeSources.mockResolvedValueOnce([
      workoutSource({
        date: new Date("2026-05-01T12:00:00.000Z"),
        id: "workout_01",
        name: "Push A",
        exercises: [{ name: "Bench Press", sets: [{ repetitions: 10, weightKg: 10 }] }],
      }),
      workoutSource({
        date: new Date("2026-05-10T12:00:00.000Z"),
        id: "workout_02",
        name: "Push B",
        exercises: [{ name: "Bench Press", sets: [{ repetitions: 10, weightKg: 20 }] }],
      }),
    ]);

    const result = await progressionService.getVolumeProgression(
      TEST_USER_A_ID,
      {},
    );

    expect(result.points.map((point) => point.date)).toEqual([
      "2026-05-01T12:00:00.000Z",
      "2026-05-10T12:00:00.000Z",
    ]);
  });

  it("queries progression using only the authenticated user id", async () => {
    const { progressionService } = await import(
      "@/server/services/progression.service"
    );
    progressionRepositoryMock.findWorkoutVolumeSources.mockResolvedValueOnce([]);

    await progressionService.getVolumeProgression(TEST_USER_A_ID, {
      category: "Chest",
      fromDate: new Date("2026-05-01T00:00:00.000Z"),
      toDate: new Date("2026-05-31T23:59:59.999Z"),
    });

    expect(progressionRepositoryMock.findWorkoutVolumeSources).toHaveBeenCalledWith({
      userId: TEST_USER_A_ID,
      category: "Chest",
      exerciseName: undefined,
      fromDate: new Date("2026-05-01T00:00:00.000Z"),
      toDate: new Date("2026-05-31T23:59:59.999Z"),
    });
  });
});
