import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/backend/lib/api-response";
import { BookingSchema } from "@/shared/types/booking";
import { createBooking } from "@/backend/services/bookings";
import { checkBookingRateLimit } from "@/backend/lib/rate-limit";
import { generateRequestId, getClientIp } from "@/backend/lib/request";

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const ip = getClientIp(req);

  if (!(await checkBookingRateLimit(ip))) {
    return NextResponse.json(
      apiError("Too many requests. Please try again later.", ErrorCode.RATE_LIMIT_EXCEEDED, 429),
      { status: 429, headers: { "X-Request-ID": requestId } }
    );
  }

  try {
    const body = await req.json();
    const parsed = BookingSchema.safeParse(body);

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

    const booking = await createBooking(parsed.data, {
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    return NextResponse.json(apiSuccess(booking), {
      status: 201,
      headers: { "X-Request-ID": requestId },
    });
  } catch (err) {
    console.error(`[${requestId}] Booking POST error:`, err);
    return NextResponse.json(
      apiError("Something went wrong. Please try again.", ErrorCode.INTERNAL_ERROR, 500),
      { status: 500, headers: { "X-Request-ID": requestId } }
    );
  }
}
