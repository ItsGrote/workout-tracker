import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTemplateInput,
  createTemplateRecord,
  TEST_TEMPLATE_ID,
} from "../factories/template.factory";
import { TEST_USER_A_ID } from "../factories/workout.factory";
import { createApiRequest, readJson, routeContext } from "../helpers/api-request";

const authMock = vi.hoisted(() => ({
  requireAuthenticatedUserId: vi.fn(),
}));

const templateRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
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

vi.mock("@/server/repositories/template.repository", () => ({
  templateRepository: templateRepositoryMock,
}));

describe("template API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.requireAuthenticatedUserId.mockResolvedValue(TEST_USER_A_ID);
  });

  it("returns 401 when an anonymous user lists templates", async () => {
    const { GET } = await import("@/app/api/templates/route");
    const authError = new Error("Authentication required") as Error & {
      statusCode: number;
    };
    authError.statusCode = 401;
    authMock.requireAuthenticatedUserId.mockRejectedValueOnce(authError);

    const response = await GET();
    const body = await readJson<{ error: string }>(response);

    expect(response.status).toBe(401);
    expect(body.error).toBe("Authentication required");
    expect(templateRepositoryMock.findMany).not.toHaveBeenCalled();
  });

  it("creates a valid template for the authenticated user", async () => {
    const { POST } = await import("@/app/api/templates/route");
    templateRepositoryMock.create.mockResolvedValueOnce(createTemplateRecord());

    const response = await POST(
      createApiRequest("/api/templates", {
        body: createTemplateInput(),
        method: "POST",
      }),
    );
    const body = await readJson<{ id: string }>(response);

    expect(response.status).toBe(201);
    expect(body.id).toBe(TEST_TEMPLATE_ID);
    expect(templateRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: TEST_USER_A_ID }),
    );
  });

  it("rejects invalid template payloads", async () => {
    const { POST } = await import("@/app/api/templates/route");

    const response = await POST(
      createApiRequest("/api/templates", {
        body: { name: "", exercises: [] },
        method: "POST",
      }),
    );
    const body = await readJson<{ error: string; stack?: string }>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(body.stack).toBeUndefined();
    expect(templateRepositoryMock.create).not.toHaveBeenCalled();
  });

  it("does not expose another user's template", async () => {
    const { GET } = await import("@/app/api/templates/[id]/route");
    templateRepositoryMock.findById.mockResolvedValueOnce(null);

    const response = await GET(
      createApiRequest(`/api/templates/${TEST_TEMPLATE_ID}`),
      routeContext({ id: TEST_TEMPLATE_ID }),
    );
    const body = await readJson<{ error: string }>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("Template not found");
    expect(templateRepositoryMock.findById).toHaveBeenCalledWith(
      TEST_TEMPLATE_ID,
      TEST_USER_A_ID,
    );
  });

  it("does not edit another user's template", async () => {
    const { PATCH } = await import("@/app/api/templates/[id]/route");
    templateRepositoryMock.update.mockResolvedValueOnce(null);

    const response = await PATCH(
      createApiRequest(`/api/templates/${TEST_TEMPLATE_ID}`, {
        body: { name: "Hijack" },
        method: "PATCH",
      }),
      routeContext({ id: TEST_TEMPLATE_ID }),
    );

    expect(response.status).toBe(404);
    expect(templateRepositoryMock.update).toHaveBeenCalledWith(
      TEST_TEMPLATE_ID,
      TEST_USER_A_ID,
      expect.objectContaining({ name: "Hijack" }),
    );
  });

  it("does not delete another user's template", async () => {
    const { DELETE } = await import("@/app/api/templates/[id]/route");
    templateRepositoryMock.delete.mockResolvedValueOnce({ count: 0 });

    const response = await DELETE(
      createApiRequest(`/api/templates/${TEST_TEMPLATE_ID}`, {
        method: "DELETE",
      }),
      routeContext({ id: TEST_TEMPLATE_ID }),
    );

    expect(response.status).toBe(404);
  });

  it("starts a workout draft without creating a real workout", async () => {
    const { POST } = await import("@/app/api/templates/[id]/start/route");
    templateRepositoryMock.findById.mockResolvedValueOnce(createTemplateRecord());

    const response = await POST(
      createApiRequest(`/api/templates/${TEST_TEMPLATE_ID}/start`, {
        method: "POST",
      }),
      routeContext({ id: TEST_TEMPLATE_ID }),
    );
    const body = await readJson<{ exercises: unknown[]; id?: string }>(response);

    expect(response.status).toBe(200);
    expect(body.id).toBeUndefined();
    expect(body.exercises).toHaveLength(1);
    expect(templateRepositoryMock.create).not.toHaveBeenCalled();
  });
});
