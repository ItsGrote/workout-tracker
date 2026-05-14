import type { NextRequest } from "next/server";
import { workoutController } from "@/server/controllers/workout.controller";

export const GET = (request: NextRequest) => workoutController.list(request);

export const POST = (request: NextRequest) => workoutController.create(request);

