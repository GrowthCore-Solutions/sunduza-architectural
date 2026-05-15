import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { markMessageRead } from "@/src/server/use-cases/admin/message-actions";

export const dynamic = "force-dynamic";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }
  const { id } = await params;
  const message = await markMessageRead(id, session.user.id);
  return NextResponse.json(apiSuccess(message));
}
