import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Batch 5 - two vulns in one endpoint:
//   1. default-credentials-on-services: accepts admin/admin.
//   2. missing-rate-limiting-on-login: no rate limit, no 429.
// Accepts form-encoded (from admin panel form) and JSON (from AJAX callers).
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let username = "";
  let password = "";

  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      username = String(body?.username ?? body?.pma_username ?? "");
      password = String(body?.password ?? body?.pma_password ?? "");
    } catch {
      // ignore parse errors
    }
  } else {
    const form = await request.formData();
    username = String(form.get("username") ?? form.get("pma_username") ?? "");
    password = String(form.get("password") ?? form.get("pma_password") ?? "");
  }

  const validPairs = [
    ["admin", "admin"],
    ["admin", "password"],
    ["root", "root"],
    ["administrator", "administrator"],
  ];
  const ok = validPairs.some(([u, p]) => u === username && p === password);

  if (ok) {
    return NextResponse.json(
      { success: true, message: "Login successful", user: username, role: "admin" },
      { status: 200 },
    );
  }
  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
}
