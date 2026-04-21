import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { z } from "zod";
import { generateRequestId, checkRateLimit } from "@/lib/auth";

const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const ip = req.headers.get("x-forwarded-for") ?? "default";

  if (!checkRateLimit(`contact:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      apiError("Too many requests. Please try again later.", ErrorCode.RATE_LIMITED, 429),
      { status: 429, headers: { "X-Request-ID": requestId } }
    );
  }

  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError(parsed.error.issues.map((e: { message: string }) => e.message).join(", "), ErrorCode.VALIDATION_ERROR, 400),
        { status: 400, headers: { "X-Request-ID": requestId } }
      );
    }

    const msg = await db.contactMessage.create({ data: parsed.data });
    return NextResponse.json(apiSuccess({ messageId: msg.id }), {
      status: 201,
      headers: { "X-Request-ID": requestId },
    });
  } catch (err) {
    console.error(`[${requestId}] Contact POST error:`, err);
    return NextResponse.json(
      apiError("Something went wrong.", ErrorCode.INTERNAL_ERROR, 500),
      { status: 500, headers: { "X-Request-ID": requestId } }
    );
  }
}
