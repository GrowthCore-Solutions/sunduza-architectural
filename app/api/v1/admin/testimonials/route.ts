import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { listTestimonials, createTestimonial, TestimonialSchema } from "@/src/server/use-cases/admin/testimonial-crud";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }
  const testimonials = await listTestimonials();
  return NextResponse.json(apiSuccess({ testimonials, total: testimonials.length }));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = TestimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues.map((e) => e.message).join(". "), ErrorCode.VALIDATION_ERROR, 400),
      { status: 400 }
    );
  }
  const testimonial = await createTestimonial(parsed.data);
  return NextResponse.json(apiSuccess(testimonial), { status: 201 });
}
