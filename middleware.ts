import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Sets deliberately insecure test cookies on every page response so BugBuzzer's
// session-cookie-missing-{http-only,secure,samesite} + session-token-insufficient-expiration
// checks fire. Values are fake — no real auth uses them.
//
// Rows tested by these cookies:
//   sessionid  → 53 (HttpOnly), 54 (Secure), 55 (SameSite)
//   authtoken  → session-token-insufficient-expiration (JWT exp = year 2100)

const FAKE_SESSION_ID = "tb27kQ8fpN9zXvBcYm4LjHrDsGeWqUiT";

// JWT decodes to: {"sub":"testbed-user","iat":1735689600,"exp":4102444800}
// exp is 2100-01-01 — meaninglessly far future = "insufficient expiration".
const FAKE_LONG_LIVED_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiJ0ZXN0YmVkLXVzZXIiLCJpYXQiOjE3MzU2ODk2MDAsImV4cCI6NDEwMjQ0NDgwMH0." +
  "kQ7pNv3wR9bZmY6xL2fJhU4nT8aC1sE5dV0yG7iOxRj";

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // Row 53/54/55 — session-shaped cookie missing HttpOnly + Secure + SameSite.
  response.headers.append("Set-Cookie", `sessionid=${FAKE_SESSION_ID}; Path=/`);

  // Session-token-insufficient-expiration — JWT-shaped auth cookie with exp far in future.
  response.headers.append("Set-Cookie", `authtoken=${FAKE_LONG_LIVED_JWT}; Path=/`);

  return response;
}

// Skip static assets and the /api/wide-cors route (that route sets its own headers).
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
