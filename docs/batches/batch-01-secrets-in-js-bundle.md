# Batch 1 — Secrets & API Keys in JS Bundle

**Category:** Secrets & Keys in JS Bundle
**Master sheet rows:** 1, 2, 3, 4, 5, 6, 7
**BugBuzzer checks tested:** 7
**Date added to testbed:** 2026-08-21
**Status:** 🟡 In progress

---

## What this batch tests

BugBuzzer scans the compiled JavaScript bundle of a website looking for hardcoded API keys, secrets, and credentials. Developers often paste keys into frontend code by mistake — those keys get bundled into `.js` files that anyone can view in DevTools.

This batch bakes in 7 fake keys, one for each of the 7 checks in the master sheet.

---

## Vulnerabilities baked in

All fake keys live in [`lib/fake-secrets.ts`](../../lib/fake-secrets.ts) and are imported into the client-side page so they get bundled into the JavaScript that ships to the browser.

| # | Row | Check Name | Fake Key Type | Where in code |
|---|---|---|---|---|
| 1 | 1 | OpenAI / Anthropic API key exposed in JS bundle | `sk-proj-...` and `sk-ant-api03-...` | `lib/fake-secrets.ts` |
| 2 | 2 | Stripe secret key in JS bundle | `sk_live_...` | `lib/fake-secrets.ts` |
| 3 | 3 | Supabase service_role key in JS bundle | JWT with `role: service_role` | `lib/fake-secrets.ts` |
| 4 | 4 | AWS / GCP / Azure credentials in JS bundle | `AKIA...` (AWS Access Key ID) | `lib/fake-secrets.ts` |
| 5 | 5 | Hardcoded JWT secret in JS bundle | 60+ char random string | `lib/fake-secrets.ts` |
| 6 | 6 | GitHub / GitLab token in JS bundle | `ghp_...` (GitHub PAT) | `lib/fake-secrets.ts` |
| 7 | 7 | Resend / SendGrid email API key in JS bundle | `re_...` and `SG.xxx.yyy` | `lib/fake-secrets.ts` |

⚠️ **All keys are fake.** They match the real format (correct prefix) but have random garbage in the rest of the string. No real service will accept them.

---

## Expected BugBuzzer scan results

When you run BugBuzzer against `https://testbed.blockchainhq.xyz`, you should see 7 findings (one per fake key type).

| Check # | Expected finding | Severity |
|---|---|---|
| 1 | 1 OpenAI + 1 Anthropic key exposed | Critical |
| 2 | 1 Stripe live secret key exposed | Critical |
| 3 | 1 Supabase service_role JWT exposed | Critical |
| 4 | 1 AWS Access Key ID exposed | Critical |
| 5 | 1 hardcoded JWT signing secret exposed | Critical |
| 6 | 1 GitHub Personal Access Token exposed | Critical |
| 7 | 1 Resend key + 1 SendGrid key exposed | High |

If any of the 7 checks does NOT fire, that's a **false negative** — investigate the check code.
If any check fires with wrong severity or wrong value, that's a **false positive** — tighten the check.

---

## Suggested fix (for real users)

If BugBuzzer detects any of these secret leaks in a real user's site, this is the guidance to show them in the scan report.

### The problem

An API key or secret is embedded in your frontend JavaScript. Anyone who visits your site can open browser DevTools, look at the network tab or "view source", find your key, and use it to:

- Run up billing on your account (OpenAI, Anthropic, Stripe, AWS)
- Send spam or phishing emails from your domain (Resend, SendGrid)
- Access your private repositories (GitHub)
- Read and write your entire database (Supabase service_role)
- Forge authentication tokens (JWT secret)

### The fix

**Never put backend secrets in frontend code.** Instead:

1. Move the secret to your backend / server-side environment variables
2. Create a backend API endpoint that uses the secret
3. Call the backend endpoint from your frontend

**Example — WRONG (secret in frontend):**

```typescript
// pages/index.tsx — DON'T DO THIS
const openai = new OpenAI({ apiKey: "sk-proj-abc123..." });
```

**Example — RIGHT (secret on backend):**

```typescript
// pages/api/chat.ts — server-side API route
export default async function handler(req, res) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // ... use openai to fulfill the request ...
}

// frontend calls the API route — never sees the key
fetch("/api/chat", { method: "POST", body: JSON.stringify({ ... }) });
```

### Immediate action if a real key was leaked

1. **Rotate the key immediately** at the provider dashboard (OpenAI, Stripe, GitHub, etc. all have rotation buttons)
2. Check the provider's billing / usage dashboard for unauthorized activity
3. Move the new key to a backend environment variable
4. Redeploy — verify the old key is no longer in your bundle
5. If billing was abused, contact the provider's support for a refund

### Prevention

- Only use `NEXT_PUBLIC_` (Next.js) or `VITE_` (Vite) prefixes for values that are safe to expose in the browser (e.g. Stripe publishable keys, Supabase anon keys)
- Add secret-scanning to your CI pipeline (GitGuardian, TruffleHog, gitleaks)
- Add a pre-commit hook that blocks known secret patterns
- Review pull requests for hardcoded credentials before merging

---

## Actual scan results

_Fill in after Day 3 scan._

| Check # | Expected | Actual | Status |
|---|---|---|---|
| 1 | Detected | | ⬜ |
| 2 | Detected | | ⬜ |
| 3 | Detected | | ⬜ |
| 4 | Detected | | ⬜ |
| 5 | Detected | | ⬜ |
| 6 | Detected | | ⬜ |
| 7 | Detected | | ⬜ |

**Scan date:**
**BugBuzzer version scanned:**
**Notes on any false positives, false negatives, or edge cases:**

---

## Regression watch

If any of these 7 checks stops detecting on a future scan, that's a regression. Investigate:

- Did BugBuzzer's regex or matcher logic change?
- Did the check code change and break detection?
- Did the fake key get accidentally moved out of the bundle?
- Did the Next.js build config change (tree-shaking might have removed unused imports)?
- Did the deploy pipeline change and stop shipping the fake keys?
