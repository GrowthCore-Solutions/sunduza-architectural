import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ProjectCreateSchema = z.object({
  title: z.string().min(1).max(200),
  shortDescription: z.string().min(1).max(500),
  imageUrl: z.string().min(1).max(500),
  category: z.enum([
    "House Plan",
    "Architectural Drawing",
    "Drafting Services",
    "Development Projects",
  ]),
  featured: z.boolean().optional().default(false),
});

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

  const project = await db.project.create({ data: parsed.data });
  return NextResponse.json(apiSuccess(project), { status: 201 });
}
