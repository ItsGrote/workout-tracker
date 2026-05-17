import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTemplateInput,
  createTemplateRecord,
  TEST_TEMPLATE_ID,
} from "../factories/template.factory";
import { TEST_USER_A_ID, TEST_USER_B_ID } from "../factories/workout.factory";
import {
  createWorkoutTemplateSchema,
  updateWorkoutTemplateSchema,
} from "@/server/validations/template.validation";

const templateRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/server/repositories/template.repository", () => ({
  templateRepository: templateRepositoryMock,
}));

describe("templateService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a valid template without requiring reps or weight", async () => {
    const { templateService } = await import("@/server/services/template.service");
    const input = createWorkoutTemplateSchema.parse(createTemplateInput());
    templateRepositoryMock.create.mockResolvedValueOnce(createTemplateRecord());

    await templateService.create(TEST_USER_A_ID, input);

    expect(templateRepositoryMock.create).toHaveBeenCalledWith({
      userId: TEST_USER_A_ID,
      name: "Chest + Arms",
      category: "Chest + Arms",
      exercises: [
        {
          name: "Bench Press",
          order: 1,
          sets: [{ setType: "WORKING", order: 1 }],
        },
      ],
    });
  });

  it("blocks empty templates at validation boundary", () => {
    expect(() =>
      createWorkoutTemplateSchema.parse(
        createTemplateInput({ name: "", exercises: [] }),
      ),
    ).toThrow();
  });

  it("updates a template owned by the authenticated user", async () => {
    const { templateService } = await import("@/server/services/template.service");
    const input = updateWorkoutTemplateSchema.parse({
      name: "Push Template",
      exercises: [
        {
          name: "Incline Press",
          order: 1,
          sets: [{ setType: "warm-up", order: 1 }],
        },
      ],
    });
    templateRepositoryMock.update.mockResolvedValueOnce(createTemplateRecord());

    await templateService.update(TEST_USER_A_ID, TEST_TEMPLATE_ID, input);

    expect(templateRepositoryMock.update).toHaveBeenCalledWith(
      TEST_TEMPLATE_ID,
      TEST_USER_A_ID,
      {
        category: undefined,
        name: "Push Template",
        exercises: [
          {
            name: "Incline Press",
            order: 1,
            sets: [{ setType: "WARM_UP", order: 1 }],
          },
        ],
      },
    );
  });

  it("does not update another user's template", async () => {
    const { templateService, TemplateServiceError } = await import(
      "@/server/services/template.service"
    );
    templateRepositoryMock.update.mockResolvedValueOnce(null);

    await expect(
      templateService.update(TEST_USER_B_ID, TEST_TEMPLATE_ID, {
        name: "Hijack",
      }),
    ).rejects.toBeInstanceOf(TemplateServiceError);
  });

  it("deletes a template owned by the authenticated user", async () => {
    const { templateService } = await import("@/server/services/template.service");
    templateRepositoryMock.delete.mockResolvedValueOnce({ count: 1 });

    await expect(
      templateService.delete(TEST_USER_A_ID, TEST_TEMPLATE_ID),
    ).resolves.toBeUndefined();
  });

  it("does not delete another user's template", async () => {
    const { templateService, TemplateServiceError } = await import(
      "@/server/services/template.service"
    );
    templateRepositoryMock.delete.mockResolvedValueOnce({ count: 0 });

    await expect(
      templateService.delete(TEST_USER_B_ID, TEST_TEMPLATE_ID),
    ).rejects.toBeInstanceOf(TemplateServiceError);
  });

  it("starts a workout draft from a template without creating a real workout", async () => {
    const { templateService } = await import("@/server/services/template.service");
    templateRepositoryMock.findById.mockResolvedValueOnce(createTemplateRecord());

    const draft = await templateService.start(TEST_USER_A_ID, TEST_TEMPLATE_ID);

    expect(draft).toEqual({
      name: "Chest + Arms",
      category: "Chest + Arms",
      exercises: [
        {
          name: "Bench Press",
          order: 1,
          sets: [{ setType: "WORKING", order: 1 }],
        },
      ],
    });
    expect(templateRepositoryMock.create).not.toHaveBeenCalled();
  });

  it("does not start a workout from another user's template", async () => {
    const { templateService, TemplateServiceError } = await import(
      "@/server/services/template.service"
    );
    templateRepositoryMock.findById.mockResolvedValueOnce(null);

    await expect(
      templateService.start(TEST_USER_B_ID, TEST_TEMPLATE_ID),
    ).rejects.toBeInstanceOf(TemplateServiceError);
  });
});
