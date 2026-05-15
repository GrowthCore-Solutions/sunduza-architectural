import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { BookingSchema } from "@/types/booking";
import { BookingStatus } from "@prisma/client";
import { generateRequestId, checkRateLimit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  const ip = req.headers.get("x-forwarded-for") ?? "default";
  if (!checkRateLimit(`booking:${ip}`, 5, 60 * 60 * 1000)) {
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

    const booking = await db.booking.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        service: parsed.data.service,
        location: parsed.data.location,
        description: parsed.data.description,
        meetingDate: parsed.data.meetingDate
          ? new Date(parsed.data.meetingDate)
          : null,
        budget: parsed.data.budget,
        status: BookingStatus.PENDING,
        consentGiven: parsed.data.consentGiven ?? false,
        consentGivenAt: parsed.data.consentGiven ? new Date() : null,
      },
      select: { id: true, status: true },
    });

    return NextResponse.json(
      apiSuccess({ id: booking.id, status: booking.status }),
      { status: 201, headers: { "X-Request-ID": requestId } }
    );
  } catch (err) {
    console.error(`[${requestId}] Booking POST error:`, err);
    return NextResponse.json(
      apiError("Something went wrong. Please try again.", ErrorCode.INTERNAL_ERROR, 500),
      { status: 500, headers: { "X-Request-ID": requestId } }
    );
  }
}
