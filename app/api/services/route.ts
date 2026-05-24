import { NextResponse } from "next/server";
import { apiSuccess } from "@/backend/lib/api-response";
import { getActiveServices } from "@/backend/services/services";
import { generateRequestId } from "@/backend/lib/request";

export async function GET() {
  const requestId = generateRequestId();
  const services = await getActiveServices();

  return NextResponse.json(apiSuccess(services), {
    headers: { "X-Request-ID": requestId },
  });
}
