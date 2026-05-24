import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/backend/lib/api-response";
import { TestimonialCreateSchema } from "@/shared/types/testimonial";
import { auth } from "@/backend/lib/auth";
import { createTestimonial, getTestimonials, getAllTestimonials } from "@/backend/services/testimonials";
import { withAuth, WRITE_ROLES } from "@/backend/lib/with-auth";
import { generateRequestId } from "@/backend/lib/request";

export async function GET() {
  const requestId = generateRequestId();
  const session = await auth();
  const testimonials = session?.user
    ? await getAllTestimonials()
    : await getTestimonials();

  return NextResponse.json(apiSuccess({ testimonials, total: testimonials.length }), {
    headers: { "X-Request-ID": requestId },
  });
}

export const POST = withAuth(async (req, session) => {
  const requestId = generateRequestId();
  const body = await req.json();
  const parsed = TestimonialCreateSchema.safeParse(body);

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

  const testimonial = await createTestimonial(parsed.data, { userId: session.user.id });

  return NextResponse.json(apiSuccess(testimonial), {
    status: 201,
    headers: { "X-Request-ID": requestId },
  });
}, { requireRole: WRITE_ROLES });
