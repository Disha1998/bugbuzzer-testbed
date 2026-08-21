# Batch 3 — JavaScript Runtime Errors

**Category:** JS Runtime Errors (browser-side)
**Master sheet rows:** 34, 35, 36, 37, 38
**BugBuzzer checks tested:** 5
**Date added to testbed:** _pending_
**Status:** ⬜ Pending

---

## What this batch tests

BugBuzzer loads the page in a real headless browser and captures every JS error, failed network call, hydration warning, and blank-page state.

These are silent bugs — the site returns HTTP 200 but the user sees a broken page.

---

## Vulnerabilities to bake in

| # | Row | Check Name | How to introduce it |
|---|---|---|---|
| 1 | 34 | JS exception regression — new error since last scan | Add a `throw new Error("test regression")` in a component that mounts on second scan |
| 2 | 35 | JavaScript exceptions on page load | Add `throw new Error("intentional test error")` in a component that mounts on load |
| 3 | 36 | Failed API or network calls on page load | Add a `fetch("/api/nonexistent-endpoint")` on page load — 404 |
| 4 | 37 | React / Next.js hydration errors detected | Render something server-side that differs from client-side (e.g. `Math.random()` or timestamp) |
| 5 | 38 | Critical page returns blank or error state | Add a `/broken` page that returns HTTP 200 with empty `<body>` or error text |

---

## Expected BugBuzzer scan results

_Fill in after implementation._

---

## Suggested fix (for real users)

_Fill in when implementing._

---

## Actual scan results

| Check # | Expected | Actual | Status |
|---|---|---|---|
| 1 | Detected | | ⬜ |
| 2 | Detected | | ⬜ |
| 3 | Detected | | ⬜ |
| 4 | Detected | | ⬜ |
| 5 | Detected | | ⬜ |

---

## Regression watch

_Fill in after first successful scan._
