import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Batch 6 - two SQL injection checks on one endpoint:
//   1. error-based-sql-injection: returns fake SQL error when input has SQL syntax
//   2. time-based-blind-sql-injection: sleeps N seconds when input contains SLEEP/WAITFOR
// Detection is pattern-based - we don't actually run SQL. Fake responses look
// like real vulnerable app output.
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";

  const timeMatch = id.match(/SLEEP\s*\(\s*(\d+)\s*\)|WAITFOR\s+DELAY\s+['"]?0*:0*:0*(\d+)|pg_sleep\s*\(\s*(\d+)\s*\)/i);
  if (timeMatch) {
    const delay = Math.min(Number(timeMatch[1] ?? timeMatch[2] ?? timeMatch[3] ?? 3), 8);
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    return NextResponse.json({ user: null, note: "query completed" });
  }

  const errorTriggers = /['"]|--\s*$|\bUNION\s+SELECT\b|\bOR\s+1\s*=\s*1\b|\bAND\s+1\s*=\s*1\b|;\s*DROP\s+/i;
  if (errorTriggers.test(id)) {
    return NextResponse.json(
      {
        error: `You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '${id}' at line 1`,
        sqlstate: "42000",
        code: "ER_PARSE_ERROR",
        query: `SELECT * FROM users WHERE id = '${id}'`,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    user: {
      id,
      name: `Fake User ${id}`,
      email: `user${id}@fake-testbed.example`,
      role: "user",
    },
  });
}
