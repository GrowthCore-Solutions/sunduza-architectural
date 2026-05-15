import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ProjectUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  imagePath: z.string().min(1).max(255).optional(),
  category: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      imagePath: true,
      category: true,
      sortOrder: true,
      isFeatured: true,
      createdAt: true,
    },
  });

  if (!project) {
    return NextResponse.json(
      apiError("Project not found", ErrorCode.NOT_FOUND, 404),
      { status: 404 }
    );
  }

  return NextResponse.json(apiSuccess({ project }));
}

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
  const parsed = ProjectUpdateSchema.safeParse(body);

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

  const project = await db.project.update({
    where: { id },
    data: parsed.data,
    select: {
      id: true,
      title: true,
      description: true,
      imagePath: true,
      category: true,
      sortOrder: true,
      isFeatured: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(apiSuccess(project));
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

  // Soft delete — never hard delete in production (S5.8)
  await db.project.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json(apiSuccess({ deleted: true }));
}
