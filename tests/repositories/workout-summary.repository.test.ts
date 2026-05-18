import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_USER_A_ID } from "../factories/workout.factory";

const prismaMock = vi.hoisted(() => ({
  workout: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("workoutSummaryRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.workout.findFirst.mockResolvedValue(null);
  });

  it("looks up previous workouts with the same name on the same day using createdAt order", async () => {
    const { workoutSummaryRepository } = await import(
      "@/server/repositories/workout-summary.repository"
    );
    const currentDate = new Date("2026-05-17T12:00:00.000Z");
    const currentCreatedAt = new Date("2026-05-17T18:00:00.000Z");

    await workoutSummaryRepository.findPreviousByName({
      currentCreatedAt,
      currentDate,
      currentWorkoutId: "workout_2",
      name: "Legs",
      userId: TEST_USER_A_ID,
    });

    expect(prismaMock.workout.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { date: "desc" },
          { createdAt: "desc" },
          { id: "desc" },
        ],
        where: expect.objectContaining({
          name: "Legs",
          userId: TEST_USER_A_ID,
          AND: [
            { id: { not: "workout_2" } },
            {
              OR: [
                { date: { lt: currentDate } },
                {
                  date: currentDate,
                  createdAt: { lt: currentCreatedAt },
                },
                {
                  date: currentDate,
                  createdAt: currentCreatedAt,
                  id: { lt: "workout_2" },
                },
              ],
            },
          ],
        }),
      }),
    );
  });

  it("looks up previous workouts with the same category on the same day", async () => {
    const { workoutSummaryRepository } = await import(
      "@/server/repositories/workout-summary.repository"
    );
    const currentDate = new Date("2026-05-17T12:00:00.000Z");
    const currentCreatedAt = new Date("2026-05-17T18:00:00.000Z");

    await workoutSummaryRepository.findPreviousByCategory({
      category: "Legs",
      currentCreatedAt,
      currentDate,
      currentWorkoutId: "workout_2",
      userId: TEST_USER_A_ID,
    });

    expect(prismaMock.workout.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: "Legs",
          userId: TEST_USER_A_ID,
          AND: expect.arrayContaining([
            { id: { not: "workout_2" } },
            expect.objectContaining({
              OR: expect.arrayContaining([
                {
                  date: currentDate,
                  createdAt: { lt: currentCreatedAt },
                },
              ]),
            }),
          ]),
        }),
      }),
    );
  });

  it("excludes the current workout from the previous workout lookup", async () => {
    const { workoutSummaryRepository } = await import(
      "@/server/repositories/workout-summary.repository"
    );

    await workoutSummaryRepository.findPreviousByName({
      currentCreatedAt: new Date("2026-05-17T18:00:00.000Z"),
      currentDate: new Date("2026-05-17T12:00:00.000Z"),
      currentWorkoutId: "workout_current",
      name: "Push",
      userId: TEST_USER_A_ID,
    });

    expect(prismaMock.workout.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            { id: { not: "workout_current" } },
          ]),
        }),
      }),
    );
  });

  it("keeps previous workout lookup scoped to the authenticated user", async () => {
    const { workoutSummaryRepository } = await import(
      "@/server/repositories/workout-summary.repository"
    );

    await workoutSummaryRepository.findPreviousByCategory({
      category: "Push",
      currentCreatedAt: new Date("2026-05-17T18:00:00.000Z"),
      currentDate: new Date("2026-05-17T12:00:00.000Z"),
      currentWorkoutId: "workout_current",
      userId: TEST_USER_A_ID,
    });

    expect(prismaMock.workout.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: "Push",
          userId: TEST_USER_A_ID,
        }),
      }),
    );
  });

  it("allows an earlier workout from the same day to beat an older previous-day workout", async () => {
    const { workoutSummaryRepository } = await import(
      "@/server/repositories/workout-summary.repository"
    );
    const currentDate = new Date("2026-05-17T12:00:00.000Z");
    const currentCreatedAt = new Date("2026-05-17T18:00:00.000Z");

    await workoutSummaryRepository.findPreviousByName({
      currentCreatedAt,
      currentDate,
      currentWorkoutId: "workout_2",
      name: "Legs",
      userId: TEST_USER_A_ID,
    });

    expect(prismaMock.workout.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { date: "desc" },
          { createdAt: "desc" },
          { id: "desc" },
        ],
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: [
                { date: { lt: currentDate } },
                {
                  date: currentDate,
                  createdAt: { lt: currentCreatedAt },
                },
                {
                  date: currentDate,
                  createdAt: currentCreatedAt,
                  id: { lt: "workout_2" },
                },
              ],
            }),
          ]),
        }),
      }),
    );
  });
});
