import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { requireAuthenticatedUserId } from "@/server/auth/session";
import { personalRecordService } from "@/server/services/personal-record.service";
import {
  personalRecordFiltersSchema,
} from "@/server/validations/personal-record.validation";

class PersonalRecordControllerError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

const getUserId = async () => requireAuthenticatedUserId();

const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.issues },
      { status: 400 },
    );
  }

  if (error instanceof PersonalRecordControllerError) {
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

export const personalRecordController = {
  async list(request: NextRequest) {
    try {
      const userId = await getUserId();
      const filters = personalRecordFiltersSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );
      const records = await personalRecordService.getPersonalRecords(
        userId,
        filters,
      );

      return NextResponse.json(records);
    } catch (error) {
      return handleError(error);
    }
  },
};
