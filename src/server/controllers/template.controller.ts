import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { requireAuthenticatedUserId } from "@/server/auth/session";
import {
  templateService,
  TemplateServiceError,
} from "@/server/services/template.service";
import {
  createWorkoutTemplateSchema,
  templateIdSchema,
  updateWorkoutTemplateSchema,
} from "@/server/validations/template.validation";

const parseJsonBody = async (request: NextRequest) => {
  try {
    return await request.json();
  } catch {
    throw new TemplateServiceError("Invalid JSON body", 400);
  }
};

const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.issues },
      { status: 400 },
    );
  }

  if (error instanceof TemplateServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
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

const parseTemplateId = (id: string) => templateIdSchema.parse({ id }).id;

export const templateController = {
  async create(request: NextRequest) {
    try {
      const userId = await requireAuthenticatedUserId();
      const body = await parseJsonBody(request);
      const input = createWorkoutTemplateSchema.parse(body);
      const template = await templateService.create(userId, input);

      return NextResponse.json(template, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  },

  async list() {
    try {
      const userId = await requireAuthenticatedUserId();
      const templates = await templateService.list(userId);

      return NextResponse.json(templates);
    } catch (error) {
      return handleError(error);
    }
  },

  async findById(id: string) {
    try {
      const userId = await requireAuthenticatedUserId();
      const template = await templateService.findById(
        userId,
        parseTemplateId(id),
      );

      return NextResponse.json(template);
    } catch (error) {
      return handleError(error);
    }
  },

  async update(request: NextRequest, id: string) {
    try {
      const userId = await requireAuthenticatedUserId();
      const body = await parseJsonBody(request);
      const input = updateWorkoutTemplateSchema.parse(body);
      const template = await templateService.update(
        userId,
        parseTemplateId(id),
        input,
      );

      return NextResponse.json(template);
    } catch (error) {
      return handleError(error);
    }
  },

  async delete(id: string) {
    try {
      const userId = await requireAuthenticatedUserId();
      await templateService.delete(userId, parseTemplateId(id));

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return handleError(error);
    }
  },

  async start(id: string) {
    try {
      const userId = await requireAuthenticatedUserId();
      const draft = await templateService.start(userId, parseTemplateId(id));

      return NextResponse.json(draft);
    } catch (error) {
      return handleError(error);
    }
  },
};
