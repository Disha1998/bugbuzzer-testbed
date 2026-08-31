# Batch 3 — JavaScript Runtime Errors

## 📋 Status at a glance — 2026-08-31

**Batch complete? NO ❌** (deployed, awaiting first scan)
- **0 of 5 rows scan-verified yet** — code deployed, needs first scan to confirm
- **0 open issues** — no scan results yet
- **1 quirk to remember:** Row 34 fires only ONCE (on the first scan after new error appears), then goes back to passing forever. Not a bug.
- **1 extra scan needed:** Row 38 requires a separate scan against `/broken` URL, not the homepage.

Last scan: BB-20260826-E71978 (2026-08-26, before Batch 3 was deployed). Next scan will be the first one to test Batch 3.

---

**Category:** JS Runtime Errors (browser-side)
**Master sheet rows:** 34, 35, 36, 37, 38
**BugBuzzer checks tested:** 5
**Branch:** merged direct to main (small batch, following Batch 2 pattern)
**Date added to testbed:** 2026-08-31

---

## What this batch tests

BugBuzzer loads the page in a real headless browser (Playwright) and watches:
- JavaScript errors thrown at runtime
- Failed network calls (404, 500, etc.)
- React / Next.js hydration warnings
- Blank or error-state pages

These are silent bugs — the URL returns HTTP 200 but the user sees a broken page.

---

## Vulnerabilities baked in

All 5 vulnerabilities live in two places:

- **[`components/batch-3-runtime-vulns.tsx`](../../components/batch-3-runtime-vulns.tsx)** — bundles rows 34/35/36/37 into one client component that mounts on the homepage
- **[`app/broken/page.tsx`](../../app/broken/page.tsx)** — a separate page for row 38

| # | Row | Check ID | How it's introduced |
|---|---|---|---|
| 1 | 34 | js-exception-regression | Same as row 35 — when the JS error first appears, it's "new" so the regression check fires. After a scan or two, error becomes "not new" and the check stops firing. |
| 2 | 35 | js-exceptions-detected | `setTimeout(() => { throw new Error("Intentional test error - Batch 3 (safe to ignore)") }, 100)` in a client component that mounts on homepage. Browser catches it as an uncaught error, logs to console, scanner reads console. |
| 3 | 36 | failed-network-requests | `fetch("/api/does-not-exist-batch-3")` in a useEffect. Returns 404. Scanner's network log catches it. |
| 4 | 37 | hydration-errors-detected | `<span>Server timestamp: {Date.now()}</span>` in a hidden div. Server renders time T1, client renders time T2. React logs a hydration mismatch warning. |
| 5 | 38 | critical-page-blank-or-error | Dedicated `/broken` page renders `<h1>Application Error</h1><p>Error 500 - internal server error...</p>`. Scanner detects the error state. |

---

## Expected BugBuzzer scan results

**Scan A — Homepage** (`https://testbed.blockchainhq.xyz/`):

| Check | Expected finding | Notes |
|---|---|---|
| js-exception-regression | 1 (first scan only) | Fires once when the error is new, then passes on later scans |
| js-exceptions-detected | 1 | Every scan while the error is there |
| failed-network-requests | 1 | Every scan |
| hydration-errors-detected | 1 | Every scan |
| critical-page-blank-or-error | 0 | Homepage is NOT blank — this check only fires on `/broken` |

**Scan B — Broken page** (`https://testbed.blockchainhq.xyz/broken`):

| Check | Expected finding | Notes |
|---|---|---|
| critical-page-blank-or-error | 1 | Page shows "Application Error" + minimal content |
| (Batch 1 + Batch 2 checks) | may not fire on this URL | Different route context — no cookies set, no CDN script loaded, etc. Not a regression, just a different scan target |

**Total expected new findings across Scan A + Scan B: 5** (or 6 if you count first-scan regression).

---

## Suggested fix (for real users)

For each finding kind, the user-facing report should tell the customer:

- **JS exception** → open browser DevTools → Console tab → find the error stack trace → fix the code that throws
- **Failed network call** → check the URL being called — is the endpoint deployed, path correct, methods matching?
- **Hydration mismatch** → avoid using `Date.now()`, `Math.random()`, browser-only APIs, or `localStorage` during server render. Use `useEffect` or Next.js's `dynamic({ ssr: false })` for browser-only code
- **Blank / error page** → the page's data fetching or component throw needs to be caught properly; add error boundaries and fallback UI

BugBuzzer's own check code emits detailed `remediation` fields for each, so users get the specific guidance.

---

## Actual scan results

_Fill in after Scan A + Scan B._

**Scan A — Homepage:**

| Check | Expected | Actual | Status |
|---|---|---|---|
| js-exception-regression | 1 (first scan only) | | ⬜ |
| js-exceptions-detected | 1 | | ⬜ |
| failed-network-requests | 1 | | ⬜ |
| hydration-errors-detected | 1 | | ⬜ |

**Scan B — /broken:**

| Check | Expected | Actual | Status |
|---|---|---|---|
| critical-page-blank-or-error | 1 | | ⬜ |

---

## Regression watch

If any of these findings stops appearing on a future scan (except row 34 which is fire-once by design), investigate:

- Was `Batch3RuntimeVulns` accidentally removed from `app/page.tsx`?
- Did the `throw new Error` get wrapped in a try/catch that swallows the error?
- Did the `fetch("/api/does-not-exist-batch-3")` URL get renamed to a real endpoint?
- Did the `Date.now()` inside `HydrationMismatch` get replaced with a stable value?
- Did `/broken/page.tsx` get deleted or changed to render normal content?
- Did Next.js update change how hydration warnings are surfaced?
