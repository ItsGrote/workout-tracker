import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseServerMock = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase-server", () => supabaseServerMock);

describe("requireAuthenticatedUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated Supabase user id", async () => {
    const { requireAuthenticatedUserId } = await import(
      "@/server/auth/session"
    );
    supabaseServerMock.createSupabaseServerClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "auth_user_test_01" } },
          error: null,
        }),
      },
    });

    await expect(requireAuthenticatedUserId()).resolves.toBe(
      "auth_user_test_01",
    );
  });

  it("fails safely when no user is authenticated", async () => {
    const { AuthenticationError, requireAuthenticatedUserId } = await import(
      "@/server/auth/session"
    );
    supabaseServerMock.createSupabaseServerClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    });

    await expect(requireAuthenticatedUserId()).rejects.toBeInstanceOf(
      AuthenticationError,
    );
  });

  it("fails safely when Supabase returns an auth error", async () => {
    const { AuthenticationError, requireAuthenticatedUserId } = await import(
      "@/server/auth/session"
    );
    supabaseServerMock.createSupabaseServerClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error("invalid session"),
        }),
      },
    });

    const error = await requireAuthenticatedUserId().catch((caught) => caught);

    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error).toMatchObject({ statusCode: 401 });
  });
});
