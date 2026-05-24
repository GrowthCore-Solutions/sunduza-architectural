import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/backend/lib/api-response";
import { notifyAdminNewBooking, notifyAdminNewContact } from "@/backend/lib/email";

const MAX_ATTEMPTS = 3;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const pending = await db.notification.findMany({
    where: { sentAt: null, failedAt: null },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  let sent = 0;
  let failed = 0;

  for (const row of pending) {
    const payload = row.payload as Record<string, unknown>;
    let result: { ok: true } | { ok: false; error: string };

    if (row.type === "BOOKING_NEW") {
      result = await notifyAdminNewBooking({
        name: String(payload.name ?? ""),
        email: String(payload.email ?? ""),
        service: String(payload.service ?? ""),
        leadScore:
          typeof payload.leadScore === "number" ? payload.leadScore : null,
      });
    } else if (row.type === "CONTACT_NEW") {
      result = await notifyAdminNewContact({
        name: String(payload.name ?? ""),
        email: String(payload.email ?? ""),
        message: String(payload.message ?? ""),
      });
    } else {
      result = { ok: false, error: `Unknown notification type: ${row.type}` };
    }

    if (result.ok) {
      await db.notification.update({
        where: { id: row.id },
        data: { sentAt: new Date() },
      });
      sent++;
    } else {
      const attempts =
        (typeof payload._attempts === "number" ? payload._attempts : 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await db.notification.update({
          where: { id: row.id },
          data: {
            failedAt: new Date(),
            error: result.error,
          },
        });
      } else {
        await db.notification.update({
          where: { id: row.id },
          data: {
            payload: { ...payload, _attempts: attempts },
            error: result.error,
          },
        });
      }
      failed++;
    }
  }

  return NextResponse.json(apiSuccess({ processed: pending.length, sent, failed }));
}
