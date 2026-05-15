import "server-only";
import { BookingStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function getDashboardStats() {
  const [
    totalBookings,
    newBookings,
    contactedBookings,
    confirmedBookings,
    completedBookings,
    rejectedBookings,
    unreadMessages,
    totalProjects,
  ] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { status: BookingStatus.PENDING } }),
    db.booking.count({ where: { status: BookingStatus.CONTACTED } }),
    db.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
    db.booking.count({ where: { status: BookingStatus.COMPLETED } }),
    db.booking.count({ where: { status: BookingStatus.REJECTED } }),
    db.contactMessage.count({ where: { read: false } }),
    db.project.count(),
  ]);

  return {
    bookings: {
      total: totalBookings,
      pending: newBookings,
      contacted: contactedBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      rejected: rejectedBookings,
    },
    messages: { unread: unreadMessages },
    projects: { total: totalProjects },
  };
}
