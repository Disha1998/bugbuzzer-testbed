# BugBuzzer Testbed — Documentation

This project deliberately embeds security vulnerabilities to test the BugBuzzer scanner. Each batch of vulnerabilities is documented so we can verify BugBuzzer detects them correctly.

**Live testbed URL:** https://testbed.blockchainhq.xyz

---

## Batches

Progress through the master sheet's 121 checks, one small batch at a time.

| Batch | Category | Checks | Status | Doc |
|---|---|---|---|---|
| 1 | Secrets in JS bundle (core 7) | 7 | ✅ Complete (scan #4, 7/7 detected) | [batch-01](./batches/batch-01-secrets-in-js-bundle.md) |
| 2 | Web hygiene (headers, cookies, SSL, SRI) | 11 | 🟠 Partial — 7/9 verified · 2 open fixes · 3 deferred to Phase B | [batch-02](./batches/batch-02-web-hygiene.md) |
| 3 | JavaScript runtime errors | 5 | 🔴 Blocked — Vercel bot protection blocks scanner (Fix A in backlog) | [batch-03](./batches/batch-03-js-runtime-errors.md) |
| 4 | Public file exposure | 8 | 🚀 Live — awaiting first scan (row 5 needs Vercel "Protected Sourcemaps" OFF) | [batch-04](./batches/batch-04-public-file-exposure.md) |
| 5 | Auth & admin panels | 13 | ⬜ Pending | [batch-05](./batches/batch-05-auth-admin-panels.md) |
| 6 | Injection probes (SSTI, XSS, SQLi, eval) | 8 | ⬜ Pending | [batch-06](./batches/batch-06-injection-probes.md) |
| 6b | Extended secrets (V6 bundle + AI + webhooks) | 20 | ⬜ Pending | [batch-06b](./batches/batch-06b-extended-secrets.md) |
| 7 | WordPress (needs separate WP install) | 7 | ⬜ Phase B | [batch-07](./batches/batch-07-wordpress-cves.md) |
| 8 | Apache CVEs (needs separate VPS) | 2 | ⬜ Phase B | [batch-08](./batches/batch-08-apache-cves.md) |
| 9 | Firebase + Supabase (real cloud) | 7 | ⬜ Phase B | [batch-09](./batches/batch-09-firebase-supabase.md) |
| 10 | AWS S3 (real buckets) | 4 | ⬜ Phase B | [batch-10](./batches/batch-10-aws-s3.md) |

**Phase A total (Batches 1-6b):** ~72 checks — all live in this single Next.js app.
**Phase B total (Batches 7-10 + deferred rows):** ~20-25 checks — need additional targets (Hostinger VPS, WordPress, throwaway domain, cloud accounts). Tracked in [`phase-b-backlog.md`](./phase-b-backlog.md).

---

## Phase A / Phase B strategy

We split testing into two phases to avoid infrastructure setup overhead per batch:

- **Phase A (current)** — all checks that fit on this single Next.js/Vercel testbed. Fast iteration, one deploy per push, no external accounts needed. Runs through Batches 1-6b.
- **Phase B (later)** — one focused session with real infrastructure. Sets up Hostinger VPS + one throwaway domain + cloud accounts, then knocks out rows from multiple batches at once (Batch 2 rows 20/21/50 + Batches 7/8/9/10 + any deferred rows we hit along the way).

Every row deferred from Phase A gets logged to [`phase-b-backlog.md`](./phase-b-backlog.md) with resource-specific setup steps. Nothing is skipped forever — deferred just means "batched with other rows that need the same setup".

---

## Other docs

- [**Master checklist**](./checks-master-checklist.md) — **all 121 checks in one file**, with status per check. Read this first to see what's done, pending, or missing
- [**Testbed fixes backlog**](./testbed-fixes-backlog.md) — **every open fix across all batches, prioritized with steps + verification**. Read before every fix session
- [Scan log](./scan-log.md) — every scan run + result
- [Testing guide](./testing-guide.md) — how to run BugBuzzer against this testbed + branch-per-batch workflow
- [Phase B backlog](./phase-b-backlog.md) — every deferred row with resource-specific setup steps
- [How to verify manually](./how-to-verify-manually.md) — 5 independent ways to prove the testbed is scanner-ready (no need to trust Claude)
- [Safety notes](./safety.md) — do-not-abuse warnings, fake-data rules
- [Scan issues](./scan-issues/) — per-scan failure analysis + evidence packs

---

## Status legend

- ⬜ Pending — batch not started
- 🚀 Live — deployed to testbed, awaiting first scan
- 🟠 Partial — some rows verified, some rows have known open fixes in [testbed-fixes-backlog.md](./testbed-fixes-backlog.md)
- 🔴 Blocked — deployed but scan cannot verify due to external issue (e.g., scanner is blocked from reaching the site)
- ✅ Complete — all checks in the batch detected correctly (100% pass on latest scan)
- 🟣 Regression — a previously-passing check has started failing
