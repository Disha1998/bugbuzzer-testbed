# Scan log

Every time we run a scan against `https://testbed.blockchainhq.xyz`, we add a row here. Newest scans go on top.

**Why we keep this log:**
- Catch regressions over time (checks that used to work but stopped)
- Show which version of the BugBuzzer scanner was used on which date
- Track false alarms and misses across scans

---

## The log

| Date | Scanner version | Batches tested | Expected findings | Actual findings | Working | Not working | Notes |
|---|---|---|---|---|---|---|---|
| 2026-08-24 04:36 | beta | 1 | 7 (Batch 1) | 18 for Batch 1 (multi-source) + 11 real hygiene findings = 29 total | **All 7 for Batch 1** | 0 for Batch 1 | Scan ref `BB-20260824-5B681D`. ✅ **BATCH 1 DONE.** All 7 checks fire with the right evidence, severity, and rich context (redaction, entropy, fingerprint, live probe results). Bonus: multi-source detection (fetched chunk + inline JSON) + live credential probing against real provider APIs (all correctly show "already rotated/revoked" for our fake keys). Minor cosmetic bug spotted: check summary count is off by 1 per source with `sourceUrl=null`. See [scan-issues/2026-08-24-scan-04.md](./scan-issues/2026-08-24-scan-04.md). |
| 2026-08-24 03:12 | beta (after Nirav's fix) | 1 | 7 (Batch 1) | 2 for Batch 1 (both row 5) + 3 real hygiene findings | 1 for Batch 1 (row 5) | 6 for Batch 1 (rows 1-4, 6, 7) | Scan ref `BB-20260824-F2B412`. **Infrastructure fully recovered — 0 errored, scan took 53 seconds.** Row 5 (JWT secret) fired both `jwt_secret` + `nextauth_secret` findings correctly. Other 6 rows blocked by BugBuzzer's "looks like a placeholder" filter — our fake values had the word "FakeTestbed" in them, which correctly reads as a placeholder. Fix: regenerate all fake values as pure random garbage (no "Fake"/"Test"/"example" words). See [scan-issues/2026-08-24-scan-03.md](./scan-issues/2026-08-24-scan-03.md). |
| 2026-08-22 (local) | n/a — local regex test | 1 | 7 (Batch 1) | 7 patterns matched on live deploy | 7 for Batch 1 | 0 | **No real scan** — we pulled BugBuzzer's real regex patterns from their source code and ran them by hand against the fetched HTML + JS from `https://testbed.blockchainhq.xyz/` (~587 KB). All 7 rows matched. Row 5 (JWT secret) additionally passed the full check logic (assignment regex + name filter + entropy ≥4.0). **We missed catching the "looks like a placeholder" filter — regex match is necessary but not sufficient. Lesson learned: local verification must also simulate the placeholder filter.** Fixes applied same day: GitHub `ghp_` shortened to exactly 36 chars, Supabase JWT `iss=supabase`, JWT secret moved to `jwt_secret`/`nextauth_secret` named exports + inline `var` assignments. See batch-01 MD "Local check" section. |
| 2026-08-22 09:25 | beta | 1 (post-fix) | 7 (Batch 1) | 0 for Batch 1 + 3 Email/DNS findings | 0 for Batch 1 | 7 for Batch 1 | Scan ref `BB-20260822-24C73A`. Testbed fake keys confirmed in bundle via DevTools BEFORE this scan. **Same result as scan #1** — 7 Batch 1 misses, 66 errored, 8 skipped. Nirav confirmed VPS CPU exhaustion is blocking his perf fix from deploying → all symptoms match infra timeouts, not logic bugs. See [scan-issues/2026-08-22-scan-02.md](./scan-issues/2026-08-22-scan-02.md). **BLOCKED on Nirav's fix.** |
| 2026-08-22 06:40 | beta | 1 (pre-fix) | 7 (Batch 1) | 0 for Batch 1 + 3 Email/DNS findings | 0 for Batch 1 | 7 for Batch 1 | Scan ref `BB-20260822-F2846A`. Fake keys were NOT in the deployed bundle (Turbopack tree-shook them). Testbed side fixed after this scan. See [scan-issues/2026-08-22-scan-01.md](./scan-issues/2026-08-22-scan-01.md). |

---

## How to add a new row

After every scan:

1. Copy the top row template
2. Fill in the date and scanner version
3. List which batches were tested (e.g. "1, 2, 3")
4. Expected findings = sum of expected findings across all tested batches
5. Actual findings = what BugBuzzer actually reported
6. Working = checks that fired as expected
7. Not working = checks that did NOT fire (misses) OR extra checks that fired when they shouldn't (false alarms)
8. Notes = short description of what broke or improved

---

## When something fails

When a check fails (Not working > 0), also open the batch MD file and update the "Actual scan results" table there with the specific finding that broke.

If a NEW false alarm appears (a check fires when it shouldn't), log it here in the Notes column AND add it to `docs/false-positives.md` (create the file if it doesn't exist yet).
