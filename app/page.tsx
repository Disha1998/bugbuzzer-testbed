"use client";

import { FAKE_KEYS, FAKE_SUPABASE_SERVICE_ROLE_JWT } from "@/lib/fake-secrets";

// ⚠️ INTENTIONAL — importing and referencing fake secrets forces Next.js to
// bundle them into the client-side JavaScript. This is exactly what BugBuzzer
// scans for. Real developers who make this mistake ship secrets to every
// visitor's browser.
//
// All values are FAKE — see lib/fake-secrets.ts. No real service accepts them.

const BUNDLE_HINTS = {
  openai: FAKE_KEYS.openai,
  anthropic: FAKE_KEYS.anthropic,
  stripe: FAKE_KEYS.stripe_live,
  aws: FAKE_KEYS.aws_key_id,
  jwt: FAKE_KEYS.jwt_secret,
  github: FAKE_KEYS.github,
  resend: FAKE_KEYS.resend,
  sendgrid: FAKE_KEYS.sendgrid,
  supabase: FAKE_SUPABASE_SERVICE_ROLE_JWT,
};

export default function Home() {
  // Log the first few chars of each fake key so the bundler cannot tree-shake
  // the import away. In real leaks, secrets are used somewhere in the code —
  // that use is what keeps them in the bundle.
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug(
      "testbed-fake-secret-prefixes:",
      Object.fromEntries(
        Object.entries(BUNDLE_HINTS).map(([k, v]) => [k, v.slice(0, 8)]),
      ),
    );
  }

  return (
    <main
      style={{
        padding: 40,
        fontFamily: "sans-serif",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: "red" }}>⚠️ INTENTIONALLY VULNERABLE TESTBED</h1>
      <p>
        This site contains fake vulnerabilities to test the BugBuzzer scanner.
      </p>
      <p>
        All secrets, keys, and endpoints here are placeholders — <strong>NOT
        real</strong>. No real service will accept these values.
      </p>
      <p>Do not use this app in production. Do not enter real data.</p>

      <hr style={{ margin: "24px 0" }} />

      <h2>Batch 1 — Secrets in JS Bundle (7 fake keys)</h2>
      <p style={{ color: "#555" }}>
        Fake keys are imported from{" "}
        <code>lib/fake-secrets.ts</code> and bundled into this page&apos;s
        client JavaScript. Open DevTools → Sources → find the compiled
        <code> _next/static/chunks/...</code> file — you will see the fake
        prefixes there. That is what BugBuzzer&apos;s bundle-secret checks
        detect.
      </p>
      <ul style={{ color: "#555" }}>
        <li>OpenAI / Anthropic (sk-proj-… / sk-ant-…)</li>
        <li>Stripe (sk_live_…)</li>
        <li>Supabase service_role JWT</li>
        <li>AWS Access Key ID (AKIA…)</li>
        <li>Hardcoded JWT signing secret</li>
        <li>GitHub Personal Access Token (ghp_…)</li>
        <li>Resend (re_…) and SendGrid (SG.…)</li>
      </ul>
    </main>
  );
}
