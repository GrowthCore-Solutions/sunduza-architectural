import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateRequestId } from "@/lib/auth";

export async function GET() {
  const requestId = generateRequestId();
  try {
    const health = {
      status: "ok",
      requestId,
      timestamp: new Date().toISOString(),
      database: await db.$queryRaw`SELECT 1`.then(() => "connected").catch(() => "disconnected"),
    };
    return NextResponse.json(health, { status: 200 });
  } catch {
    return NextResponse.json(
      { status: "error", requestId, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
