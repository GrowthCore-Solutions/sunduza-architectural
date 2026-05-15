import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { BookingStatus } from "@prisma/client";
import { z } from "zod";

const BookingUpdateSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(BookingStatus),
  adminNotes: z.string().optional(),
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
  const statusParam = searchParams.get("status") as BookingStatus | null;

  const bookings = await db.booking.findMany({
    where: statusParam ? { status: statusParam } : undefined,
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
      leadScore: true,
      adminNotes: true,
      consentGiven: true,
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
  const parsed = BookingUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError(
        parsed.error.issues.map((e) => e.message).join(", "),
        ErrorCode.VALIDATION_ERROR,
        400
      ),
      { status: 400 }
    );
  }

  const { id, status, adminNotes } = parsed.data;

  const booking = await db.booking.update({
    where: { id },
    data: {
      status,
      ...(adminNotes !== undefined && { adminNotes }),
    },
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
      leadScore: true,
      adminNotes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(apiSuccess(booking));
}
