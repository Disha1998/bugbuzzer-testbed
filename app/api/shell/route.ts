import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Batch 6 - os-command-injection. Simulates a shell exec sink by matching
// common shell injection payloads and returning realistic command output.
// Also supports time-based blind via `sleep N` in the command.
function fakeShellExec(cmd: string): { output: string; delaySeconds: number } {
  const cleaned = cmd.replace(/^[;&|`$()\s]+/, "").trim();

  const sleepMatch = cmd.match(/\bsleep\s+(\d+)/i);
  if (sleepMatch) {
    return { output: "", delaySeconds: Math.min(Number(sleepMatch[1]), 8) };
  }

  if (/^id\b/.test(cleaned)) {
    return { output: "uid=1000(user) gid=1000(user) groups=1000(user)", delaySeconds: 0 };
  }
  if (/^whoami\b/i.test(cleaned)) {
    return { output: "user", delaySeconds: 0 };
  }
  if (/^uname/i.test(cleaned)) {
    return { output: "Linux fake-testbed 6.8.0-137-generic x86_64 GNU/Linux", delaySeconds: 0 };
  }
  if (/^ls\b/i.test(cleaned)) {
    return { output: "app.js\nbin\nboot\ndev\netc\nhome\nlib\nusr\nvar", delaySeconds: 0 };
  }
  if (/cat\s+\/etc\/passwd/i.test(cmd)) {
    return {
      output: "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000::/home/user:/bin/bash",
      delaySeconds: 0,
    };
  }
  if (/echo\s+/i.test(cleaned)) {
    const echoMatch = cleaned.match(/echo\s+(.+)/i);
    return { output: echoMatch ? echoMatch[1] : "", delaySeconds: 0 };
  }

  return { output: "", delaySeconds: 0 };
}

export async function GET(request: NextRequest) {
  const cmd = request.nextUrl.searchParams.get("cmd") ?? "";
  const { output, delaySeconds } = fakeShellExec(cmd);
  if (delaySeconds > 0) {
    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
  }
  return NextResponse.json({ command: cmd, output });
}
