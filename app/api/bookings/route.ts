import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { BookingSchema } from "@/types/booking";
import { generateRequestId, checkRateLimit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  // Rate limit: 20 booking submissions per IP per hour (Backend B26)
  const ip = req.headers.get("x-forwarded-for") ?? "default";
  if (!checkRateLimit(`booking:${ip}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json(
      apiError("Too many requests. Please try again later.", ErrorCode.RATE_LIMITED, 429),
      { status: 429, headers: { "X-Request-ID": requestId } }
    );
  }

  try {
    const body = await req.json();
    const parsed = BookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
          ErrorCode.VALIDATION_ERROR,
          400
        ),
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    const booking = await db.booking.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        service: parsed.data.service,
        location: parsed.data.location,
        description: parsed.data.description,
        meetingDate: new Date(parsed.data.meetingDate),
        budget: parsed.data.budget,
        status: "new",
      },
    });

    return NextResponse.json(apiSuccess({ id: booking.id, status: booking.status }), {
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
