# BugBuzzer Testbed — Documentation

This project deliberately embeds security vulnerabilities to test the BugBuzzer scanner. Each batch of vulnerabilities is documented so we can verify BugBuzzer detects them correctly.

**Live testbed URL:** https://testbed.blockchainhq.xyz

---

## Batches

Progress through the master sheet's 121 checks, one small batch at a time.

| Batch | Category | Checks | Status | Doc |
|---|---|---|---|---|
| 1 | Secrets in JS bundle (core 7) | 7 | 🟡 1/7 detected (scan #3) — fixing placeholder-word issue | [batch-01](./batches/batch-01-secrets-in-js-bundle.md) |
| 2 | Web hygiene (headers, cookies, SSL, SRI) | 11 | ⬜ Pending | [batch-02](./batches/batch-02-web-hygiene.md) |
| 3 | JavaScript runtime errors | 5 | ⬜ Pending | [batch-03](./batches/batch-03-js-runtime-errors.md) |
| 4 | Public file exposure | 8 | ⬜ Pending | [batch-04](./batches/batch-04-public-file-exposure.md) |
| 5 | Auth & admin panels | 13 | ⬜ Pending | [batch-05](./batches/batch-05-auth-admin-panels.md) |
| 6 | Injection probes (SSTI, XSS, SQLi, eval) | 8 | ⬜ Pending | [batch-06](./batches/batch-06-injection-probes.md) |
| 6b | Extended secrets (V6 bundle + AI + webhooks) | 20 | ⬜ Pending | [batch-06b](./batches/batch-06b-extended-secrets.md) |
| 7 | WordPress (needs separate WP install) | 7 | ⬜ Phase B | [batch-07](./batches/batch-07-wordpress-cves.md) |
| 8 | Apache CVEs (needs separate VPS) | 2 | ⬜ Phase B | [batch-08](./batches/batch-08-apache-cves.md) |
| 9 | Firebase + Supabase (real cloud) | 7 | ⬜ Phase B | [batch-09](./batches/batch-09-firebase-supabase.md) |
| 10 | AWS S3 (real buckets) | 4 | ⬜ Phase B | [batch-10](./batches/batch-10-aws-s3.md) |

**Phase A total (Batches 1-6b):** ~72 checks — all live in this single Next.js app.
**Phase B total (Batches 7-10):** ~20 checks — need additional targets (WordPress, VPS, cloud accounts). Add later.

---

## Other docs

- [Scan log](./scan-log.md) — every scan run + result
- [Testing guide](./testing-guide.md) — how to run BugBuzzer against this testbed
- [How to verify manually](./how-to-verify-manually.md) — 5 independent ways to prove the testbed is scanner-ready (no need to trust Claude)
- [Safety notes](./safety.md) — do-not-abuse warnings, fake-data rules
- [Scan issues](./scan-issues/) — per-scan failure analysis + evidence packs

---

## Status legend

- ⬜ Pending — batch not started
- 🟡 In progress — vulnerabilities added, verifying scan detection
- ✅ Complete — all checks in the batch detected correctly (100% pass on latest scan)
- 🔴 Regression — a previously-passing check has started failing
