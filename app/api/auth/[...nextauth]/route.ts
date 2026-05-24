import { NextRequest } from "next/server";
import { handlers } from "@/backend/lib/auth";

/**
 * Cursor / reverse-proxy previews hit Next.js as localhost but the browser
 * origin is the public host. Rewrite the request URL from forwarded headers
 * so Auth.js sets CSRF/session cookies for the origin the browser actually uses.
 */
function withPublicOrigin(req: NextRequest): NextRequest {
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (!forwardedHost) return req;

  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  const protocol = forwardedProto.endsWith(":")
    ? forwardedProto
    : `${forwardedProto}:`;

  const publicUrl = new URL(
    `${req.nextUrl.pathname}${req.nextUrl.search}`,
    `${protocol}//${forwardedHost}`
  );

  return new NextRequest(publicUrl, req);
}

async function runAuth(
  method: "GET" | "POST",
  req: NextRequest
): Promise<Response> {
  const rewritten = withPublicOrigin(req);
  const isProxiedPreview = rewritten.headers.has("x-forwarded-host");

  const savedNextAuthUrl = process.env.NEXTAUTH_URL;
  const savedAuthUrl = process.env.AUTH_URL;

  if (isProxiedPreview) {
    delete process.env.NEXTAUTH_URL;
    delete process.env.AUTH_URL;
  }

  try {
    return await handlers[method](rewritten);
  } finally {
    if (isProxiedPreview) {
      if (savedNextAuthUrl !== undefined) {
        process.env.NEXTAUTH_URL = savedNextAuthUrl;
      } else {
        delete process.env.NEXTAUTH_URL;
      }
      if (savedAuthUrl !== undefined) {
        process.env.AUTH_URL = savedAuthUrl;
      } else {
        delete process.env.AUTH_URL;
      }
    }
  }
}

export function GET(req: NextRequest) {
  return runAuth("GET", req);
}

export function POST(req: NextRequest) {
  return runAuth("POST", req);
}
