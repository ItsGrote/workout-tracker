import type { NextRequest } from "next/server";
import { templateController } from "@/server/controllers/template.controller";

type TemplateRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = async (
  request: NextRequest,
  context: TemplateRouteContext,
) => {
  const { id } = await context.params;

  return templateController.findById(id);
};

export const PATCH = async (
  request: NextRequest,
  context: TemplateRouteContext,
) => {
  const { id } = await context.params;

  return templateController.update(request, id);
};

export const DELETE = async (
  request: NextRequest,
  context: TemplateRouteContext,
) => {
  const { id } = await context.params;

  return templateController.delete(id);
};
