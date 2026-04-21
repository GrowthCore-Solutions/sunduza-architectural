import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { z } from "zod";

const BookingStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["new", "contacted", "in_review", "confirmed", "completed", "cancelled"]),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const bookings = await db.booking.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json(apiSuccess({ bookings, total: bookings.length }));
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = BookingStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError(
        parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
        ErrorCode.VALIDATION_ERROR,
        400
      ),
      { status: 400 }
    );
  }

  const { id, status, notes } = parsed.data;

  const booking = await db.booking.update({
    where: { id },
    data: { status, ...(notes !== undefined && { notes }) },
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

  return NextResponse.json(apiSuccess(booking));
}
