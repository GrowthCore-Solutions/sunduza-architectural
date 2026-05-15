import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { updateBookingStatus, InvalidStatusTransitionError } from "@/src/server/use-cases/admin/update-booking-status";
import { UpdateBookingStatusSchema } from "@/src/shared/schemas/booking.schema";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = UpdateBookingStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues.map((e) => e.message).join(". "), ErrorCode.VALIDATION_ERROR, 400),
      { status: 400 }
    );
  }

  try {
    const updated = await updateBookingStatus({
      bookingId: id,
      newStatus: parsed.data.status,
      adminNotes: parsed.data.adminNotes,
      adminUserId: session.user.id,
    });
    return NextResponse.json(apiSuccess(updated));
  } catch (err) {
    if (err instanceof InvalidStatusTransitionError) {
      return NextResponse.json(apiError(err.message, ErrorCode.CONFLICT, 409), { status: 409 });
    }
    if (err instanceof Error && err.message === "Booking not found") {
      return NextResponse.json(apiError("Booking not found", ErrorCode.NOT_FOUND, 404), { status: 404 });
    }
    throw err;
  }
}
