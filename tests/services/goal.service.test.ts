import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_USER_A_ID } from "../factories/workout.factory";
import { updateGoalSchema } from "@/server/validations/goal.validation";

const goalRepositoryMock = vi.hoisted(() => ({
  findByUserId: vi.fn(),
  save: vi.fn(),
}));

vi.mock("@/server/repositories/goal.repository", () => ({
  goalRepository: goalRepositoryMock,
}));

describe("goal validation and service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks weekly goal lower than 1", () => {
    expect(() => updateGoalSchema.parse({ weeklyGoal: 0 })).toThrow();
  });

  it("blocks weekly goal greater than 7", () => {
    expect(() => updateGoalSchema.parse({ weeklyGoal: 8 })).toThrow();
  });

  it("blocks monthly goal lower than 1", () => {
    expect(() => updateGoalSchema.parse({ monthlyGoal: 0 })).toThrow();
  });

  it("blocks monthly goal greater than 31", () => {
    expect(() => updateGoalSchema.parse({ monthlyGoal: 32 })).toThrow();
  });

  it("allows disabling weekly and monthly streaks with null values", () => {
    expect(
      updateGoalSchema.parse({ weeklyGoal: null, monthlyGoal: null }),
    ).toEqual({
      weeklyGoal: null,
      monthlyGoal: null,
    });
  });

  it("saves goals only for the authenticated user passed by the controller", async () => {
    const { goalService } = await import("@/server/services/goal.service");
    const updatedAt = new Date("2026-05-16T12:00:00.000Z");
    goalRepositoryMock.save.mockResolvedValueOnce({
      userId: TEST_USER_A_ID,
      weeklyGoal: 3,
      monthlyGoal: null,
      updatedAt,
    });

    await expect(
      goalService.updateGoals(TEST_USER_A_ID, {
        weeklyGoal: 3,
        monthlyGoal: null,
      }),
    ).resolves.toEqual({
      userId: TEST_USER_A_ID,
      weeklyGoal: 3,
      monthlyGoal: null,
      updatedAt: updatedAt.toISOString(),
    });

    expect(goalRepositoryMock.save).toHaveBeenCalledWith({
      userId: TEST_USER_A_ID,
      weeklyGoal: 3,
      monthlyGoal: null,
    });
  });
});
