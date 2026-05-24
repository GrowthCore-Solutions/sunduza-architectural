import { NextResponse } from "next/server";
import { z } from "zod";
import { apiList, apiError, ErrorCode } from "@/backend/lib/api-response";
import { getLeads } from "@/backend/services/leads";
import { withAuth } from "@/backend/lib/with-auth";
import { generateRequestId } from "@/backend/lib/request";

const LeadListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const GET = withAuth(async (req) => {
  const requestId = generateRequestId();
  const { searchParams } = new URL(req.url);
  const parsed = LeadListQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      apiError(
        parsed.error.issues.map((e) => e.message).join(", "),
        ErrorCode.VALIDATION_ERROR,
        400
      ),
      { status: 400, headers: { "X-Request-ID": requestId } }
    );
  }

  const result = await getLeads(parsed.data);

  return NextResponse.json(
    apiList(result.leads, result.total, result.page, parsed.data.limit),
    { headers: { "X-Request-ID": requestId } }
  );
});
