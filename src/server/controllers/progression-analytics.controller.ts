import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { requireAuthenticatedUserId } from "@/server/auth/session";
import { progressionAnalyticsService } from "@/server/services/progression-analytics.service";
import { progressionAnalyticsQuerySchema } from "@/server/validations/progression-analytics.validation";

const getUserId = async () => requireAuthenticatedUserId();

const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.issues },
      { status: 400 },
    );
  }

  if (error instanceof Error && "statusCode" in error) {
    return NextResponse.json(
      { error: error.message },
      { status: Number(error.statusCode) },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

export const progressionAnalyticsController = {
  async getAnalytics(request: NextRequest) {
    try {
      const userId = await getUserId();
      const query = progressionAnalyticsQuerySchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );
      const analytics = await progressionAnalyticsService.getAnalytics(
        userId,
        query,
      );

      return NextResponse.json(analytics);
    } catch (error) {
      return handleError(error);
    }
  },
};
