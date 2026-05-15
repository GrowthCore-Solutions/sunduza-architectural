import "server-only";
import { BookingStatus } from "@prisma/client";
import { db } from "@/lib/db";

export interface GetBookingsOptions {
  status?: BookingStatus;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "date" | "score";
}

export async function getBookings(opts: GetBookingsOptions = {}) {
  const { status, search, page = 1, limit = 50, sort = "date" } = opts;

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { location: { contains: search, mode: "insensitive" as const } },
            { service: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      orderBy:
        sort === "score"
          ? { leadScore: "desc" }
          : { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
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
        utmSource: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.booking.count({ where }),
  ]);

  return { bookings, total, page, totalPages: Math.ceil(total / limit) };
}
