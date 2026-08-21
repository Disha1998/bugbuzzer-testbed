# Batch 6 — Injection / RCE Probes

**Category:** Active injection attacks — SSTI, XSS, SQLi, OS command, eval
**Master sheet rows:** 43, 44, 117, 121, 122, 139, 291, 292
**BugBuzzer checks tested:** 8
**Date added to testbed:** _pending_
**Status:** ⬜ Pending

---

## What this batch tests

BugBuzzer actively probes endpoints with SAFE injection payloads. For each vulnerability, we need an endpoint that behaves as if injectable — so the scanner's probe returns the expected "vulnerable" signal.

⚠️ **These endpoints MUST be safe.** Never run real user input through `eval`, `exec`, shell commands, or SQL concatenation. Simulate the vulnerable behavior — don't actually make it exploitable.

---

## Vulnerabilities to bake in

| # | Row | Check Name | How to introduce it (safely) |
|---|---|---|---|
| 1 | 43 | SSTI — server-side template injection probe | Add `/api/template?input=xxx` that treats `{{7*7}}` → returns response body containing `49`. Simulate; don't actually eval. |
| 2 | 44 | LLM prompt injection in AI-powered inputs | Add `/api/chat` that responds to `"ignore previous instructions"` with a mock "leaked" system prompt |
| 3 | 117 | Reflected XSS in URL parameters | Add `/api/search?q=xxx` that echoes `q` back into HTML without encoding |
| 4 | 121 | Error-based SQL injection | Add `/api/user?id=xxx` — when `xxx` contains `'`, return a mock MySQL error string in the response |
| 5 | 122 | Time-based blind SQL injection | Add `/api/product?id=xxx` — when `xxx` contains `SLEEP(5)`, sleep 5s before responding |
| 6 | 139 | OS command injection via user input | Add `/api/file?name=xxx` — when `xxx` contains `; sleep 5`, sleep 5s (simulate) |
| 7 | 291 | Node.js eval() code injection | Add `/api/calc?expr=xxx` — when `xxx=1+1`, return `2`. Simulate math eval without actually calling eval() |
| 8 | 292 | Python eval / exec code injection | Requires Python backend — SKIP for now (add in Phase B with a Python service) OR mock via a Node route that behaves like Python eval |

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
| 6 | Detected | | ⬜ |
| 7 | Detected | | ⬜ |
| 8 | Detected | | ⬜ |

---

## Regression watch

_Fill in after first successful scan._
