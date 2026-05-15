import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      apiSuccess({
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error("[health] Database unreachable:", err);
    return NextResponse.json(
      apiError("Database unavailable", ErrorCode.SERVICE_UNAVAILABLE, 503),
      { status: 503 }
    );
  }
}
