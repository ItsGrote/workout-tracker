import type { NextRequest } from "next/server";
import { templateController } from "@/server/controllers/template.controller";

export const GET = () => templateController.list();

export const POST = (request: NextRequest) => templateController.create(request);
