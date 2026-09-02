import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Batch 6 - nodejs-eval-code-injection. Simulates an eval() sink by
// pattern-matching simple math and returning the computed result. Scanner
// sends `?expr=7*7`, we return `49` -> proves eval-like behavior.
// NOTE: we do NOT actually eval user input - we pattern-match safe subsets.
function fakeEval(expr: string): number | string | null {
  const simple = expr.match(/^\s*(-?\d+)\s*([+\-*/])\s*(-?\d+)\s*$/);
  if (simple) {
    const a = Number(simple[1]);
    const b = Number(simple[3]);
    if (simple[2] === "+") return a + b;
    if (simple[2] === "-") return a - b;
    if (simple[2] === "*") return a * b;
    if (simple[2] === "/") return b === 0 ? 0 : a / b;
  }
  const pow = expr.match(/^\s*Math\.pow\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)\s*$/);
  if (pow) return Math.pow(Number(pow[1]), Number(pow[2]));
  // Detect require() or process access - fake environment leak
  if (/require\s*\(\s*['"]child_process['"]\s*\)|process\.env|process\.mainModule/.test(expr)) {
    return "uid=1000(user) gid=1000(user) groups=1000(user)";
  }
  return null;
}

export async function GET(request: NextRequest) {
  const expr = request.nextUrl.searchParams.get("expr") ?? "";
  const result = fakeEval(expr);
  if (result === null) {
    return NextResponse.json({ input: expr, error: "eval failed" }, { status: 400 });
  }
  return NextResponse.json({ input: expr, result });
}
