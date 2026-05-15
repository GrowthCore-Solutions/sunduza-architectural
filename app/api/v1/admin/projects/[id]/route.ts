import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { updateProject, softDeleteProject, ProjectSchema } from "@/src/server/use-cases/project/project-crud";

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
  const parsed = ProjectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues.map((e) => e.message).join(". "), ErrorCode.VALIDATION_ERROR, 400),
      { status: 400 }
    );
  }
  const project = await updateProject(id, parsed.data, session.user.id);
  return NextResponse.json(apiSuccess(project));
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
  await softDeleteProject(id, session.user.id);
  return NextResponse.json(apiSuccess({ deleted: true }));
}
