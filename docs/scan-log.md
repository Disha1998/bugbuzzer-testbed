# Scan Log

Every scan run against `https://testbed.blockchainhq.xyz` is logged here. New rows go on top (newest first).

Purpose:
- Catch regressions over time
- Show which BugBuzzer version was tested on which date
- Track false positives + false negatives across scans

---

## Log

| Date | BugBuzzer version | Batches tested | Total expected | Total found | Passing | Failing | Notes |
|---|---|---|---|---|---|---|---|
| 2026-08-24 03:12 | beta (Nirav fix live) | 1 | 7 (Batch 1) | 2 detections for Batch 1 (both row 5) + 3 real hygiene findings | 1 for Batch 1 (row 5) | 6 for Batch 1 (rows 1-4, 6, 7) | Scan ref BB-20260824-**F2B412**. **Infra fully recovered — 0 errored, scan in 53 seconds.** Row 5 (JWT secret) fired both `jwt_secret` + `nextauth_secret` findings with correct evidence + entropy. Other 6 rows blocked by BugBuzzer's `looksLikePlaceholder` filter (bundle-secrets.ts:47) — our fake values contain the word "FakeTestbed" which correctly reads as a placeholder. Fix: regenerate all fake values as pure random garbage (no "Fake"/"Test"/"example" words). See [scan-issues/2026-08-24-scan-03.md](./scan-issues/2026-08-24-scan-03.md). |
| 2026-08-22 (local) | n/a — local regex simulation | 1 | 7 (Batch 1) | 7 patterns matched on live deploy | 7 for Batch 1 | 0 | **No beta scan** — extracted BugBuzzer's real regex patterns from `packages/check-sdk/src/bundle-secret-extract.ts` and ran them against fetched HTML+JS from `https://testbed.blockchainhq.xyz/` (~587 KB). All 7 rows produced matches. Row 5 (JWT secret) additionally verified against the check's full logic (assignment regex + name filter + entropy ≥4.0). **Missed catching the `looksLikePlaceholder` filter — regex match is necessary but not sufficient. Post-scan-03 lesson: local verification must also simulate the placeholder filter.** Fixes applied same day: GitHub `ghp_` shortened to exactly 36 chars, Supabase JWT `iss=supabase`, JWT secret moved to `jwt_secret`/`nextauth_secret` named exports + inline `var` assignments. See batch-01 MD "Local regex verification" section. |
| 2026-08-22 09:25 | beta | 1 (post-fix) | 7 (Batch 1) | 0 for Batch 1 + 3 Email/DNS findings | 0 for Batch 1 | 7 for Batch 1 | Scan ref BB-20260822-**24C73A**. Testbed fake keys confirmed in bundle via DevTools BEFORE this scan. **Same result as scan #1** — 7 Batch 1 false negatives, 66 errored, 8 skipped. Nirav confirmed VPS CPU exhaustion is blocking his perf fix from deploying → all symptoms consistent with infra timeouts, not logic bugs. See [scan-issues/2026-08-22-scan-02.md](./scan-issues/2026-08-22-scan-02.md). **BLOCKED on Nirav's fix.** |
| 2026-08-22 06:40 | beta | 1 (pre-fix) | 7 (Batch 1) | 0 for Batch 1 + 3 Email/DNS findings | 0 for Batch 1 | 7 for Batch 1 | Scan ref BB-20260822-**F2846A**. Fake keys NOT in deployed bundle (Turbopack tree-shook them). Testbed side fixed after this scan. See [scan-issues/2026-08-22-scan-01.md](./scan-issues/2026-08-22-scan-01.md). |

---

## How to add a new row

After every scan:

1. Copy the top row template
2. Fill in the date and BugBuzzer version
3. List which batches were tested (e.g. "1, 2, 3")
4. Total expected = sum of expected findings across all tested batches
5. Total found = actual findings BugBuzzer reported
6. Passing = checks that fired as expected
7. Failing = checks that did NOT fire (false negatives) OR extra checks that fired unexpectedly (false positives)
8. Notes = short description of what broke or improved

---

## Failure detail

When a check fails (Failing > 0), also open the batch MD file and update the "Actual scan results" table there with the specific finding that broke.

If a NEW false positive appears (a check fires that shouldn't), log it here in the Notes column AND add to `docs/false-positives.md` (create the file if it doesn't exist yet).
