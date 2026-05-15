import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, ErrorCode } from "@/lib/api-response";
import { getSettings, updateSetting } from "@/src/server/use-cases/settings/settings-crud";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json(apiSuccess({ settings }));
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401), { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ key: z.string().min(1), value: z.string() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError("key and value are required", ErrorCode.VALIDATION_ERROR, 400),
      { status: 400 }
    );
  }

  const setting = await updateSetting(parsed.data.key, parsed.data.value, session.user.id);
  return NextResponse.json(apiSuccess(setting));
}
