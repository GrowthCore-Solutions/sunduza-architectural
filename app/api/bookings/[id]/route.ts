import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { auth } from "@/lib/auth";

const VALID_STATUSES = [
  "new",
  "contacted",
  "in_review",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      service: true,
      location: true,
      description: true,
      meetingDate: true,
      budget: true,
      status: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!booking) {
    return NextResponse.json(
      apiError("Booking not found", ErrorCode.NOT_FOUND, 404),
      { status: 404 }
    );
  }

  return NextResponse.json(apiSuccess(booking));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const { status, notes } = body;

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      apiError(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        ErrorCode.VALIDATION_ERROR,
        400
      ),
      { status: 400 }
    );
  }

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json(
      apiError("Booking not found", ErrorCode.NOT_FOUND, 404),
      { status: 404 }
    );
  }

  const updated = await db.booking.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
    },
  });

  return NextResponse.json(apiSuccess(updated));
}
