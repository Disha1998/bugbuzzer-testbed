import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Batch 6 - python-eval-code-injection. Simulates a Python eval()/exec() sink.
// We're a Node app, but for the testbed we fake Python behavior by matching
// common Python injection payloads and returning realistic Python output.
function fakePyEval(code: string): string | null {
  if (/__import__\s*\(\s*['"]os['"]\s*\)\s*\.\s*popen\s*\(\s*['"]id['"]\s*\)\s*\.\s*read/.test(code)) {
    return "uid=1000(user) gid=1000(user) groups=1000(user)\n";
  }
  if (/__import__\s*\(\s*['"]os['"]\s*\)\s*\.\s*getcwd/.test(code)) {
    return "/home/user\n";
  }
  if (/__import__\s*\(\s*['"]os['"]\s*\)\s*\.\s*system/.test(code)) {
    return "0";
  }
  if (/__import__\s*\(\s*['"]subprocess['"]\s*\)/.test(code)) {
    return "uid=1000(user) gid=1000(user)\n";
  }
  // Simple math like eval("7*7")
  const math = code.match(/^\s*(-?\d+)\s*([+\-*/])\s*(-?\d+)\s*$/);
  if (math) {
    const a = Number(math[1]);
    const b = Number(math[3]);
    if (math[2] === "+") return String(a + b);
    if (math[2] === "-") return String(a - b);
    if (math[2] === "*") return String(a * b);
    if (math[2] === "/") return b === 0 ? "0" : String(a / b);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const result = fakePyEval(code);
  if (result === null) {
    return NextResponse.json({ input: code, error: "eval failed" }, { status: 400 });
  }
  return NextResponse.json({ input: code, result });
}
