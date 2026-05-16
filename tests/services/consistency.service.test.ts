import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_USER_A_ID } from "../factories/workout.factory";
import { updateGoalSchema } from "@/server/validations/goal.validation";

const consistencyRepositoryMock = vi.hoisted(() => ({
  findFirstWorkoutDate: vi.fn(),
  findWorkoutDatesInRange: vi.fn(),
}));

const goalRepositoryMock = vi.hoisted(() => ({
  findByUserId: vi.fn(),
}));

vi.mock("@/server/repositories/consistency.repository", () => ({
  consistencyRepository: consistencyRepositoryMock,
}));

vi.mock("@/server/repositories/goal.repository", () => ({
  goalRepository: goalRepositoryMock,
}));

const workoutDate = (date: string) => ({ date: new Date(date) });

describe("consistencyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-16T12:00:00.000Z"));
    goalRepositoryMock.findByUserId.mockResolvedValue({
      weeklyGoal: 3,
      monthlyGoal: 4,
      updatedAt: new Date("2026-05-01T12:00:00.000Z"),
    });
    consistencyRepositoryMock.findFirstWorkoutDate.mockResolvedValue(
      workoutDate("2026-05-01T12:00:00.000Z"),
    );
  });

  it("counts unique trained days for weekly streak progress", async () => {
    const { consistencyService } = await import(
      "@/server/services/consistency.service"
    );
    consistencyRepositoryMock.findWorkoutDatesInRange.mockResolvedValueOnce([
      workoutDate("2026-05-11T10:00:00.000Z"),
      workoutDate("2026-05-11T18:00:00.000Z"),
      workoutDate("2026-05-13T12:00:00.000Z"),
    ]);

    const result = await consistencyService.getConsistency(TEST_USER_A_ID);

    expect(result.weekly.trainedDays).toBe(2);
    expect(result.weekly.remaining).toBe(1);
    expect(result.weekly.completionPercentage).toBe(67);
    expect(result.weekly.status).toBe("in_progress");
  });

  it("counts two workouts on the same day as one monthly trained day", async () => {
    const { consistencyService } = await import(
      "@/server/services/consistency.service"
    );
    consistencyRepositoryMock.findWorkoutDatesInRange.mockResolvedValueOnce([
      workoutDate("2026-05-01T10:00:00.000Z"),
      workoutDate("2026-05-01T18:00:00.000Z"),
      workoutDate("2026-05-02T12:00:00.000Z"),
      workoutDate("2026-05-15T12:00:00.000Z"),
    ]);

    const result = await consistencyService.getConsistency(TEST_USER_A_ID);

    expect(result.monthly.trainedDays).toBe(3);
    expect(result.monthly.remaining).toBe(1);
    expect(result.monthly.completionPercentage).toBe(75);
  });

  it("rejects invalid weekly goals at the validation boundary", () => {
    expect(() => updateGoalSchema.parse({ weeklyGoal: 0 })).toThrow();
    expect(() => updateGoalSchema.parse({ weeklyGoal: -1 })).toThrow();
    expect(() => updateGoalSchema.parse({ weeklyGoal: 8 })).toThrow();
  });

  it("rejects invalid monthly goals at the validation boundary", () => {
    expect(() => updateGoalSchema.parse({ monthlyGoal: 0 })).toThrow();
    expect(() => updateGoalSchema.parse({ monthlyGoal: -1 })).toThrow();
    expect(() => updateGoalSchema.parse({ monthlyGoal: 32 })).toThrow();
  });

  it("does not break when the user has empty consistency history", async () => {
    const { consistencyService } = await import(
      "@/server/services/consistency.service"
    );
    goalRepositoryMock.findByUserId.mockResolvedValueOnce(null);
    consistencyRepositoryMock.findFirstWorkoutDate.mockResolvedValueOnce(null);
    consistencyRepositoryMock.findWorkoutDatesInRange.mockResolvedValueOnce([]);

    const result = await consistencyService.getConsistency(TEST_USER_A_ID);

    expect(result.weekly).toMatchObject({
      goal: null,
      remaining: null,
      trainedDays: 0,
      status: "in_progress",
    });
    expect(result.monthly.trainedDays).toBe(0);
    expect(result.completedWeekStreak).toBe(0);
    expect(result.history).toHaveLength(1);
  });

  it("uses only the authenticated user's dates and goals", async () => {
    const { consistencyService } = await import(
      "@/server/services/consistency.service"
    );
    consistencyRepositoryMock.findWorkoutDatesInRange.mockResolvedValueOnce([]);

    await consistencyService.getConsistency(TEST_USER_A_ID);

    expect(goalRepositoryMock.findByUserId).toHaveBeenCalledWith(TEST_USER_A_ID);
    expect(consistencyRepositoryMock.findFirstWorkoutDate).toHaveBeenCalledWith(
      TEST_USER_A_ID,
    );
    expect(consistencyRepositoryMock.findWorkoutDatesInRange).toHaveBeenCalledWith(
      expect.objectContaining({ userId: TEST_USER_A_ID }),
    );
  });

  it("builds weekly history in temporal order and does not let current week break streak", async () => {
    const { consistencyService } = await import(
      "@/server/services/consistency.service"
    );
    goalRepositoryMock.findByUserId.mockResolvedValueOnce({
      weeklyGoal: 2,
      monthlyGoal: 4,
      updatedAt: new Date("2026-05-01T12:00:00.000Z"),
    });
    consistencyRepositoryMock.findFirstWorkoutDate.mockResolvedValueOnce(
      workoutDate("2026-04-28T12:00:00.000Z"),
    );
    consistencyRepositoryMock.findWorkoutDatesInRange.mockResolvedValueOnce([
      workoutDate("2026-04-28T12:00:00.000Z"),
      workoutDate("2026-04-30T12:00:00.000Z"),
      workoutDate("2026-05-05T12:00:00.000Z"),
      workoutDate("2026-05-11T12:00:00.000Z"),
      workoutDate("2026-05-12T12:00:00.000Z"),
    ]);

    const result = await consistencyService.getConsistency(TEST_USER_A_ID);

    expect(result.history.map((item) => item.startDate)).toEqual([
      "2026-04-27T00:00:00.000Z",
      "2026-05-04T00:00:00.000Z",
      "2026-05-11T00:00:00.000Z",
    ]);
    expect(result.history.map((item) => item.status)).toEqual([
      "completed",
      "failed",
      "in_progress",
    ]);
    expect(result.completedWeekStreak).toBe(0);
  });
});
