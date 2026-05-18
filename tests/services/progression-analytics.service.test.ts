import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_USER_A_ID } from "../factories/workout.factory";

const progressionAnalyticsRepositoryMock = vi.hoisted(() => ({
  findOptions: vi.fn(),
  findSources: vi.fn(),
}));

vi.mock("@/server/repositories/progression-analytics.repository", () => ({
  progressionAnalyticsRepository: progressionAnalyticsRepositoryMock,
}));

const sourceWorkout = ({
  category = "Legs",
  createdAt = "2026-05-10T10:00:00.000Z",
  date = "2026-05-10T12:00:00.000Z",
  exercises = [
    {
      name: "Squat",
      sets: [{ repetitions: 10, weightKg: 10 }],
    },
  ],
  id = "workout_01",
  name = "Legs",
}: {
  category?: string | null;
  createdAt?: string;
  date?: string;
  exercises?: Array<{
    name: string;
    sets: Array<{ repetitions: number; weightKg: number | string }>;
  }>;
  id?: string;
  name?: string;
} = {}) => ({
  category,
  createdAt: new Date(createdAt),
  date: new Date(date),
  exercises: exercises.map((exercise, exerciseIndex) => ({
    id: `exercise_${id}_${exerciseIndex}`,
    name: exercise.name,
    order: exerciseIndex + 1,
    sets: exercise.sets.map((set, setIndex) => ({
      id: `set_${id}_${exerciseIndex}_${setIndex}`,
      order: setIndex + 1,
      repetitions: set.repetitions,
      weightKg: set.weightKg,
    })),
  })),
  id,
  name,
});

describe("progressionAnalyticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T12:00:00.000Z"));
    progressionAnalyticsRepositoryMock.findOptions.mockResolvedValue([
      sourceWorkout(),
    ]);
    progressionAnalyticsRepositoryMock.findSources.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns workout insights with progression, highest, average, total and count", async () => {
    const { progressionAnalyticsService } = await import(
      "@/server/services/progression-analytics.service"
    );
    progressionAnalyticsRepositoryMock.findSources.mockResolvedValueOnce([
      sourceWorkout({
        createdAt: "2026-05-17T18:00:00.000Z",
        date: "2026-05-17T12:00:00.000Z",
        id: "workout_03",
        exercises: [
          { name: "Squat", sets: [{ repetitions: 15, weightKg: 100 }] },
        ],
      }),
      sourceWorkout({
        createdAt: "2026-05-01T10:00:00.000Z",
        date: "2026-05-01T12:00:00.000Z",
        id: "workout_01",
        exercises: [
          { name: "Squat", sets: [{ repetitions: 5, weightKg: 100 }] },
        ],
      }),
      sourceWorkout({
        createdAt: "2026-05-17T10:00:00.000Z",
        date: "2026-05-17T12:00:00.000Z",
        id: "workout_02",
        exercises: [
          { name: "Squat", sets: [{ repetitions: 10, weightKg: 100 }] },
        ],
      }),
    ]);

    const result = await progressionAnalyticsService.getAnalytics(
      TEST_USER_A_ID,
      {
        exerciseMetric: "volume",
        range: "30d",
        selectedValue: "Legs",
        target: "workout",
        workoutFilter: "name",
      },
    );

    expect(result.points.map((point) => point.volume)).toEqual([
      500, 1000, 1500,
    ]);
    expect(result.insights).toMatchObject({
      averageVolume: 1000,
      highestVolume: 1500,
      kind: "workout",
      totalAccumulatedVolume: 3000,
      workoutsAnalyzed: 3,
      progression: {
        percentageChange: 200,
        status: "ready",
      },
    });
  });

  it("does not generate Infinity when the first workout volume is zero", async () => {
    const { progressionAnalyticsService } = await import(
      "@/server/services/progression-analytics.service"
    );
    progressionAnalyticsRepositoryMock.findSources.mockResolvedValueOnce([
      sourceWorkout({
        id: "workout_zero",
        exercises: [{ name: "Squat", sets: [] }],
      }),
      sourceWorkout({
        createdAt: "2026-05-11T10:00:00.000Z",
        date: "2026-05-11T12:00:00.000Z",
        id: "workout_next",
        exercises: [
          { name: "Squat", sets: [{ repetitions: 10, weightKg: 10 }] },
        ],
      }),
    ]);

    const result = await progressionAnalyticsService.getAnalytics(
      TEST_USER_A_ID,
      {
        exerciseMetric: "volume",
        range: "30d",
        selectedValue: "Legs",
        target: "workout",
        workoutFilter: "category",
      },
    );

    expect(result.insights).toMatchObject({
      kind: "workout",
      progression: {
        percentageChange: null,
        status: "previous_zero",
      },
    });
  });

  it("returns a friendly progression state when history is empty", async () => {
    const { progressionAnalyticsService } = await import(
      "@/server/services/progression-analytics.service"
    );

    const result = await progressionAnalyticsService.getAnalytics(
      TEST_USER_A_ID,
      {
        exerciseMetric: "volume",
        range: "30d",
        selectedValue: "Legs",
        target: "workout",
        workoutFilter: "name",
      },
    );

    expect(result.points).toEqual([]);
    expect(result.insights).toMatchObject({
      kind: "workout",
      totalAccumulatedVolume: 0,
      workoutsAnalyzed: 0,
      progression: {
        message: "Complete more workouts to see progression trends",
        percentageChange: null,
        status: "not_enough_data",
      },
    });
  });

  it("returns exercise insights for max weight, average weight, volume and sessions", async () => {
    const { progressionAnalyticsService } = await import(
      "@/server/services/progression-analytics.service"
    );
    progressionAnalyticsRepositoryMock.findSources.mockResolvedValueOnce([
      sourceWorkout({
        createdAt: "2026-05-01T10:00:00.000Z",
        date: "2026-05-01T12:00:00.000Z",
        id: "workout_01",
        exercises: [
          {
            name: "Bench Press",
            sets: [
              { repetitions: 10, weightKg: 60 },
              { repetitions: 8, weightKg: 70 },
            ],
          },
        ],
      }),
      sourceWorkout({
        createdAt: "2026-05-10T10:00:00.000Z",
        date: "2026-05-10T12:00:00.000Z",
        id: "workout_02",
        exercises: [
          {
            name: "Bench Press",
            sets: [
              { repetitions: 8, weightKg: 80 },
              { repetitions: 6, weightKg: 90 },
            ],
          },
        ],
      }),
    ]);

    const result = await progressionAnalyticsService.getAnalytics(
      TEST_USER_A_ID,
      {
        exerciseMetric: "max-weight",
        range: "30d",
        selectedValue: "Bench Press",
        target: "exercise",
      },
    );

    expect(result.insights).toMatchObject({
      averageWeight: 75,
      highestWeight: 90,
      kind: "exercise",
      sessionsAnalyzed: 2,
      totalAccumulatedVolume: 2340,
      progression: {
        percentageChange: 28.57,
        status: "ready",
      },
    });
  });

  it("uses the selected exercise metric for progression percentage", async () => {
    const { progressionAnalyticsService } = await import(
      "@/server/services/progression-analytics.service"
    );
    progressionAnalyticsRepositoryMock.findSources.mockResolvedValueOnce([
      sourceWorkout({
        id: "workout_01",
        exercises: [
          { name: "Pull-up", sets: [{ repetitions: 5, weightKg: 0 }] },
        ],
      }),
      sourceWorkout({
        createdAt: "2026-05-11T10:00:00.000Z",
        date: "2026-05-11T12:00:00.000Z",
        id: "workout_02",
        exercises: [
          { name: "Pull-up", sets: [{ repetitions: 10, weightKg: 0 }] },
        ],
      }),
    ]);

    const result = await progressionAnalyticsService.getAnalytics(
      TEST_USER_A_ID,
      {
        exerciseMetric: "average-reps",
        range: "30d",
        selectedValue: "Pull-up",
        target: "exercise",
      },
    );

    expect(result.insights).toMatchObject({
      kind: "exercise",
      progression: {
        percentageChange: 100,
        status: "ready",
      },
    });
  });

  it("queries analytics with the authenticated user id and selected interval", async () => {
    const { progressionAnalyticsService } = await import(
      "@/server/services/progression-analytics.service"
    );

    await progressionAnalyticsService.getAnalytics(TEST_USER_A_ID, {
      exerciseMetric: "volume",
      range: "7d",
      selectedValue: "Bench Press",
      target: "exercise",
    });

    expect(progressionAnalyticsRepositoryMock.findSources).toHaveBeenCalledWith({
      exerciseName: "Bench Press",
      fromDate: new Date("2026-05-10T12:00:00.000Z"),
      userId: TEST_USER_A_ID,
      workoutCategory: undefined,
      workoutName: undefined,
    });
  });

  it("returns options without insights before the user selects an analytics target", async () => {
    const { progressionAnalyticsService } = await import(
      "@/server/services/progression-analytics.service"
    );

    const result = await progressionAnalyticsService.getAnalytics(
      TEST_USER_A_ID,
      {
        exerciseMetric: "volume",
        range: "30d",
      },
    );

    expect(result.points).toEqual([]);
    expect(result.insights).toBeNull();
    expect(progressionAnalyticsRepositoryMock.findSources).not.toHaveBeenCalled();
  });
});
