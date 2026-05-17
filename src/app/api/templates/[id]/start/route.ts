import type { NextRequest } from "next/server";
import { templateController } from "@/server/controllers/template.controller";

type StartTemplateRouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = async (
  request: NextRequest,
  context: StartTemplateRouteContext,
) => {
  const { id } = await context.params;

  return templateController.start(id);
};
