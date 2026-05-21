import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { getContactMessages, markMessageRead } from "@/server/contact";
import { withAuth } from "@/lib/with-auth";
import { generateRequestId } from "@/lib/request";
import { z } from "zod";

const MarkReadSchema = z.object({
  id: z.string().cuid(),
  read: z.literal(true),
});

export const GET = withAuth(async (req) => {
  const requestId = generateRequestId();
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const messages = await getContactMessages(unreadOnly);

  return NextResponse.json(apiSuccess(messages), {
    headers: { "X-Request-ID": requestId },
  });
});

export const PATCH = withAuth(async (req, session) => {
  const requestId = generateRequestId();
  const body = await req.json();
  const parsed = MarkReadSchema.safeParse(body);

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

  const updated = await markMessageRead(parsed.data.id, { userId: session.user.id });
  if (!updated) {
    return NextResponse.json(
      apiError("Message not found", ErrorCode.NOT_FOUND, 404),
      { status: 404, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess(updated), {
    headers: { "X-Request-ID": requestId },
  });
});
