import { NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/backend/lib/api-response";
import { getLeadWithBookings } from "@/backend/services/leads";
import { withAuth } from "@/backend/lib/with-auth";
import { generateRequestId } from "@/backend/lib/request";

export const GET = withAuth(async (_req, _session, context) => {
  const requestId = generateRequestId();
  const { id } = await context!.params;

  const result = await getLeadWithBookings(id);
  if (!result) {
    return NextResponse.json(
      apiError("Lead not found", ErrorCode.NOT_FOUND, 404),
      { status: 404, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess(result), {
    headers: { "X-Request-ID": requestId },
  });
});
