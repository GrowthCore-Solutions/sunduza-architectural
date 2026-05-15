import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { z } from "zod";

const TestimonialCreateSchema = z.object({
  clientName: z.string().min(1).max(100),
  review: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
  projectId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export async function GET(_req: NextRequest) {
  const testimonials = await db.testimonial.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      clientName: true,
      review: true,
      rating: true,
      projectId: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    apiSuccess({ testimonials, total: testimonials.length })
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = TestimonialCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      apiError(
        parsed.error.issues.map((e) => e.message).join(", "),
        ErrorCode.VALIDATION_ERROR,
        400
      ),
      { status: 400 }
    );
  }

  const testimonial = await db.testimonial.create({
    data: parsed.data,
    select: {
      id: true,
      clientName: true,
      review: true,
      rating: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(apiSuccess(testimonial), { status: 201 });
}
