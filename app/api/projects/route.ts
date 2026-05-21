import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { ProjectCreateSchema } from "@/types/project";
import { createProject, getProjects } from "@/server/projects";
import { withAuth } from "@/lib/with-auth";
import { generateRequestId } from "@/lib/request";

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get("featured") === "true";

  const projects = await getProjects(featured);

  return NextResponse.json(apiSuccess({ projects, total: projects.length }), {
    headers: { "X-Request-ID": requestId },
  });
}

export const POST = withAuth(async (req, session) => {
  const requestId = generateRequestId();
  const body = await req.json();
  const parsed = ProjectCreateSchema.safeParse(body);

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

  const project = await createProject(parsed.data, { userId: session.user.id });

  return NextResponse.json(apiSuccess(project), {
    status: 201,
    headers: { "X-Request-ID": requestId },
  });
});
