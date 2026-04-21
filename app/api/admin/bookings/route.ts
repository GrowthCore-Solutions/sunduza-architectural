import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { generateRequestId } from "@/lib/auth";
import { BookingListQuerySchema } from "@/types/booking";

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const session = await auth();

  // Auth check: admin session required
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401, headers: { "X-Request-ID": requestId } }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = BookingListQuerySchema.parse(Object.fromEntries(searchParams));

    const where = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      db.booking.count({ where }),
    ]);

    return NextResponse.json(
      apiSuccess({
        bookings,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }),
      { headers: { "X-Request-ID": requestId } }
    );
  } catch (err) {
    console.error(`[${requestId}] Admin bookings GET error:`, err);
    return NextResponse.json(
      apiError("Something went wrong.", ErrorCode.INTERNAL_ERROR, 500),
      { status: 500, headers: { "X-Request-ID": requestId } }
    );
  }
}
