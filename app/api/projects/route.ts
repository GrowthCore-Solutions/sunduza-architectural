import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ProjectCreateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  imagePath: z.string().min(1).max(255),
  category: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export async function GET(_req: NextRequest) {
  const projects = await db.project.findMany({
    orderBy: { sortOrder: "asc" },
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

  return NextResponse.json(
    apiSuccess({ projects, total: projects.length })
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
  const parsed = ProjectCreateSchema.safeParse(body);

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

  const project = await db.project.create({
    data: parsed.data,
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

  return NextResponse.json(apiSuccess(project), { status: 201 });
}
