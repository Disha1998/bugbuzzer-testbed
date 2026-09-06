# Batch 1 — Fake secrets & API keys in the JavaScript bundle

## 📋 Where we are — 2026-08-24

**Is this batch done? YES ✅**
- **All 7 checks are working (100%)**
- **Nothing open**

Last scan: `BB-20260824-5B681D` (2026-08-24). Scanner found 18 findings across all 7 checks. Full breakdown in [scan-issues/2026-08-24-scan-04.md](../scan-issues/2026-08-24-scan-04.md).

---

- **Category:** Secrets & API keys leaked in the JavaScript bundle
- **Rows on the master sheet:** 1, 2, 3, 4, 5, 6, 7
- **Checks tested:** 7
- **Deployed on:** 2026-08-21
- **Status:** ✅ **DONE.** All 7 checks fire on scan #4. 18 findings total (scanner found each key in both the external JS chunk and the inline script). Zero misses. Zero false alarms. Ready to move on.

---

## What this batch tests

BugBuzzer looks inside a website's JavaScript files for API keys and secrets. Developers sometimes paste keys directly into their code by mistake. Those keys end up in the JavaScript that ships to every visitor's browser. Anyone can open DevTools and find them.

This batch puts 7 fake keys on our page — one for each check in the master sheet.

---

## The fake keys we planted

All fake keys live in [`lib/fake-secrets.ts`](../../lib/fake-secrets.ts). The file is imported into our page code, so the keys end up in the JavaScript bundle that ships to browsers.

| # | Row | Check name | Fake key type | Where |
|---|---|---|---|---|
| 1 | 1 | OpenAI / Anthropic API key in JS bundle | `sk-proj-...` and `sk-ant-api03-...` | `lib/fake-secrets.ts` |
| 2 | 2 | Stripe secret key in JS bundle | `sk_live_...` | `lib/fake-secrets.ts` |
| 3 | 3 | Supabase service_role key in JS bundle | JWT with `role: service_role` | `lib/fake-secrets.ts` |
| 4 | 4 | AWS / GCP / Azure credentials in JS bundle | `AKIA...` (AWS Access Key ID) | `lib/fake-secrets.ts` |
| 5 | 5 | Hardcoded JWT signing secret in JS bundle | 60+ random characters | `lib/fake-secrets.ts` |
| 6 | 6 | GitHub / GitLab token in JS bundle | `ghp_...` (GitHub personal access token) | `lib/fake-secrets.ts` |
| 7 | 7 | Resend / SendGrid email API key in JS bundle | `re_...` and `SG.xxx.yyy` | `lib/fake-secrets.ts` |

⚠️ **All keys are fake.** They have the right prefix so the scanner recognizes the format, but the rest is random garbage. No real service will accept them.

---

## What we expect the scanner to find

When you run BugBuzzer against `https://testbed.blockchainhq.xyz`, you should see 7 findings (one per fake key type).

| Check # | What should fire | Severity |
|---|---|---|
| 1 | 1 OpenAI + 1 Anthropic key exposed | Critical |
| 2 | 1 Stripe live secret key exposed | Critical |
| 3 | 1 Supabase service_role JWT exposed | Critical |
| 4 | 1 AWS Access Key ID exposed | Critical |
| 5 | 1 hardcoded JWT signing secret exposed | Critical |
| 6 | 1 GitHub personal access token exposed | Critical |
| 7 | 1 Resend key + 1 SendGrid key exposed | High |

If any of these 7 doesn't fire, that's a miss — look at the check code.
If a check fires with the wrong severity or the wrong value, that's a false alarm — tighten the check.

---

## What to tell real users (fix guidance)

If BugBuzzer finds any of these leaks in a real user's site, show them this in the report.

### The problem

An API key or secret is in the JavaScript that anyone visiting the site can see. All you have to do is open DevTools, hit "view source," and copy the key. Then you can:

- Run up big bills on their account (OpenAI, Anthropic, Stripe, AWS)
- Send spam or phishing emails from their domain (Resend, SendGrid)
- Read their private code (GitHub)
- Read and change their entire database (Supabase service_role)
- Fake login tokens (JWT secret)

### The fix

**Never put backend secrets in frontend code.** Instead:

1. Put the secret in a backend environment variable
2. Make a backend API route that uses the secret
3. Call the backend route from your frontend

**Wrong — secret in frontend:**
```typescript
// pages/index.tsx — DON'T DO THIS
const openai = new OpenAI({ apiKey: "sk-proj-abc123..." });
```

**Right — secret on backend:**
```typescript
// pages/api/chat.ts — backend API route
export default async function handler(req, res) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // ... use openai to answer the request ...
}

// frontend just calls the API route — never sees the key
fetch("/api/chat", { method: "POST", body: JSON.stringify({ ... }) });
```

### If your real key already leaked

1. **Rotate the key right now** in the provider dashboard (OpenAI, Stripe, GitHub, etc. all have a "roll" or "regenerate" button)
2. Check the provider's billing / usage page for anything you didn't do
3. Put the new key in a backend environment variable
4. Deploy — check that the old key is no longer in your JavaScript
5. If the bill was abused, contact the provider's support and ask for a refund

### How to stop it happening again

- Only use `NEXT_PUBLIC_` (Next.js) or `VITE_` (Vite) prefixes for things that are safe to be public (like Stripe publishable keys or Supabase anon keys)
- Add secret scanning to your CI pipeline (GitGuardian, TruffleHog, gitleaks)
- Add a pre-commit hook that blocks known secret patterns
- Look for hardcoded credentials in pull requests before merging

---

## Actual scan results (in order they happened)

### Scan #4 — 2026-08-24 04:36 (`BB-20260824-5B681D`) ✅ ALL 7 FIRED

**Setup:** Testbed was pushed with fresh random fake keys (older values had the word "FakeTestbed" in them, which the scanner filtered out — see scan #3 below). Vercel redeployed. Scanner was healthy.

| Row | Check | Findings | Where |
|---|---|---|---|
| 1 | openai-anthropic | 4 (2 OpenAI + 2 Anthropic) | main JS chunk + inline script |
| 2 | stripe-secret | 2 | main JS chunk + inline script |
| 3 | supabase-service-role | 2 | main JS chunk + inline script (JWT decoded correctly: role=service_role, iss=supabase) |
| 4 | aws-gcp-azure | 2 (AKIA) | main JS chunk + inline script |
| 5 | hardcoded-jwt-secret | 2 (jwt_secret + nextauth_secret) | inline script (entropy 5.50 + 5.72) |
| 6 | github-gitlab | 2 (ghp_) | main JS chunk + inline script |
| 7 | resend-sendgrid | 4 (2 SendGrid + 2 Resend) | main JS chunk + inline script |

**Total: 18 Batch 1 findings.** All correctly identified. All correctly redacted. Every finding has enough info (token type, fingerprint, entropy, character types, line:column, surrounding text, live probe result) to hunt down the source in real code.

**Bonus wins:**
- Scanner found the same key in multiple places (external chunk + inline script) and reported them separately
- Scanner did a live probe on each fake key against the real provider API — all correctly came back "already rotated/revoked"
- Every finding has enough evidence for a real developer to find and fix it

**Batch 1 status: ✅ DONE.** Full analysis at [scan-issues/2026-08-24-scan-04.md](../scan-issues/2026-08-24-scan-04.md).

### Scan #3 — 2026-08-24 03:12 (`BB-20260824-F2B412`) — 1 of 7 fired

**Why 6 didn't fire:** Our fake key values had the word "FakeTestbed" in them. BugBuzzer's "looks like a placeholder" filter correctly dropped them (real leaked secrets don't have the word "fake" in them). Row 5 fired because its 64-character random values had no placeholder words.

Same day we regenerated all fake values as pure random strings. Re-tested in scan #4 (above).

Full analysis at [scan-issues/2026-08-24-scan-03.md](../scan-issues/2026-08-24-scan-03.md).

### Scan #2 — 2026-08-22 09:25 (`BB-20260822-24C73A`) — 0 of 7 fired

**Why nothing fired:** BugBuzzer's scanner VPS had a CPU problem. The bundle scanner was timing out while fetching our JS files, so it saw an empty bundle and correctly reported "no keys found."

Nirav's team had a fix ready but couldn't deploy it right away. We waited a couple days for scanner #4.

Full analysis at [scan-issues/2026-08-22-scan-02.md](../scan-issues/2026-08-22-scan-02.md).

### Scan #1 — 2026-08-22 06:40 (`BB-20260822-F2846A`) — 0 of 7 fired

**Why nothing fired:** Our testbed had a bug — Turbopack (the new Next.js bundler) tree-shook the fake keys out of the deployed bundle. We fixed this by rendering the keys directly into JSX so Turbopack can't remove them.

Full analysis at [scan-issues/2026-08-22-scan-01.md](../scan-issues/2026-08-22-scan-01.md).

### Local check — 2026-08-22 (proving the testbed side works)

While the scanner was blocked on the CPU issue, we proved our testbed was set up correctly by pulling BugBuzzer's actual regex patterns from their source code and running them by hand against our deployed content (HTML + all 7 JS chunks, ~587 KB total).

**Result: all 7 Batch 1 checks matched our content.**

| Row | Check | Local test result |
|---|---|---|
| 1 | OpenAI + Anthropic | ✅ 3 matches each for `sk-proj-…` and `sk-ant-api03-…` |
| 2 | Stripe secret | ✅ 3 matches for `sk_live_…` |
| 3 | Supabase service_role JWT | ✅ JWT payload decodes correctly |
| 4 | AWS AKIA | ✅ 3 matches for `AKIA[A-Z0-9]{16}` |
| 5 | Hardcoded JWT secret | ✅ `jwt_secret` + `nextauth_secret` both pass full check (name filter + length ≥24 + entropy ≥4.0) |
| 6 | GitHub PAT | ✅ 3 matches for `ghp_[A-Za-z0-9]{36}` (fake value = exactly 36 chars) |
| 7 | Resend + SendGrid | ✅ 3 matches each for `re_…` and `SG.…` |

**Small fixes we made along the way (all done 2026-08-22):**

| # | Fix | Why |
|---|---|---|
| 1 | GitHub `ghp_` shortened to exactly 36 chars after prefix | The check's regex requires exactly 36 chars |
| 2 | Supabase JWT's `iss` field changed from `fake-testbed` → `supabase` | Check requires BOTH `role=service_role` AND `iss=supabase` |
| 3 | JWT secret variable renamed to `jwt_secret` (was "Hardcoded JWT signing secret" with spaces — spaces broke the regex) | Check needs a valid JavaScript identifier as the variable name |
| 4 | Added an inline `<script>` block with `var jwt_secret = "..."` too | Belt-and-suspenders — makes sure the assignment pattern is there no matter how Turbopack mangles the code |

**What this proves:**
- No real BugBuzzer bugs for Batch 1
- Our testbed content is set up correctly to trigger every check
- Any future Batch 1 miss would be either scanner infrastructure (bundle collector failing) or a check code regression — NOT a testbed problem

---

## Regression watch

If any of these 7 checks stops firing on a future scan, that's a regression. Things to check:

- Did BugBuzzer's regex or matcher logic change?
- Did the check code change and break detection?
- Did a fake key accidentally get moved out of the bundle?
- Did the Next.js build config change (tree-shaking might remove unused imports)?
- Did the deploy pipeline change and stop shipping the fake keys?
