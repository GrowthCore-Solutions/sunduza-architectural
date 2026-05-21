import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { TestimonialUpdateSchema } from "@/types/testimonial";
import { updateTestimonial, softDeleteTestimonial } from "@/server/testimonials";
import { withAuth } from "@/lib/with-auth";
import { generateRequestId } from "@/lib/request";

export const PATCH = withAuth(async (req, session, context) => {
  const requestId = generateRequestId();
  const { id } = await context!.params;
  const body = await req.json();
  const parsed = TestimonialUpdateSchema.safeParse(body);

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

  const testimonial = await updateTestimonial(id, parsed.data, {
    userId: session.user.id,
  });

  if (!testimonial) {
    return NextResponse.json(
      apiError("Testimonial not found", ErrorCode.NOT_FOUND, 404),
      { status: 404, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess(testimonial), {
    headers: { "X-Request-ID": requestId },
  });
});

export const DELETE = withAuth(async (_req, session, context) => {
  const requestId = generateRequestId();
  const { id } = await context!.params;

  const deleted = await softDeleteTestimonial(id, { userId: session.user.id });
  if (!deleted) {
    return NextResponse.json(
      apiError("Testimonial not found", ErrorCode.NOT_FOUND, 404),
      { status: 404, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess({ deleted: true }), {
    headers: { "X-Request-ID": requestId },
  });
});
