import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { generateRequestId } from "@/lib/auth";

export async function GET() {
  const requestId = generateRequestId();
  try {
    const testimonials = await db.testimonial.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(apiSuccess({ testimonials }), {
      headers: { "X-Request-ID": requestId },
    });
  } catch (err) {
    console.error(`[${requestId}] Testimonials GET error:`, err);
    return NextResponse.json(
      apiError("Something went wrong.", ErrorCode.INTERNAL_ERROR, 500),
      { status: 500, headers: { "X-Request-ID": requestId } }
    );
  }
}
