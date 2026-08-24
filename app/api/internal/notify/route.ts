import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/backend/lib/api-response";
import { processPendingNotifications } from "@/backend/services/notifications";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const result = await processPendingNotifications();
  return NextResponse.json(apiSuccess(result));
}
