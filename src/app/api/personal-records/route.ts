import type { NextRequest } from "next/server";
import { personalRecordController } from "@/server/controllers/personal-record.controller";

export const GET = (request: NextRequest) =>
  personalRecordController.list(request);

