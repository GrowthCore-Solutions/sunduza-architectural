import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { listProjects, createProject, ProjectSchema } from "@/src/server/use-cases/project/project-crud";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }
  const projects = await listProjects();
  return NextResponse.json(apiSuccess({ projects, total: projects.length }));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues.map((e) => e.message).join(". "), ErrorCode.VALIDATION_ERROR, 400),
      { status: 400 }
    );
  }

  const project = await createProject(parsed.data, session.user.id);
  return NextResponse.json(apiSuccess(project), { status: 201 });
}
