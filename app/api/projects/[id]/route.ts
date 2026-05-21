import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { ProjectUpdateSchema } from "@/types/project";
import { getProjectById, updateProject, softDeleteProject } from "@/server/projects";
import { withAuth } from "@/lib/with-auth";
import { generateRequestId } from "@/lib/request";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;

  const project = await getProjectById(id);
  if (!project) {
    return NextResponse.json(
      apiError("Project not found", ErrorCode.NOT_FOUND, 404),
      { status: 404, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess({ project }), {
    headers: { "X-Request-ID": requestId },
  });
}

export const PATCH = withAuth(async (req, session, context) => {
  const requestId = generateRequestId();
  const { id } = await context!.params;
  const body = await req.json();
  const parsed = ProjectUpdateSchema.safeParse(body);

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

  const project = await updateProject(id, parsed.data, { userId: session.user.id });
  if (!project) {
    return NextResponse.json(
      apiError("Project not found", ErrorCode.NOT_FOUND, 404),
      { status: 404, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess(project), {
    headers: { "X-Request-ID": requestId },
  });
});

export const DELETE = withAuth(async (_req, session, context) => {
  const requestId = generateRequestId();
  const { id } = await context!.params;

  const deleted = await softDeleteProject(id, { userId: session.user.id });
  if (!deleted) {
    return NextResponse.json(
      apiError("Project not found", ErrorCode.NOT_FOUND, 404),
      { status: 404, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess({ deleted: true }), {
    headers: { "X-Request-ID": requestId },
  });
});
