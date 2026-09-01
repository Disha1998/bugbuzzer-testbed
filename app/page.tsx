"use client";

import {
  FAKE_KEYS,
  FAKE_SUPABASE_SERVICE_ROLE_JWT,
  jwt_secret,
  nextauth_secret,
} from "@/lib/fake-secrets";
import { Batch3RuntimeVulns } from "@/components/batch-3-runtime-vulns";

// ⚠️ INTENTIONAL — the fake keys below are rendered directly into JSX so they
// end up in BOTH the server-rendered HTML AND the client JS bundle. This is
// exactly the shape of a real leaked secret in a React app: a developer put a
// key in a component and it ships to every visitor's browser.
//
// All values are FAKE — see lib/fake-secrets.ts. No real service accepts them.
// Turbopack cannot tree-shake strings that are actually rendered to the DOM,
// so this pattern guarantees the fake keys reach BugBuzzer's bundle scanner.

const BATCH_1_KEYS: { row: number; label: string; value: string }[] = [
  { row: 1, label: "OpenAI API key (sk-proj-…)", value: FAKE_KEYS.openai },
  {
    row: 1,
    label: "Anthropic API key (sk-ant-api03-…)",
    value: FAKE_KEYS.anthropic,
  },
  { row: 2, label: "Stripe live secret (sk_live_…)", value: FAKE_KEYS.stripe_live },
  {
    row: 3,
    label: "Supabase service_role JWT",
    value: FAKE_SUPABASE_SERVICE_ROLE_JWT,
  },
  {
    row: 4,
    label: "AWS Access Key ID (AKIA…)",
    value: FAKE_KEYS.aws_key_id,
  },
  { row: 5, label: "Hardcoded jwt_secret", value: jwt_secret },
  { row: 5, label: "Hardcoded nextauth_secret", value: nextauth_secret },
  {
    row: 6,
    label: "GitHub Personal Access Token (ghp_…)",
    value: FAKE_KEYS.github,
  },
  { row: 7, label: "Resend API key (re_…)", value: FAKE_KEYS.resend },
  { row: 7, label: "SendGrid API key (SG.…)", value: FAKE_KEYS.sendgrid },
];

// Batch status semantics (matches docs/README.md legend):
//   Pending    - not deployed yet
//   Live       - deployed, waiting for first scan to confirm every row fires
//   Partial    - some rows verified by scan, some rows have known open fixes
//   Blocked    - deployed but scan cannot verify (external issue like scanner block)
//   Complete   - deployed AND scan verified every row fires correctly
//   Regression - was Complete, now some rows are failing
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Pending: { bg: "#eee", color: "#666" },
  Live: { bg: "#fff3cd", color: "#856404" },
  Partial: { bg: "#ffe4b5", color: "#7a4900" },
  Blocked: { bg: "#f8d7da", color: "#721c24" },
  Complete: { bg: "#dfd", color: "#060" },
  Regression: { bg: "#f5c6cb", color: "#491217" },
};

const BATCHES = [
  {
    id: "1",
    title: "Secrets in JS Bundle (core 7)",
    status: "Complete",
    statusHint: "7 of 7 verified in scan #4 (2026-08-24)",
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
    status: "Partial",
    statusHint: "7 of 9 verified in scan #5 · 2 open fixes (rows 3+4) in fixes-backlog",
    checks: [
      { num: 1, name: "Security headers missing (CSP, HSTS, X-Frame, X-Content-Type, Referrer, Permissions)" },
      { num: 2, name: "security.txt file missing" },
      { num: 3, name: "Mixed content (http:// resource on https:// page)" },
      { num: 4, name: "CORS misconfiguration — reflects Origin + allows credentials" },
      { num: 5, name: "Session cookie missing HttpOnly flag" },
      { num: 6, name: "Session cookie missing Secure flag" },
      { num: 7, name: "Session cookie missing SameSite attribute" },
      { num: 8, name: "Session token (JWT) with far-future expiry" },
      { num: 9, name: "Subresource Integrity (SRI) missing on CDN script" },
    ],
  },
  {
    id: "3",
    title: "JavaScript Runtime Errors",
    status: "Blocked",
    statusHint: "0 of 5 verifiable — Vercel bot protection blocks scanner (Fix A in backlog)",
    checks: [
      { num: 1, name: "JavaScript exception thrown on page load" },
      { num: 2, name: "New JS error since last scan (regression check)" },
      { num: 3, name: "Failed network request on page load (404)" },
      { num: 4, name: "React / Next.js hydration mismatch" },
      { num: 5, name: "Critical page blank or error (scan /broken separately)" },
    ],
  },
  {
    id: "4",
    title: "Public File Exposure",
    status: "Live",
    statusHint: "Just deployed, awaiting first scan · row 5 needs Vercel Protected Sourcemaps OFF",
    checks: [
      { num: 1, name: "Backup files exposed (.sql / .zip / .tar.gz)" },
      { num: 2, name: ".env file exposed at root (with fake DB/API secrets)" },
      { num: 3, name: "Config files exposed (config.json / settings.json)" },
      { num: 4, name: "docker-compose.yml exposed (with fake infra secrets)" },
      { num: 5, name: "Source maps (.js.map) accessible — needs Vercel 'Protected Sourcemaps' OFF" },
      { num: 6, name: ".git/ folder exposed (config, HEAD, index)" },
      { num: 7, name: ".svn/ folder exposed (entries, wc.db, format)" },
      { num: 8, name: "Directory listing enabled (fake 'Index of /' page at /downloads)" },
    ],
  },
  { id: "5", title: "Auth & Admin Panels", status: "Pending", checks: [] },
  { id: "6", title: "Injection Probes (SSTI, XSS, SQLi, eval)", status: "Pending", checks: [] },
  { id: "6b", title: "Extended Secrets (V6 bundle + AI + webhooks)", status: "Pending", checks: [] },
] as const;

export default function Home() {
  return (
    <main
      style={{
        padding: 40,
        fontFamily: "sans-serif",
        maxWidth: 900,
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
                background: (STATUS_STYLES[batch.status] ?? STATUS_STYLES.Pending).bg,
                color: (STATUS_STYLES[batch.status] ?? STATUS_STYLES.Pending).color,
              }}
            >
              {batch.status}
            </span>
          </h3>
          {"statusHint" in batch && batch.statusHint ? (
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#666" }}>
              {batch.statusHint}
            </p>
          ) : null}
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

      <h2>Batch 1 — fake keys (rendered directly, bundler cannot tree-shake)</h2>
      <p style={{ color: "#555" }}>
        Each row below renders the full fake key string into the DOM. This
        guarantees the string ends up in both the server-rendered HTML AND the
        client JavaScript bundle. That is what BugBuzzer&apos;s bundle-secret
        checks scan for.
      </p>
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #eee",
          padding: 16,
          borderRadius: 6,
          fontFamily: "monospace",
          fontSize: 12,
          overflowX: "auto",
        }}
      >
        {BATCH_1_KEYS.map((k, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ color: "#666", fontFamily: "sans-serif", fontSize: 13 }}>
              Row {k.row} — {k.label}
            </div>
            <code style={{ wordBreak: "break-all" }}>{k.value}</code>
          </div>
        ))}
      </div>

      {/* Also embed in an inline script for extra bundler coverage. This mimics
          how real apps sometimes leak secrets via inlined config blocks like
          window.__CONFIG__. */}
      <script
        id="testbed-batch-1-hints"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            BATCH_1_KEYS.reduce<Record<string, string>>((acc, k) => {
              acc[k.label] = k.value;
              return acc;
            }, {}),
          ),
        }}
      />

      {/* Plain-JS variable assignments so the hardcoded-jwt-secret-in-js-bundle
          check's regex fires (it requires `identifier = "..."` or
          `identifier: "..."` where the identifier name matches
          jwt_secret / nextauth_secret / signing_key / etc). */}
      <script
        id="testbed-batch-1-jwt-assigns"
        dangerouslySetInnerHTML={{
          __html: [
            `var jwt_secret = ${JSON.stringify(jwt_secret)};`,
            `var nextauth_secret = ${JSON.stringify(nextauth_secret)};`,
            `window.__testbedBatch1 = { jwt_secret: jwt_secret, nextauth_secret: nextauth_secret };`,
          ].join("\n"),
        }}
      />

      <hr style={{ margin: "32px 0" }} />

      <h2>How to verify</h2>
      <p style={{ color: "#555" }}>
        For each live batch, run a BugBuzzer scan against this URL and confirm
        every listed check fires. Findings are tracked in the batch MD files
        under <code>docs/batches/</code> in the repo.
      </p>

      {/* Row 24 — mixed content: HTTPS page loading an http:// image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="http://example.com/testbed-mixed-content.png"
        alt="mixed content test"
        width={1}
        height={1}
        style={{ position: "absolute", left: -9999, top: -9999 }}
      />

      {/* Batch 3 — runtime vulnerabilities (JS error, failed fetch, hydration mismatch). */}
      <Batch3RuntimeVulns />
    </main>
  );
}
