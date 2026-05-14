import type { NextRequest } from "next/server";
import { progressionController } from "@/server/controllers/progression.controller";

export const GET = (request: NextRequest) =>
  progressionController.getVolumeProgression(request);

