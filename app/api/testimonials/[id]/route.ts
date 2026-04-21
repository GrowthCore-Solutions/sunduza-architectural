import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { z } from "zod";

const TestimonialUpdateSchema = z.object({
  clientName: z.string().min(1).max(200).optional(),
  review: z.string().min(1).max(1000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  featured: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = TestimonialUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError(
        parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
        ErrorCode.VALIDATION_ERROR,
        400
      ),
      { status: 400 }
    );
  }

  const testimonial = await db.testimonial.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(apiSuccess(testimonial));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const { id } = await params;
  await db.testimonial.delete({ where: { id } });
  return NextResponse.json(apiSuccess({ deleted: true }));
}
