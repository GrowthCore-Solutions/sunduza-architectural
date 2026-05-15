import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { generateRequestId, checkRateLimit } from "@/lib/auth";
import { CreateBookingSchema } from "@/src/shared/schemas/booking.schema";
import { createBooking } from "@/src/server/use-cases/booking/create-booking";

export const dynamic = "force-dynamic";

// POST /api/v1/bookings — public endpoint, no auth required
// Rate limit: 5 submissions per IP per hour (S3.4)
// This route is a thin HTTP wrapper — all business logic is in the use-case
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const headers = { "X-Request-ID": requestId };

  // Layer 1: Rate limiting (S3.4)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`booking:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      apiError("Too many requests. Please try again in an hour.", ErrorCode.RATE_LIMIT_EXCEEDED, 429),
      { status: 429, headers }
    );
  }

  // Layer 2: Parse + validate (S2.23)
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      apiError("Invalid request body.", ErrorCode.BAD_REQUEST, 400),
      { status: 400, headers }
    );
  }

  const parsed = CreateBookingSchema.safeParse(body);
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

  // Honeypot check — bots fill this, humans don't
  if (parsed.data.website) {
    // Silent 200 — do not reveal to bots that they were caught
    return NextResponse.json(apiSuccess({ id: "ok", status: "PENDING" }), {
      status: 200,
      headers,
    });
  }

  // Layer 3: Delegate to use-case (S2.1 — no business logic in route)
  try {
    const result = await createBooking(parsed.data, {
      ipAddress: ip !== "unknown" ? ip : null,
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json(
      apiSuccess({ id: result.id, status: result.status, leadScore: result.leadScore }),
      { status: 201, headers }
    );
  } catch (err) {
    console.error(`[${requestId}] /api/v1/bookings POST error:`, err);
    return NextResponse.json(
      apiError("Something went wrong. Please try again.", ErrorCode.INTERNAL_ERROR, 500),
      { status: 500, headers }
    );
  }
}
