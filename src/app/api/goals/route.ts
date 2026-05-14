import type { NextRequest } from "next/server";
import { goalController } from "@/server/controllers/goal.controller";

export const GET = (request: NextRequest) => goalController.get(request);

export const PUT = (request: NextRequest) => goalController.update(request);

