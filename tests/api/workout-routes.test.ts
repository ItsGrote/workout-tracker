import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createWorkoutInput,
  createWorkoutRecord,
  TEST_USER_A_ID,
  TEST_USER_B_ID,
  TEST_WORKOUT_ID,
} from "../factories/workout.factory";
import { createApiRequest, readJson, routeContext } from "../helpers/api-request";

const authMock = vi.hoisted(() => ({
  requireAuthenticatedUserId: vi.fn(),
}));

const workoutRepositoryMock = vi.hoisted(() => ({
  createWithExercises: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
  updateWithExercises: vi.fn(),
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

vi.mock("@/server/repositories/workout.repository", () => ({
  workoutRepository: workoutRepositoryMock,
}));

describe("workout API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    authMock.requireAuthenticatedUserId.mockResolvedValue(TEST_USER_A_ID);
  });

  it("allows an authenticated user to list their own workouts", async () => {
    const { GET } = await import("@/app/api/workouts/route");
    const workout = createWorkoutRecord();
    workoutRepositoryMock.findMany.mockResolvedValueOnce([workout]);

    const response = await GET(createApiRequest("/api/workouts"));
    const body = await readJson<unknown[]>(response);

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(workoutRepositoryMock.findMany).toHaveBeenCalledWith({
      userId: TEST_USER_A_ID,
      category: undefined,
      exerciseName: undefined,
      fromDate: undefined,
      search: undefined,
      toDate: undefined,
    });
  });

  it("returns 401 when no authenticated user exists", async () => {
    const { GET } = await import("@/app/api/workouts/route");
    const authError = new Error("Authentication required") as Error & {
      statusCode: number;
    };
    authError.statusCode = 401;
    authMock.requireAuthenticatedUserId.mockRejectedValueOnce(authError);

    const response = await GET(createApiRequest("/api/workouts"));
    const body = await readJson<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
    expect(workoutRepositoryMock.findMany).not.toHaveBeenCalled();
  });

  it("does not expose another user's workout", async () => {
    const { GET } = await import("@/app/api/workouts/[id]/route");
    workoutRepositoryMock.findById.mockResolvedValueOnce(null);

    const response = await GET(
      createApiRequest(`/api/workouts/${TEST_WORKOUT_ID}`),
      routeContext({ id: TEST_WORKOUT_ID }),
    );
    const body = await readJson<{ error: string; stack?: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Workout not found");
    expect(body.stack).toBeUndefined();
    expect(workoutRepositoryMock.findById).toHaveBeenCalledWith(
      TEST_WORKOUT_ID,
      TEST_USER_A_ID,
    );
  });

  it("does not edit another user's workout", async () => {
    const { PATCH } = await import("@/app/api/workouts/[id]/route");
    workoutRepositoryMock.updateWithExercises.mockResolvedValueOnce(null);

    const response = await PATCH(
      createApiRequest(`/api/workouts/${TEST_WORKOUT_ID}`, {
        body: { name: "Hijacked" },
        method: "PATCH",
      }),
      routeContext({ id: TEST_WORKOUT_ID }),
    );
    const body = await readJson<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Workout not found");
    expect(workoutRepositoryMock.updateWithExercises).toHaveBeenCalledWith(
      TEST_WORKOUT_ID,
      TEST_USER_A_ID,
      expect.objectContaining({ name: "Hijacked" }),
    );
  });

  it("does not delete another user's workout", async () => {
    const { DELETE } = await import("@/app/api/workouts/[id]/route");
    workoutRepositoryMock.delete.mockResolvedValueOnce({ count: 0 });

    const response = await DELETE(
      createApiRequest(`/api/workouts/${TEST_WORKOUT_ID}`, {
        method: "DELETE",
      }),
      routeContext({ id: TEST_WORKOUT_ID }),
    );
    const body = await readJson<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Workout not found");
    expect(workoutRepositoryMock.delete).toHaveBeenCalledWith(
      TEST_WORKOUT_ID,
      TEST_USER_A_ID,
    );
  });

  it("does not duplicate another user's workout", async () => {
    const { POST } = await import("@/app/api/workouts/[id]/duplicate/route");
    workoutRepositoryMock.findById.mockResolvedValueOnce(null);

    const response = await POST(
      createApiRequest(`/api/workouts/${TEST_WORKOUT_ID}/duplicate`, {
        method: "POST",
      }),
      routeContext({ id: TEST_WORKOUT_ID }),
    );
    const body = await readJson<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Workout not found");
  });

  it("creates a valid workout through the route", async () => {
    const { POST } = await import("@/app/api/workouts/route");
    const workout = createWorkoutRecord();
    workoutRepositoryMock.createWithExercises.mockResolvedValueOnce(workout);

    const response = await POST(
      createApiRequest("/api/workouts", {
        body: createWorkoutInput(),
        method: "POST",
      }),
    );
    const body = await readJson<{ id: string }>(response);

    expect(response.status).toBe(201);
    expect(body.id).toBe(TEST_WORKOUT_ID);
    expect(workoutRepositoryMock.createWithExercises).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Push A",
        userId: TEST_USER_A_ID,
      }),
    );
  });

  it("rejects an invalid workout with a safe validation response", async () => {
    const { POST } = await import("@/app/api/workouts/route");

    const response = await POST(
      createApiRequest("/api/workouts", {
        body: { name: "", exercises: [] },
        method: "POST",
      }),
    );
    const body = await readJson<{ error: string; issues: unknown[]; stack?: string }>(
      response,
    );

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(body.issues.length).toBeGreaterThan(0);
    expect(body.stack).toBeUndefined();
    expect(workoutRepositoryMock.createWithExercises).not.toHaveBeenCalled();
  });

  it("duplicates a workout with the current date instead of the old date", async () => {
    const now = new Date("2026-05-16T15:30:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const { POST } = await import("@/app/api/workouts/[id]/duplicate/route");
    workoutRepositoryMock.findById.mockResolvedValueOnce(createWorkoutRecord());
    workoutRepositoryMock.createWithExercises.mockResolvedValueOnce({
      ...createWorkoutRecord(),
      id: "workout_copy_01",
      date: now,
    });

    const response = await POST(
      createApiRequest(`/api/workouts/${TEST_WORKOUT_ID}/duplicate`, {
        method: "POST",
      }),
      routeContext({ id: TEST_WORKOUT_ID }),
    );

    expect(response.status).toBe(201);
    expect(workoutRepositoryMock.createWithExercises).toHaveBeenCalledWith(
      expect.objectContaining({
        date: now,
        name: "Push A (copy)",
        userId: TEST_USER_A_ID,
      }),
    );
  });

  it("deletes an owned workout", async () => {
    const { DELETE } = await import("@/app/api/workouts/[id]/route");
    workoutRepositoryMock.delete.mockResolvedValueOnce({ count: 1 });

    const response = await DELETE(
      createApiRequest(`/api/workouts/${TEST_WORKOUT_ID}`, {
        method: "DELETE",
      }),
      routeContext({ id: TEST_WORKOUT_ID }),
    );

    expect(response.status).toBe(204);
    expect(workoutRepositoryMock.delete).toHaveBeenCalledWith(
      TEST_WORKOUT_ID,
      TEST_USER_A_ID,
    );
  });

  it("keeps test users explicit in ownership scenarios", () => {
    expect(TEST_USER_A_ID).not.toBe(TEST_USER_B_ID);
  });
});
