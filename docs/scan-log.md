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
