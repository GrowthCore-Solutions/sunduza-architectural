import { NextResponse } from "next/server";
import { z } from "zod";
import { AuditAction } from "@prisma/client";
import { apiList, apiError, ErrorCode } from "@/backend/lib/api-response";
import { getAuditLog } from "@/backend/services/audit";
import { withAuth, ADMIN_ONLY } from "@/backend/lib/with-auth";
import { generateRequestId } from "@/backend/lib/request";

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  action: z.nativeEnum(AuditAction).optional(),
  entityType: z.string().max(64).optional(),
});

export const GET = withAuth(
  async (req) => {
    const requestId = generateRequestId();
    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));

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

    const result = await getAuditLog(parsed.data);

    return NextResponse.json(
      apiList(result.entries, result.total, result.page, parsed.data.limit),
      { headers: { "X-Request-ID": requestId } }
    );
  },
  { requireRole: ADMIN_ONLY }
);
