import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { BookingUpdateSchema } from "@/types/booking";
import {
  getBookingById,
  updateBookingStatus,
  softDeleteBooking,
} from "@/server/bookings";
import { withAuth } from "@/lib/with-auth";
import { generateRequestId, getClientIp } from "@/lib/request";

export const GET = withAuth(async (_req, _session, context) => {
  const requestId = generateRequestId();
  const { id } = await context!.params;

  const booking = await getBookingById(id);
  if (!booking) {
    return NextResponse.json(
      apiError("Booking not found", ErrorCode.NOT_FOUND, 404),
      { status: 404, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess(booking), {
    headers: { "X-Request-ID": requestId },
  });
});

export const PATCH = withAuth(async (req, session, context) => {
  const requestId = generateRequestId();
  const { id } = await context!.params;
  const body = await req.json();
  const parsed = BookingUpdateSchema.safeParse(body);

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

  const result = await updateBookingStatus(
    id,
    { status: parsed.data.status, adminNotes: parsed.data.adminNotes },
    { userId: session.user.id, ipAddress: getClientIp(req) }
  );

  if (result.error) {
    return NextResponse.json(
      apiError(result.error, ErrorCode.BAD_REQUEST, 400),
      { status: 400, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess(result.booking), {
    headers: { "X-Request-ID": requestId },
  });
});

export const DELETE = withAuth(async (req, session, context) => {
  const requestId = generateRequestId();
  const { id } = await context!.params;

  const deleted = await softDeleteBooking(id, {
    userId: session.user.id,
    ipAddress: getClientIp(req),
  });

  if (!deleted) {
    return NextResponse.json(
      apiError("Booking not found", ErrorCode.NOT_FOUND, 404),
      { status: 404, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess({ deleted: true }), {
    headers: { "X-Request-ID": requestId },
  });
});
