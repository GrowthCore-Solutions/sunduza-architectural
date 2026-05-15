import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { updateTestimonial, softDeleteTestimonial, TestimonialSchema } from "@/src/server/use-cases/admin/testimonial-crud";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = TestimonialSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues.map((e) => e.message).join(". "), ErrorCode.VALIDATION_ERROR, 400),
      { status: 400 }
    );
  }
  const testimonial = await updateTestimonial(id, parsed.data);
  return NextResponse.json(apiSuccess(testimonial));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }
  const { id } = await params;
  await softDeleteTestimonial(id);
  return NextResponse.json(apiSuccess({ deleted: true }));
}
