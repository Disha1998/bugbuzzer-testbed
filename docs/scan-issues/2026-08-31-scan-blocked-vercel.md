# Scan Issues — 2026-08-31 (Scans #7, #8, #9 all blocked by Vercel bot protection)

**Testbed URLs scanned:** `https://testbed.blockchainhq.xyz/` and `/broken`
**Scan IDs:**
- BB-20260831-**6624A2** (homepage, first Batch 3 scan)
- BB-20260831-**18605E** (/broken, first Batch 3 scan)
- BB-20260831-**529521** (homepage re-scan)

**BugBuzzer version:** beta
**Kind:** pro_scan
**Duration:** ~40-80 seconds each
**Coverage summary (all 3 scans):** 86 passed, 9 failed, 0 errored, 26 skipped

---

## Headline

**Batch 3 verification is blocked. Not our fault, not BugBuzzer's checks — Vercel's bot protection.**

- Batch 3 code deployed correctly (curl confirms all vulnerabilities in HTML)
- Site returns HTTP 200 to normal visitors
- BugBuzzer's Playwright scanner triggers Vercel bot protection → returns HTTP 403 → scanner sees nothing
- Result: Batch 1, 2, 3 all report "no vulnerabilities detected" even though the vulnerabilities are demonstrably still there

Disha confirmed she made NO changes to Vercel settings. Vercel likely rolled out default bot protection between Aug 26 (last successful scan) and Aug 31 (first blocked scan).

---

## The 10 issues we found

### 🟡 Batch 3 checks — firing for the wrong reason (3 issues)

**Issue 1 — Row 34 (`js-exception-regression`) fired but not from our error**
- Expected: fires on our intentional `throw new Error("Intentional test error - Batch 3")` inside `components/batch-3-runtime-vulns.tsx`
- Actual: fired on console error `Failed to load resource: the server responded with a status of 403`
- The 403 came from Vercel's own bot-challenge endpoint failing, not our planted code
- Check functionally worked, but the finding is about the wrong error

**Issue 2 — Row 35 (`js-exceptions-detected`) same story as Issue 1**
- Same "Failed to load resource: 403" fired the check
- Not our planted `throw new Error`

**Issue 3 — Row 36 (`failed-network-requests`) fired on Vercel's URL, not ours**
- Expected: fires on our `fetch("/api/does-not-exist-batch-3")` (a 404 we planted)
- Actual: fires on `https://testbed.blockchainhq.xyz/.well-known/vercel/security/request-challenge` (5xx from Vercel infrastructure)
- Our planted 404 fetch never ran because the scanner never loaded the page

### ❌ Batch 3 checks — never fired (2 issues)

**Issue 4 — Row 37 (`hydration-errors-detected`) never fired**
- Expected: fires on our `<span>Server timestamp: {Date.now()}</span>` server/client mismatch
- Actual: passed (never triggered)
- Cause: scanner got 403 → never actually loaded and rendered the page → never saw the hydration mismatch

**Issue 5 — Row 38 (`critical-page-blank-or-error`) never fired**
- Expected: fires on `/broken` page which renders "Application Error" + minimal content
- Actual: passed on both `/` and `/broken` scans
- Cause: scanner got 403 → never saw the error text on `/broken`

### 🔴 Regressions from Batch 1 and Batch 2 — scanner-side, not code-side (2 issues)

**Issue 6 — All 7 Batch 1 checks now show "not detected"**
Affected checks:
- `openai-anthropic-api-key-in-js-bundle`
- `stripe-secret-key-in-js-bundle`
- `supabase-service-role-key-in-js-bundle`
- `aws-gcp-azure-credentials-in-js-bundle`
- `hardcoded-jwt-secret-in-js-bundle`
- `github-gitlab-token-in-js-bundle`
- `resend-sendgrid-api-key-in-js-bundle`

**But the fake keys ARE still in the deployed HTML.** Verified with `curl -s https://testbed.blockchainhq.xyz/` — response is HTTP 200 with all fake keys visible (sk-proj-, sk-ant-api03-, sk_live_, AKIA, ghp_, re_, SG., Supabase JWT).

Real regression: scanner cannot see the content. Not a testbed regression.

**Issue 7 — All Batch 2 checks now show "not detected"**
Affected checks:
- `session-cookie-missing-http-only` / `secure` / `samesite` — cookies still set (verified with curl `-I`)
- `session-token-insufficient-expiration` — JWT cookie still there with `exp: 4102444800`
- `sri-missing` — status was `skipped` with reason "no external `<script src>` tags discovered" — because scanner never saw the lodash script tag we deployed

Same story: real content is deployed, scanner just can't reach it.

### 🚫 Root cause (1 issue)

**Issue 8 — Vercel bot protection is blocking BugBuzzer's Playwright scanner**

Evidence:
- BugBuzzer's `failed-network-requests` finding names the exact URL: `https://testbed.blockchainhq.xyz/.well-known/vercel/security/request-challenge`
- That URL is Vercel's internal "prove you're a real browser" challenge endpoint
- Curl (normal HTTP client) → gets HTTP 200 with real content
- BugBuzzer Playwright (headless browser) → gets HTTP 403 after Vercel serves the challenge

Trigger: likely one of
- Vercel rolled out default bot detection to new/existing projects between Aug 26 and Aug 31
- Repeated scans from same BugBuzzer scanner IP crossed a rate threshold
- Playwright fingerprint pattern triggered detection

No Vercel setting was changed by Disha.

### 🐛 BugBuzzer scanner code bugs surfaced (2 issues, for the BugBuzzer team)

**Issue 9 — `failed-network-requests` false positive on infra URLs**
- File: `packages/check-catalog/src/checks/browser-baseline/failed-network-requests.ts`
- The check flags any 5xx response on any main-frame URL as an "app server error"
- It has no filter for platform infrastructure URLs like `.well-known/vercel/security/*`, `.well-known/cloudflare/*`, `_next/static/*`, etc.
- Result: any Vercel-hosted site that gets scanned while bot protection is active reports a spurious "server error" finding pointing at Vercel's own infra URL
- Fix suggestion: skip URLs matching platform-infra patterns (`.well-known/vercel/*`, `.well-known/cloudflare/*`) OR downgrade them to a "scanner-infra warning" category

**Issue 10 — Silent regression when scanner is blocked by bot protection**
- When Vercel or Cloudflare returns 403 to BugBuzzer's scanner, every page-dependent check (secrets in JS bundle, cookies, hydration, etc.) reports `status: "passed"` because it saw no content
- The scan report looks clean when actually the scanner never saw the site
- Users will get a "no vulnerabilities found" report even for badly misconfigured sites — as long as the site's bot protection blocks the scanner
- Fix suggestion: if the top-level `site-returning-error-status` check reports HTTP 403/challenge, mark all page-dependent checks as `status: "skipped"` with reason `"scanner blocked by target's bot protection"` instead of `status: "passed"`

---

## Consequences for our work

### Batch 3 verification is blocked

Cannot flip Batch 3 to Complete (5 rows unverified). Stays as 🚀 Live until scanner can reach the page.

### Batch 1 and Batch 2 status stays as previously verified

Do NOT flip Batch 1 or 2 back to "Live" or "Regression" — our code is fine, the scanner just can't see it. Previous scans (BB-20260824-5B681D for Batch 1, BB-20260826-E71978 for Batch 2) still stand as valid verification.

### Options for unblocking

1. **Try "Protection Bypass for Automation" in Vercel dashboard** — Add a secret, share with Nirav, ask if BugBuzzer can send `x-vercel-protection-bypass` header. Cost: 5 min + Nirav's cooperation.
2. **Move testbed to Hostinger VPS** — Full control, no built-in bot protection. Cost: 2-3 hours setup.
3. **Ask Nirav for BugBuzzer's scanner IP** — Add to Vercel Firewall allowlist. Cost: depends on Nirav's response.
4. **Wait it out** — Vercel bot protection may reset over time. Cost: unknown, may not resolve.

### Ongoing work — move to Batch 4

Batch 4 (Public File Exposure) probes specific URLs directly (`/.env`, `/.git/config`, etc.). These probes don't require the whole page to load. They should work even under Vercel bot protection because BugBuzzer just curls the URL and checks the response.

If Batch 4 probes also get blocked, we log that as an eleventh issue and either fix or pause.

---

## Waiting on

- Decision on which unblocking path to try (bypass secret / VPS move / Nirav / wait)
- OR — continue to Batch 4 as planned (bot protection may not affect Batch 4's URL-probe checks)

## Log this file for BugBuzzer team review later

When the BugBuzzer team has bandwidth, share Issues 9 and 10 with them. Both are legitimate BugBuzzer bugs — not urgent for us, but they'd cause real customer confusion. Draft message ready in this file's "Issues 9-10" section.

---

## Fix plan — 3 actual fixes (10 issues collapse into these)

The 10 issues are really about 3 root problems. Fix these 3 things and all 10 issues go away.

### 🅐 Fix A — Unblock BugBuzzer scanner from Vercel bot protection

**Fixes:** Issues 1, 2, 3, 4, 5, 6, 7, 8 (all 8 are downstream of scanner being blocked)
**Owner:** Us (Disha)
**Priority:** P1 (blocker — cannot verify Batch 3, Batch 4, or any future batch until this is resolved)

**Fix steps — try in this order (cheapest first):**

1. **Try 1 — Vercel Protection Bypass secret** (~10 min)
   - Vercel dashboard → bugbuzzer-testbed → Settings → Deployment Protection
   - Scroll to "Protection Bypass for Automation" section
   - Click "+ Add Secret", save the generated string
   - Ask Nirav if BugBuzzer can send `x-vercel-protection-bypass: <secret>` header
   - Verification: re-scan, curl `-H "x-vercel-protection-bypass: <secret>"` returns 200, scanner should get 200 too

2. **Try 2 — Check for Firewall tab** (~10 min)
   - Vercel dashboard → bugbuzzer-testbed → top nav → look for "Firewall" tab
   - If it exists, look for "Attack Challenge Mode" toggle → turn OFF
   - If Firewall tab doesn't exist, skip to Try 3
   - Verification: re-scan gets HTTP 200

3. **Try 3 — Ask Nirav for scanner IPs** (~1 day)
   - "Can you share the IP ranges BugBuzzer's scanner uses? I want to allowlist them in Vercel Firewall."
   - Add IPs to Vercel Firewall → Custom Rules → Allow
   - Verification: re-scan gets HTTP 200

4. **Try 4 (nuclear) — Move testbed to Hostinger VPS** (~2-3 hours)
   - Deploy the Next.js app to Hostinger VPS (Node + nginx)
   - Update DNS: `testbed.blockchainhq.xyz` A-record → VPS IP
   - VPS has no built-in bot protection → scanner works forever
   - Verification: re-scan, all Batch 1/2/3 checks fire correctly again

**What "fixed" looks like:** re-scan of homepage returns HTTP 200 in Playwright, `site-returning-error-status` reports 200, Batch 1 findings return (18), Batch 2 findings return (~15), Batch 3 findings fire correctly (5 findings from OUR planted vulnerabilities, not Vercel's challenge URL).

---

### 🅑 Fix B — Report BugBuzzer bug: `failed-network-requests` false positive on infra URLs

**Fixes:** Issue 9
**Owner:** BugBuzzer team (Nirav)
**Priority:** P2 (real bug — affects every Vercel-hosted customer BugBuzzer scans when their bot protection kicks in)

**Fix steps:**

1. When we message Nirav (about Fix A or otherwise), include this:

   > FYI a BugBuzzer bug I noticed while testing: `failed-network-requests` check has no filter for platform infrastructure URLs. When Vercel's bot protection engages, it serves `.well-known/vercel/security/request-challenge` — the check flags this as an "app server error" pointing at that URL. That's not an app URL, it's Vercel's infra. Same would happen for Cloudflare's `.well-known/cf/*` challenges. Suggest filtering out `.well-known/(vercel|cf|cloudflare)/*` patterns OR downgrading them to a scanner-infra warning instead of app-server-error.
   >
   > File: `packages/check-catalog/src/checks/browser-baseline/failed-network-requests.ts`

2. Nirav decides whether to file the fix or add to backlog.

**What "fixed" looks like:** the check code adds a filter for infra-URL patterns; re-scan of any Vercel site under bot protection doesn't emit spurious "server error" findings pointing at Vercel infra URLs.

---

### 🅒 Fix C — Report BugBuzzer bug: silent regression when scanner is blocked

**Fixes:** Issue 10
**Owner:** BugBuzzer team (Nirav)
**Priority:** P1 for BugBuzzer product quality (real customers will get "clean" scan reports on badly misconfigured sites just because bot protection blocks scanner)

**Fix steps:**

1. Include this in the same Nirav message as Fix B:

   > Second BugBuzzer bug: when the target site returns HTTP 403 to the scanner (e.g., bot protection engaged), every content-dependent check (secrets in JS bundle, cookies, hydration, etc.) reports `status: "passed"` because it saw no content to flag. The scan report LOOKS clean when actually the scanner never reached the site. Customers running a scan on a site with active bot protection will get a false sense of security.
   >
   > Suggest: when top-level `site-returning-error-status` reports HTTP 403 or challenge, mark all page-dependent checks as `status: "skipped"` with reason `"scanner blocked by target's bot protection"` instead of `status: "passed"`. Or add a `scan-precondition-failed` metadata that downgrades or annotates all downstream findings.

2. Nirav decides whether to fix or add to backlog.

**What "fixed" looks like:** if a scan hits a bot-protected site, the report clearly says "scanner was blocked, results incomplete" instead of showing a clean pass on all page-dependent checks.

---

## Central action tracker

All 3 fixes (A + B + C) are also logged in [`docs/testbed-fixes-backlog.md`](../testbed-fixes-backlog.md) — the central list of all open fixes across all batches, so future-us doesn't need to hunt through per-scan MDs to find action items.
