import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const messages = await db.contactMessage.findMany({
    where: unreadOnly ? { read: false } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(apiSuccess(messages));
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401),
      { status: 401 }
    );
  }

  const body = await req.json();
  const { id, read } = body;

  if (typeof read !== "boolean" || !id) {
    return NextResponse.json(
      apiError("Invalid request", ErrorCode.VALIDATION_ERROR, 400),
      { status: 400 }
    );
  }

  const updated = await db.contactMessage.update({
    where: { id },
    data: { read },
  });

  return NextResponse.json(apiSuccess(updated));
}
