import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_USER_A_ID, TEST_WORKOUT_ID } from "../factories/workout.factory";
import { createApiRequest, readJson, routeContext } from "../helpers/api-request";

const authMock = vi.hoisted(() => ({
  requireAuthenticatedUserId: vi.fn(),
}));

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

vi.mock("@/server/auth/session", () => {
  class AuthenticationError extends Error {
    statusCode = 401;
  }

  return {
    AuthenticationError,
    requireAuthenticatedUserId: authMock.requireAuthenticatedUserId,
  };
});

vi.mock("@/server/repositories/workout-summary.repository", () => ({
  workoutSummaryRepository: workoutSummaryRepositoryMock,
}));

vi.mock("@/server/services/personal-record.service", () => ({
  personalRecordService: personalRecordServiceMock,
}));

vi.mock("@/server/services/consistency.service", () => ({
  consistencyService: consistencyServiceMock,
}));

describe("workout summary API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.requireAuthenticatedUserId.mockResolvedValue(TEST_USER_A_ID);
    workoutSummaryRepositoryMock.findPreviousByCategory.mockResolvedValue(null);
    workoutSummaryRepositoryMock.findPreviousByName.mockResolvedValue(null);
    personalRecordServiceMock.getPersonalRecords.mockResolvedValue({
      filters: {},
      newRecords: [],
      records: [],
    });
    consistencyServiceMock.getConsistency.mockResolvedValue({
      completedWeekStreak: 0,
      history: [],
      monthly: {
        completionPercentage: 0,
        endDate: "2026-05-31T23:59:59.999Z",
        goal: null,
        remaining: null,
        startDate: "2026-05-01T00:00:00.000Z",
        trainedDays: 0,
      },
      weekly: {
        completionPercentage: 0,
        endDate: "2026-05-17T23:59:59.999Z",
        goal: null,
        remaining: null,
        startDate: "2026-05-11T00:00:00.000Z",
        status: "in_progress",
        trainedDays: 0,
      },
    });
  });

  it("returns summary for an authenticated user's workout", async () => {
    const { GET } = await import("@/app/api/workouts/[id]/summary/route");
    workoutSummaryRepositoryMock.findWorkoutById.mockResolvedValueOnce({
      category: "Push",
      date: new Date("2026-05-10T12:00:00.000Z"),
      exercises: [
        {
          sets: [{ repetitions: 10, weightKg: 20 }],
        },
      ],
      id: TEST_WORKOUT_ID,
      name: "Push A",
    });

    const response = await GET(
      createApiRequest(`/api/workouts/${TEST_WORKOUT_ID}/summary`),
      routeContext({ id: TEST_WORKOUT_ID }),
    );
    const body = await readJson<{ totalVolume: number; workoutId: string }>(
      response,
    );

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      totalVolume: 200,
      workoutId: TEST_WORKOUT_ID,
    });
  });

  it("returns 401 for anonymous users", async () => {
    const { GET } = await import("@/app/api/workouts/[id]/summary/route");
    const authError = new Error("Authentication required") as Error & {
      statusCode: number;
    };
    authError.statusCode = 401;
    authMock.requireAuthenticatedUserId.mockRejectedValueOnce(authError);

    const response = await GET(
      createApiRequest(`/api/workouts/${TEST_WORKOUT_ID}/summary`),
      routeContext({ id: TEST_WORKOUT_ID }),
    );

    expect(response.status).toBe(401);
    expect(workoutSummaryRepositoryMock.findWorkoutById).not.toHaveBeenCalled();
  });

  it("does not expose another user's workout summary", async () => {
    const { GET } = await import("@/app/api/workouts/[id]/summary/route");
    workoutSummaryRepositoryMock.findWorkoutById.mockResolvedValueOnce(null);

    const response = await GET(
      createApiRequest(`/api/workouts/${TEST_WORKOUT_ID}/summary`),
      routeContext({ id: TEST_WORKOUT_ID }),
    );
    const body = await readJson<{ error: string; stack?: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Workout not found");
    expect(body.stack).toBeUndefined();
  });
});
