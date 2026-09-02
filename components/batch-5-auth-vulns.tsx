"use client";

import { useEffect } from "react";

// Batch 5 - client-side helpers that make BugBuzzer discover our Batch 5
// endpoints and vulnerabilities:
//   - Vulnerable OAuth link (no state param) for oauth-state-parameter-missing
//   - Visible links + on-load fetches so the scanner discovers login,
//     /api/users, /redirect, /graphql, /api/ai/chat, admin panels
export function Batch5AuthVulns() {
  useEffect(() => {
    // Fire and forget fetches so the scanner discovers these endpoints in
    // network traffic. Errors are intentional and safe to ignore.
    const paths = [
      "/api/users",
      "/api/graphql",
      "/api/ai/chat",
      "/api/login",
      "/redirect?url=https://example.com",
      "/admin",
      "/__debug__",
      "/storybook",
      "/langfuse",
      "/mlflow",
      "/redirect-home",
    ];
    paths.forEach((p) => {
      fetch(p, { method: "GET" }).catch(() => {});
    });
  }, []);

  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 6 }}>
      <h3>Batch 5 — Auth & Admin (intentional vulns)</h3>
      <p style={{ color: "#555" }}>
        Links below intentionally leak endpoints or expose auth weaknesses that
        BugBuzzer&apos;s Batch 5 checks scan for. All targets are fake.
      </p>

      {/* oauth-state-parameter-missing: OAuth link with no `state` param */}
      <p>
        <a
          href="https://github.com/login/oauth/authorize?client_id=Iv1.fake_testbed_client&redirect_uri=https%3A%2F%2Ftestbed.blockchainhq.xyz%2Foauth%2Fcallback&scope=user"
          rel="noopener noreferrer"
        >
          Login with GitHub (missing state param - vulnerable to CSRF)
        </a>
      </p>

      {/* open-redirect-vulnerability: scanner discovers ?url= redirect param */}
      <p>
        <a href="/redirect?url=https://example.com">
          Continue to external site (open redirect - accepts any ?url= value)
        </a>
      </p>

      {/* Admin panels + debug pages the scanner should probe */}
      <ul style={{ marginTop: 8 }}>
        <li><a href="/admin">Admin panel</a></li>
        <li><a href="/administrator">Administrator panel</a></li>
        <li><a href="/wp-admin">WordPress admin</a></li>
        <li><a href="/phpmyadmin">phpMyAdmin</a></li>
        <li><a href="/__debug__">Django debug page</a></li>
        <li><a href="/debug">Debug page</a></li>
        <li><a href="/storybook">Storybook (dev tool)</a></li>
        <li><a href="/langfuse">Langfuse (AI infra)</a></li>
        <li><a href="/mlflow">MLflow (AI infra)</a></li>
        <li><a href="/api/users">/api/users (unauth API)</a></li>
        <li><a href="/api/graphql">/api/graphql (introspection enabled)</a></li>
        <li><a href="/api/ai/chat">/api/ai/chat (unauth AI proxy)</a></li>
        <li><a href="/redirect-home">/redirect-home (host header reflection)</a></li>
      </ul>
    </section>
  );
}
