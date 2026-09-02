import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Batch 5 - open-redirect vuln. GET /redirect?url=<any-url> redirects there
// with no allowlist check. Attacker sends victim: /redirect?url=evil.com.
export function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  if (!target) {
    return new NextResponse("Missing ?url= parameter", { status: 400 });
  }
  return NextResponse.redirect(target, 302);
}
