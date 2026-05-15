import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { getBookings } from "@/src/server/use-cases/admin/get-bookings";
import { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as BookingStatus | null;
  const search = searchParams.get("search") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const sort = (searchParams.get("sort") ?? "date") as "date" | "score";

  const result = await getBookings({ status: status ?? undefined, search, page, sort });
  return NextResponse.json(
    apiSuccess({ bookings: result.bookings, total: result.total, page: result.page, totalPages: result.totalPages })
  );
}
