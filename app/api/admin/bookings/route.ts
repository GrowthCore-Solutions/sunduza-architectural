import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError, apiList, ErrorCode } from "@/backend/lib/api-response";
import { BookingListQuerySchema, BookingUpdateSchema } from "@/shared/types/booking";
import { getAdminBookings, updateBookingStatus } from "@/backend/services/bookings";
import { withAuth } from "@/backend/lib/with-auth";
import { generateRequestId, getClientIp } from "@/backend/lib/request";

// Admin PATCH requires an explicit id — extend the shared schema to make it required.
const AdminBookingUpdateSchema = BookingUpdateSchema.extend({
  id: z.string().cuid("Invalid booking ID"),
});

export const GET = withAuth(async (req) => {
  const requestId = generateRequestId();
  const { searchParams } = new URL(req.url);
  const parsed = BookingListQuerySchema.safeParse(Object.fromEntries(searchParams));

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

  const result = await getAdminBookings(parsed.data);

  return NextResponse.json(
    apiList(result.bookings, result.total, result.page, parsed.data.limit),
    { headers: { "X-Request-ID": requestId } }
  );
});

export const PATCH = withAuth(async (req, session) => {
  const requestId = generateRequestId();
  const body = await req.json();
  const parsed = AdminBookingUpdateSchema.safeParse(body);

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
    parsed.data.id,
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
