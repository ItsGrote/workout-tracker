import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TEST_EXERCISE_ID,
  TEST_SET_ID,
  TEST_USER_A_ID,
  TEST_WORKOUT_ID,
} from "../factories/workout.factory";
import { createApiRequest, readJson, routeContext } from "../helpers/api-request";

const authMock = vi.hoisted(() => ({
  requireAuthenticatedUserId: vi.fn(),
}));

const exerciseRepositoryMock = vi.hoisted(() => ({
  delete: vi.fn(),
  findByIdForUser: vi.fn(),
  update: vi.fn(),
}));

const workoutRepositoryMock = vi.hoisted(() => ({
  findById: vi.fn(),
}));

const exerciseSetRepositoryMock = vi.hoisted(() => ({
  delete: vi.fn(),
  findByIdForUser: vi.fn(),
  update: vi.fn(),
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

vi.mock("@/server/repositories/exercise.repository", () => ({
  exerciseRepository: exerciseRepositoryMock,
}));

vi.mock("@/server/repositories/workout.repository", () => ({
  workoutRepository: workoutRepositoryMock,
}));

vi.mock("@/server/repositories/exercise-set.repository", () => ({
  exerciseSetRepository: exerciseSetRepositoryMock,
}));

describe("exercise and set API route ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.requireAuthenticatedUserId.mockResolvedValue(TEST_USER_A_ID);
  });

  it("does not edit an exercise from another user's workout", async () => {
    const { PATCH } = await import(
      "@/app/api/workouts/[id]/exercises/[exerciseId]/route"
    );
    exerciseRepositoryMock.findByIdForUser.mockResolvedValueOnce(null);

    const response = await PATCH(
      createApiRequest(
        `/api/workouts/${TEST_WORKOUT_ID}/exercises/${TEST_EXERCISE_ID}`,
        {
          body: { name: "Hijacked Exercise" },
          method: "PATCH",
        },
      ),
      routeContext({ id: TEST_WORKOUT_ID, exerciseId: TEST_EXERCISE_ID }),
    );
    const body = await readJson<{ error: string; stack?: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Exercise not found");
    expect(body.stack).toBeUndefined();
    expect(exerciseRepositoryMock.update).not.toHaveBeenCalled();
  });

  it("does not delete an exercise from another user's workout", async () => {
    const { DELETE } = await import(
      "@/app/api/workouts/[id]/exercises/[exerciseId]/route"
    );
    exerciseRepositoryMock.findByIdForUser.mockResolvedValueOnce(null);

    const response = await DELETE(
      createApiRequest(
        `/api/workouts/${TEST_WORKOUT_ID}/exercises/${TEST_EXERCISE_ID}`,
        { method: "DELETE" },
      ),
      routeContext({ id: TEST_WORKOUT_ID, exerciseId: TEST_EXERCISE_ID }),
    );
    const body = await readJson<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Exercise not found");
    expect(exerciseRepositoryMock.delete).not.toHaveBeenCalled();
  });

  it("does not delete a set from another user's workout", async () => {
    const { DELETE } = await import(
      "@/app/api/exercises/[exerciseId]/sets/[setId]/route"
    );
    exerciseSetRepositoryMock.findByIdForUser.mockResolvedValueOnce(null);

    const response = await DELETE(
      createApiRequest(`/api/exercises/${TEST_EXERCISE_ID}/sets/${TEST_SET_ID}`, {
        method: "DELETE",
      }),
      routeContext({ exerciseId: TEST_EXERCISE_ID, setId: TEST_SET_ID }),
    );
    const body = await readJson<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Exercise set not found");
    expect(exerciseSetRepositoryMock.delete).not.toHaveBeenCalled();
  });

  it("deletes only the requested owned set", async () => {
    const { DELETE } = await import(
      "@/app/api/exercises/[exerciseId]/sets/[setId]/route"
    );
    exerciseSetRepositoryMock.findByIdForUser.mockResolvedValueOnce({
      id: TEST_SET_ID,
      exerciseId: TEST_EXERCISE_ID,
      exercise: {
        id: TEST_EXERCISE_ID,
        workout: { id: TEST_WORKOUT_ID, userId: TEST_USER_A_ID },
      },
    });
    exerciseSetRepositoryMock.delete.mockResolvedValueOnce({ id: TEST_SET_ID });

    const response = await DELETE(
      createApiRequest(`/api/exercises/${TEST_EXERCISE_ID}/sets/${TEST_SET_ID}`, {
        method: "DELETE",
      }),
      routeContext({ exerciseId: TEST_EXERCISE_ID, setId: TEST_SET_ID }),
    );

    expect(response.status).toBe(204);
    expect(exerciseSetRepositoryMock.delete).toHaveBeenCalledWith(TEST_SET_ID);
  });
});
