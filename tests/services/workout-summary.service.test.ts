import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_USER_A_ID, TEST_USER_B_ID } from "../factories/workout.factory";

const workoutSummaryRepositoryMock = vi.hoisted(() => ({
  findPreviousByCategory: vi.fn(),
  findPreviousByName: vi.fn(),
  findWorkoutById: vi.fn(),
}));

const personalRecordServiceMock = vi.hoisted(() => ({
  getPersonalRecords: vi.fn(),
}));

const consistencyServiceMock = vi.hoisted(() => ({
  getConsistency: vi.fn(),
}));

vi.mock("@/server/repositories/workout-summary.repository", () => ({
  workoutSummaryRepository: workoutSummaryRepositoryMock,
}));

vi.mock("@/server/services/personal-record.service", () => ({
  personalRecordService: personalRecordServiceMock,
}));

vi.mock("@/server/services/consistency.service", () => ({
  consistencyService: consistencyServiceMock,
}));

const workoutSource = ({
  category = "Legs",
  date = "2026-05-10T12:00:00.000Z",
  id = "workout_current",
  name = "Legs",
  sets = [{ repetitions: 10, weightKg: 1 }],
}: {
  category?: string | null;
  date?: string;
  id?: string;
  name?: string;
  sets?: Array<{ repetitions: number; weightKg: number }>;
} = {}) => ({
  category,
  date: new Date(date),
  exercises: [
    {
      name: "Squat",
      sets,
    },
  ],
  id,
  name,
});

const mockNoRecords = () => {
  personalRecordServiceMock.getPersonalRecords.mockResolvedValue({
    filters: {},
    newRecords: [],
    records: [],
  });
};

const mockConsistency = ({
  monthlyGoal = 20,
  monthlyTrainedDays = 12,
  weeklyGoal = 4,
  weeklyTrainedDays = 3,
}: {
  monthlyGoal?: number | null;
  monthlyTrainedDays?: number;
  weeklyGoal?: number | null;
  weeklyTrainedDays?: number;
} = {}) => {
  consistencyServiceMock.getConsistency.mockResolvedValue({
    completedWeekStreak: 1,
    history: [],
    monthly: {
      completionPercentage: 60,
      endDate: "2026-05-31T23:59:59.999Z",
      goal: monthlyGoal,
      remaining: monthlyGoal === null ? null : 8,
      startDate: "2026-05-01T00:00:00.000Z",
      trainedDays: monthlyTrainedDays,
    },
    weekly: {
      completionPercentage: 75,
      endDate: "2026-05-17T23:59:59.999Z",
      goal: weeklyGoal,
      remaining: weeklyGoal === null ? null : 1,
      startDate: "2026-05-11T00:00:00.000Z",
      status: "in_progress",
      trainedDays: weeklyTrainedDays,
    },
  });
};

describe("workoutSummaryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNoRecords();
    mockConsistency();
    workoutSummaryRepositoryMock.findPreviousByCategory.mockResolvedValue(null);
    workoutSummaryRepositoryMock.findPreviousByName.mockResolvedValue(null);
  });

  it("calculates positive volume comparison against the previous relevant workout", async () => {
    const { workoutSummaryService } = await import(
      "@/server/services/workout-summary.service"
    );
    workoutSummaryRepositoryMock.findWorkoutById.mockResolvedValueOnce(
      workoutSource({ sets: [{ repetitions: 5, weightKg: 3 }] }),
    );
    workoutSummaryRepositoryMock.findPreviousByName.mockResolvedValueOnce(
      workoutSource({
        date: "2026-05-01T12:00:00.000Z",
        id: "workout_previous",
        sets: [{ repetitions: 10, weightKg: 1 }],
      }),
    );

    const summary = await workoutSummaryService.getSummary(
      TEST_USER_A_ID,
      "workout_current",
    );

    expect(summary.totalVolume).toBe(15);
    expect(summary.comparison).toMatchObject({
      percentageChange: 50,
      previousVolume: 10,
      status: "compared",
    });
  });

  it("calculates negative volume comparison", async () => {
    const { workoutSummaryService } = await import(
      "@/server/services/workout-summary.service"
    );
    workoutSummaryRepositoryMock.findWorkoutById.mockResolvedValueOnce(
      workoutSource({ sets: [{ repetitions: 8, weightKg: 11 }] }),
    );
    workoutSummaryRepositoryMock.findPreviousByName.mockResolvedValueOnce(
      workoutSource({
        id: "workout_previous",
        sets: [{ repetitions: 10, weightKg: 10 }],
      }),
    );

    const summary = await workoutSummaryService.getSummary(
      TEST_USER_A_ID,
      "workout_current",
    );

    expect(summary.totalVolume).toBe(88);
    expect(summary.comparison).toMatchObject({
      message: "-12% volume compared to your previous Legs workout",
      percentageChange: -12,
    });
  });

  it("returns a friendly message when no previous comparable workout exists", async () => {
    const { workoutSummaryService } = await import(
      "@/server/services/workout-summary.service"
    );
    workoutSummaryRepositoryMock.findWorkoutById.mockResolvedValueOnce(
      workoutSource(),
    );

    const summary = await workoutSummaryService.getSummary(
      TEST_USER_A_ID,
      "workout_current",
    );

    expect(summary.comparison).toMatchObject({
      message: "This is your first workout in this category",
      percentageChange: null,
      status: "no_previous",
    });
  });

  it("avoids division by zero when previous volume is zero", async () => {
    const { workoutSummaryService } = await import(
      "@/server/services/workout-summary.service"
    );
    workoutSummaryRepositoryMock.findWorkoutById.mockResolvedValueOnce(
      workoutSource({ sets: [{ repetitions: 10, weightKg: 10 }] }),
    );
    workoutSummaryRepositoryMock.findPreviousByName.mockResolvedValueOnce(
      workoutSource({ id: "workout_previous", sets: [] }),
    );

    const summary = await workoutSummaryService.getSummary(
      TEST_USER_A_ID,
      "workout_current",
    );

    expect(summary.comparison).toMatchObject({
      percentageChange: null,
      previousVolume: 0,
      status: "previous_zero",
    });
  });

  it("includes PRs and active weekly/monthly streak progress", async () => {
    const { workoutSummaryService } = await import(
      "@/server/services/workout-summary.service"
    );
    workoutSummaryRepositoryMock.findWorkoutById.mockResolvedValueOnce(
      workoutSource(),
    );
    personalRecordServiceMock.getPersonalRecords.mockResolvedValueOnce({
      filters: {},
      newRecords: [
        {
          date: "2026-05-10T12:00:00.000Z",
          exerciseName: "Squat",
          metric: "highest-weight",
          previousValue: 80,
          scope: "exercise",
          value: 100,
        },
      ],
      records: [],
    });

    const summary = await workoutSummaryService.getSummary(
      TEST_USER_A_ID,
      "workout_current",
    );

    expect(summary.personalRecords).toHaveLength(1);
    expect(summary.streaks).toEqual({
      monthly: { goal: 20, trainedDays: 12 },
      weekly: { goal: 4, trainedDays: 3 },
    });
  });

  it("keeps PR count at zero and hides inactive streaks when no goals exist", async () => {
    const { workoutSummaryService } = await import(
      "@/server/services/workout-summary.service"
    );
    workoutSummaryRepositoryMock.findWorkoutById.mockResolvedValueOnce(
      workoutSource(),
    );
    mockConsistency({ monthlyGoal: null, weeklyGoal: null });

    const summary = await workoutSummaryService.getSummary(
      TEST_USER_A_ID,
      "workout_current",
    );

    expect(summary.personalRecords).toEqual([]);
    expect(summary.streaks).toEqual({ monthly: null, weekly: null });
  });

  it("uses only the authenticated user's workout", async () => {
    const { workoutSummaryService, WorkoutSummaryServiceError } = await import(
      "@/server/services/workout-summary.service"
    );
    workoutSummaryRepositoryMock.findWorkoutById.mockResolvedValueOnce(null);

    await expect(
      workoutSummaryService.getSummary(TEST_USER_B_ID, "workout_current"),
    ).rejects.toBeInstanceOf(WorkoutSummaryServiceError);

    expect(workoutSummaryRepositoryMock.findWorkoutById).toHaveBeenCalledWith(
      "workout_current",
      TEST_USER_B_ID,
    );
  });
});
