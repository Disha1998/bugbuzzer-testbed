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

// Batch registry — mirrors docs/README.md so anyone landing on the site can
// see progress. When a batch is deployed, flip status to "Live" and add the
// check rows below.
const BATCHES = [
  {
    id: "1",
    title: "Secrets in JS Bundle (core 7)",
    status: "Live",
    checks: [
      { num: 1, name: "OpenAI / Anthropic API key exposed in JS bundle" },
      { num: 2, name: "Stripe secret key in JS bundle" },
      { num: 3, name: "Supabase service_role key in JS bundle" },
      { num: 4, name: "AWS / GCP / Azure credentials in JS bundle" },
      { num: 5, name: "Hardcoded JWT secret in JS bundle" },
      { num: 6, name: "GitHub / GitLab token in JS bundle" },
      { num: 7, name: "Resend / SendGrid email API key in JS bundle" },
    ],
  },
  {
    id: "2",
    title: "Web Hygiene — headers, cookies, SSL, SRI",
    status: "Pending",
    checks: [],
  },
  {
    id: "3",
    title: "JavaScript Runtime Errors",
    status: "Pending",
    checks: [],
  },
  {
    id: "4",
    title: "Public File Exposure",
    status: "Pending",
    checks: [],
  },
  {
    id: "5",
    title: "Auth & Admin Panels",
    status: "Pending",
    checks: [],
  },
  {
    id: "6",
    title: "Injection Probes (SSTI, XSS, SQLi, eval)",
    status: "Pending",
    checks: [],
  },
  {
    id: "6b",
    title: "Extended Secrets (V6 bundle + AI + webhooks)",
    status: "Pending",
    checks: [],
  },
] as const;

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
        maxWidth: 860,
        margin: "0 auto",
        lineHeight: 1.5,
      }}
    >
      <h1 style={{ color: "#c00" }}>⚠️ BugBuzzer Testbed</h1>
      <p>
        <strong style={{ color: "#c00" }}>
          This site contains intentional vulnerabilities.
        </strong>{" "}
        Every &ldquo;secret&rdquo;, &ldquo;key&rdquo;, and endpoint here is a
        placeholder — NOT real. No real service will accept these values.
      </p>
      <p>Do not use this app in production. Do not enter real data.</p>

      <hr style={{ margin: "24px 0" }} />

      <h2>Batches</h2>
      <p style={{ color: "#555" }}>
        Progress through the master sheet&apos;s check catalog, one small batch
        at a time. Each batch bakes in a set of intentional vulnerabilities so
        BugBuzzer can scan for them.
      </p>

      {BATCHES.map((batch) => (
        <section
          key={batch.id}
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 6,
          }}
        >
          <h3 style={{ margin: 0 }}>
            Batch {batch.id} — {batch.title}{" "}
            <span
              style={{
                fontSize: 14,
                marginLeft: 8,
                padding: "2px 8px",
                borderRadius: 4,
                background: batch.status === "Live" ? "#dfd" : "#eee",
                color: batch.status === "Live" ? "#060" : "#666",
              }}
            >
              {batch.status}
            </span>
          </h3>
          {batch.checks.length > 0 ? (
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              {batch.checks.map((c) => (
                <li key={c.num}>
                  <strong>#{c.num}</strong> — {c.name}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "#999", margin: "8px 0 0 0" }}>
              Not yet deployed.
            </p>
          )}
        </section>
      ))}

      <hr style={{ margin: "32px 0" }} />

      <h2>How to verify</h2>
      <p style={{ color: "#555" }}>
        For each live batch, run a BugBuzzer scan against this URL and confirm
        every listed check fires. Findings are tracked in the batch MD files
        under <code>docs/batches/</code> in the repo.
      </p>
    </main>
  );
}
