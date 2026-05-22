import { NextResponse } from "next/server";
import { apiSuccess, apiError, ErrorCode } from "@/backend/lib/api-response";
import { getSettings, updateSetting } from "@/backend/services/settings";
import { withAuth } from "@/backend/lib/with-auth";
import { generateRequestId } from "@/backend/lib/request";
import { z } from "zod";

const SettingUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export const GET = withAuth(async () => {
  const requestId = generateRequestId();
  const settings = await getSettings();

  return NextResponse.json(apiSuccess(settings), {
    headers: { "X-Request-ID": requestId },
  });
});

export const PATCH = withAuth(async (req, session) => {
  const requestId = generateRequestId();
  const body = await req.json();
  const parsed = SettingUpdateSchema.safeParse(body);

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

  const updated = await updateSetting(parsed.data.key, parsed.data.value, {
    userId: session.user.id,
  });

  if (!updated) {
    return NextResponse.json(
      apiError("Setting not found", ErrorCode.NOT_FOUND, 404),
      { status: 404, headers: { "X-Request-ID": requestId } }
    );
  }

  return NextResponse.json(apiSuccess(updated), {
    headers: { "X-Request-ID": requestId },
  });
});
