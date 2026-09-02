"use client";

import { useEffect } from "react";

// Batch 6 - client-side helpers so BugBuzzer discovers our injection sinks.
// Each link includes a benign parameter value so the scanner extracts the
// parameter name and probes it with real attack payloads. On-load fetches
// mirror the same paths so params also appear in network traffic.
export function Batch6InjectionVulns() {
  useEffect(() => {
    const paths = [
      "/search?q=hello",
      "/render?tpl=Welcome",
      "/api/user?id=1",
      "/api/eval?expr=1%2B2",
      "/api/py?code=1%2B1",
      "/api/shell?cmd=id",
      "/api/ai/chat?model=gpt-4-fake",
      "/@vite/client",
      "/@fs/etc/passwd",
    ];
    paths.forEach((p) => {
      fetch(p, { method: "GET" }).catch(() => {});
    });
  }, []);

  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 6 }}>
      <h3>Batch 6 — Injection Probes (intentional vulns)</h3>
      <p style={{ color: "#555" }}>
        Each link exposes a URL parameter that BugBuzzer&apos;s injection
        checks probe. All &ldquo;execution&rdquo; is faked via pattern matching;
        no real eval, SQL, or shell exec runs on the server.
      </p>
      <ul style={{ marginTop: 8 }}>
        <li><a href="/search?q=hello">/search?q= (reflected XSS)</a></li>
        <li><a href="/render?tpl=Welcome">/render?tpl= (server-side template injection)</a></li>
        <li><a href="/api/user?id=1">/api/user?id= (SQL injection - error + time-based)</a></li>
        <li><a href="/api/eval?expr=1%2B2">/api/eval?expr= (Node.js eval)</a></li>
        <li><a href="/api/py?code=1%2B1">/api/py?code= (Python eval)</a></li>
        <li><a href="/api/shell?cmd=id">/api/shell?cmd= (OS command injection)</a></li>
        <li><a href="/api/ai/chat?model=gpt-4-fake">/api/ai/chat?model= (AI model param override + prompt injection)</a></li>
        <li><a href="/@vite/client">/@vite/client (Vite dev-server fingerprint)</a></li>
        <li><a href="/@fs/etc/passwd">/@fs/etc/passwd (Vite dev-server file read)</a></li>
      </ul>
    </section>
  );
}
