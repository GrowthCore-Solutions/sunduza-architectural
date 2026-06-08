import { NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/backend/lib/api-response";
import { checkDatabaseConnection } from "@/backend/services/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const connected = await checkDatabaseConnection();

  if (!connected) {
    return NextResponse.json(
      apiError("Database unavailable", ErrorCode.SERVICE_UNAVAILABLE, 503),
      { status: 503 }
    );
  }

  return NextResponse.json(
    apiSuccess({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    })
  );
}
