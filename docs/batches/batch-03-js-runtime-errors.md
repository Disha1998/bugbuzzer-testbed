# Batch 3 — JavaScript errors at page load

## 📋 Where we are — 2026-09-01 (updated after scan #10)

**Is this batch done? PARTLY ✅ — 4 out of 5 checks work on the homepage scan**

- **Vercel bot problem is fixed** — scanner reached our site (2026-09-01 09:14 UTC)
- **Rows 34, 35, 36, 37 all fire on OUR planted code** (not on Vercel's own URLs) — confirmed
- **Row 38 (blank / error page) still needs a separate scan of `/broken`** — homepage scan correctly says "pass" because the homepage isn't blank

**Working after this scan (rows firing on OUR code):**
1. Row 35 `js-exceptions-detected` — ✅ fires on our `throw new Error("Intentional test error - Batch 3")`
2. Row 36 `failed-network-requests` — ✅ fires on our `/api/does-not-exist-batch-3` 404
3. Row 37 `hydration-errors-detected` — ✅ fires as React error #418 (our `Date.now()` trick)
4. Row 34 `js-exception-regression` — ✅ correctly reports "no new errors since prior scan" (fired once earlier when error was new, now shows as passing — that's the intended behavior)

**Still to do:**
- Row 38 `critical-page-blank-or-error` — **stuck after scan #11.** We scanned `/broken`, Vercel returned HTTP 403 (bot page). If you curl the URL you get our error content, but the scanner sees Vercel's 403 page. **Fix K in [testbed-fixes-backlog.md](../testbed-fixes-backlog.md)** covers this — either rename `/broken` or return HTTP 500 or strip the layout.

**Old open items (all had one root cause — Fix A in the backlog, now DONE):**
1-7. All were caused by Vercel bot protection blocking the scanner. **Fixed by moving to Hostinger.** After the move, all Batch 1 and Batch 2 findings came back, and Batch 3 rows fire on our real code.
8. **Cannot verify Row 38 until Fix K blocker 2 is done.** See [testbed-fixes-backlog.md → Fix K](../testbed-fixes-backlog.md).

Old blocked scans: `BB-20260831-6624A2` (homepage), `BB-20260831-18605E` (/broken), `BB-20260831-529521` (re-scan). All 3 got HTTP 403 from Vercel.

Full analysis: [scan-issues/2026-08-31-scan-blocked-vercel.md](../scan-issues/2026-08-31-scan-blocked-vercel.md).

---

- **Category:** JavaScript runtime errors (browser-side)
- **Rows on master sheet:** 34, 35, 36, 37, 38
- **Checks tested:** 5
- **Branch:** merged direct to main (small batch, following Batch 2 pattern)
- **Deployed on:** 2026-08-31

---

## What this batch tests

BugBuzzer loads the page in a real headless browser (Playwright) and watches for:
- JavaScript errors thrown when the page runs
- Failed network calls (404, 500, etc.)
- React / Next.js hydration warnings
- Blank pages or error pages

These are silent bugs — the URL returns HTTP 200 but the user sees a broken page.

---

## What we planted

All 5 vulnerabilities live in two places:

- **[`components/batch-3-runtime-vulns.tsx`](../../components/batch-3-runtime-vulns.tsx)** — bundles rows 34/35/36/37 into one client component that runs on the homepage
- **[`app/broken/page.tsx`](../../app/broken/page.tsx)** — a separate page for row 38

| # | Row | Check ID | How we planted it |
|---|---|---|---|
| 1 | 34 | js-exception-regression | Same code as row 35 — when the JS error first appears, it's "new" so the regression check fires. After a scan or two, error becomes "not new" and the check stops firing. Working as designed. |
| 2 | 35 | js-exceptions-detected | `setTimeout(() => { throw new Error("Intentional test error - Batch 3 (safe to ignore)") }, 100)` in a client component. Browser catches it as an uncaught error, logs to console, scanner reads console. |
| 3 | 36 | failed-network-requests | `fetch("/api/does-not-exist-batch-3")` in a useEffect. Returns 404. Scanner's network log catches it. |
| 4 | 37 | hydration-errors-detected | `<span>Server timestamp: {Date.now()}</span>` in a hidden div. Server renders time T1, client renders time T2. React logs a hydration mismatch warning. |
| 5 | 38 | critical-page-blank-or-error | Dedicated `/broken` page renders `<h1>Application Error</h1><p>Error 500 - internal server error...</p>`. Scanner should detect the error state. |

---

## What we expect the scanner to find

**Scan A — Homepage** (`https://testbed.blockchainhq.xyz/`):

| Check | Expected | Notes |
|---|---|---|
| js-exception-regression | 1 (first scan only) | Fires once when the error is new, then quiets down |
| js-exceptions-detected | 1 | Every scan while the error is there |
| failed-network-requests | 1 | Every scan |
| hydration-errors-detected | 1 | Every scan |
| critical-page-blank-or-error | 0 | Homepage is NOT blank — this check only fires on `/broken` |

**Scan B — Broken page** (`https://testbed.blockchainhq.xyz/broken`):

| Check | Expected | Notes |
|---|---|---|
| critical-page-blank-or-error | 1 | Page shows "Application Error" + minimal content |
| (Batch 1 + Batch 2 checks) | may not fire on this URL | Different page context — no cookies set, no CDN script loaded, etc. Not a regression, just a different scan target. |

**Total expected new findings across Scan A + Scan B: 5** (or 6 if you count the first-scan regression).

---

## What to tell real users (fix guidance)

For each finding kind, the scan report should tell the customer:

- **JS exception** → open browser DevTools → Console tab → find the error stack trace → fix the code that throws it
- **Failed network call** → check the URL being called — is the endpoint deployed, path correct, methods matching?
- **Hydration mismatch** → avoid using `Date.now()`, `Math.random()`, browser-only APIs, or `localStorage` during server render. Use `useEffect` or Next.js's `dynamic({ ssr: false })` for browser-only code
- **Blank / error page** → the page's data fetching or component throw needs to be caught properly. Add error boundaries and fallback UI.

BugBuzzer's own check code emits detailed `remediation` for each, so users get specific guidance.

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

If any of these findings stops firing on a future scan (except row 34 which is fire-once by design), check:

- Was `Batch3RuntimeVulns` accidentally removed from `app/page.tsx`?
- Did the `throw new Error` get wrapped in a try/catch that swallows the error?
- Did the `fetch("/api/does-not-exist-batch-3")` URL get renamed to a real endpoint?
- Did the `Date.now()` inside `HydrationMismatch` get replaced with a stable value?
- Did `/broken/page.tsx` get deleted or changed to render normal content?
- Did a Next.js update change how hydration warnings are surfaced?
