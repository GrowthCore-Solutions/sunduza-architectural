import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { generateRequestId, checkRateLimit } from "@/lib/auth";
import { CreateContactSchema } from "@/src/shared/schemas/contact.schema";
import { createContact } from "@/src/server/use-cases/contact/create-contact";

export const dynamic = "force-dynamic";

// POST /api/v1/contact — public endpoint, no auth required
// Rate limit: 3 submissions per IP per hour (S3.4)
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const headers = { "X-Request-ID": requestId };

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      apiError("Too many requests. Please try again later.", ErrorCode.RATE_LIMIT_EXCEEDED, 429),
      { status: 429, headers }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      apiError("Invalid request body.", ErrorCode.BAD_REQUEST, 400),
      { status: 400, headers }
    );
  }

  const parsed = CreateContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(
        parsed.error.issues.map((e) => e.message).join(". "),
        ErrorCode.VALIDATION_ERROR,
        400,
        parsed.error.flatten().fieldErrors
      ),
      { status: 400, headers }
    );
  }

  try {
    const result = await createContact(parsed.data, {
      ipAddress: ip !== "unknown" ? ip : null,
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json(
      apiSuccess({ id: result.id }),
      { status: 201, headers }
    );
  } catch (err) {
    console.error(`[${requestId}] /api/v1/contact POST error:`, err);
    return NextResponse.json(
      apiError("Something went wrong. Please try again.", ErrorCode.INTERNAL_ERROR, 500),
      { status: 500, headers }
    );
  }
}
