import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, apiList, ErrorCode } from "@/lib/api-response";
import { BookingListQuerySchema, BookingUpdateSchema } from "@/types/booking";
import { getAdminBookings, updateBookingStatus } from "@/server/bookings";
import { withAuth } from "@/lib/with-auth";
import { generateRequestId, getClientIp } from "@/lib/request";

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

  const id = parsed.data.id ?? (body as { id?: string }).id;
  if (!id) {
    return NextResponse.json(
      apiError("Booking id is required", ErrorCode.VALIDATION_ERROR, 400),
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
