import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { z } from "zod";
import { generateRequestId } from "@/lib/auth";

const ParamsSchema = z.object({ id: z.string() });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = ParamsSchema.parse(await params);

  try {
    const project = await db.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) {
      return NextResponse.json(
        apiError("Project not found", ErrorCode.NOT_FOUND, 404),
        { status: 404, headers: { "X-Request-ID": requestId } }
      );
    }

    return NextResponse.json(apiSuccess({ project }), {
      headers: { "X-Request-ID": requestId },
    });
  } catch (err) {
    console.error(`[${requestId}] Project GET error:`, err);
    return NextResponse.json(
      apiError("Something went wrong.", ErrorCode.INTERNAL_ERROR, 500),
      { status: 500, headers: { "X-Request-ID": requestId } }
    );
  }
}
