import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { listMessages } from "@/src/server/use-cases/admin/message-actions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }
  const includeRead = req.nextUrl.searchParams.get("all") === "true";
  const messages = await listMessages(includeRead);
  return NextResponse.json(apiSuccess({ messages, total: messages.length }));
}
