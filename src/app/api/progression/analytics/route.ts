import type { NextRequest } from "next/server";
import { progressionAnalyticsController } from "@/server/controllers/progression-analytics.controller";

export const GET = (request: NextRequest) =>
  progressionAnalyticsController.getAnalytics(request);
