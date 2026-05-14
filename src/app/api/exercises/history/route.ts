import type { NextRequest } from "next/server";
import { exerciseController } from "@/server/controllers/exercise.controller";

export const GET = (request: NextRequest) => exerciseController.history(request);

