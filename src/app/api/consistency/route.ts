import type { NextRequest } from "next/server";
import { consistencyController } from "@/server/controllers/consistency.controller";

export const GET = (request: NextRequest) => consistencyController.get(request);

