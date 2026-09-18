# BugBuzzer Testbed — Docs

This is our test website. We put fake security problems on it on purpose. Then we run the BugBuzzer scanner and check if it finds all of them. Every set of fake problems is called a "batch," and every batch has its own notes file.

**Live website:** https://testbed.blockchainhq.xyz — runs on our Hostinger server (`76.13.179.65`) since 2026-09-02. It's a Docker container behind nginx. Full setup steps in [hostinger-deployment.md](./hostinger-deployment.md).

---

## Batches

We work through the master list of 121 checks in small batches so nothing gets missed.

| Batch | What it tests | # of checks | Where we are | Notes file |
|---|---|---|---|---|
| 1 | Secrets left in the JavaScript bundle (main 7) | 7 | ✅ Done — all 7 work | [batch-01](./batches/batch-01-secrets-in-js-bundle.md) |
| 2 | Web hygiene (headers, cookies, SSL, SRI) | 11 | 🟠 Partly working — 7 done, 2 need small fixes, 3 paused for Phase B | [batch-02](./batches/batch-02-web-hygiene.md) |
| 3 | JavaScript errors on page load | 5 | ✅ 4 out of 5 work · 1 needs a page fix (see Fix K) | [batch-03](./batches/batch-03-js-runtime-errors.md) |
| 4 | Files that should not be public | 8 | 🟠 Partly working — 5 done, 3 need fixes (see Fix F, G, I) | [batch-04](./batches/batch-04-public-file-exposure.md) |
| 5 | Admin panels + auth problems | 14 | 🟠 Partly working — 5 done, 8 need small tweaks (see Fix L), 1 paused | [batch-05](./batches/batch-05-auth-admin-panels.md) |
| 6 | Injection problems (XSS, SQLi, eval, template, etc.) | 10 | 🟠 Partly working — 4 done, 6 need small tweaks (see Fix M) | [batch-06](./batches/batch-06-injection-probes.md) |
| 6b | More secrets (AI providers, webhooks, more categories) | 22 | 🟠 Partly working — 10 done, 12 need vendor format tweaks (see Fix N) | [batch-06b](./batches/batch-06b-extended-secrets.md) |
| 7 | WordPress problems (needs real WordPress install) | 7 | ⏸️ Paused for Phase B | [batch-07](./batches/batch-07-wordpress-cves.md) |
| 8 | Apache problems (needs Apache instead of nginx) | 2 | ⏸️ Paused for Phase B | [batch-08](./batches/batch-08-apache-cves.md) |
| 9 | Firebase + Supabase (real cloud) | 6 | 🟠 Partly working — 2 Firebase checks work as CRITICAL. 3 Supabase checks are stuck because of a scanner bug (see Fix P). 1 paused (needs credit card). | [batch-09](./batches/batch-09-firebase-supabase.md) |
| 10 | AWS S3 buckets (needs paid AWS plan) | 5 | ⏸️ Skipped 2026-09-08 — AWS Free Plan doesn't unlock S3 with public buckets. Come back later with a virtual card. | [batch-10](./batches/batch-10-aws-s3.md) |

**Phase A total (Batches 1-6b):** about 72 checks. All of these live on this one Next.js website.
**Phase B total (Batches 7-10 + some rows we paused from earlier):** about 20-25 checks. These need extra setup — a WordPress install, an Apache server, cloud accounts, etc. All the paused rows are tracked in [`phase-b-backlog.md`](./phase-b-backlog.md).

---

## Why we split things into Phase A and Phase B

Because it's much faster.

- **Phase A (what we're mostly doing now):** every check that fits on one Next.js website. One push, one deploy, no extra accounts needed. Covers Batches 1-6b.
- **Phase B (comes later):** one focused session where we set up all the extra infrastructure (VPS, WordPress, throwaway domain, cloud accounts) at once. Then we knock out a bunch of Phase B rows together instead of one at a time.

Every check we push to Phase B gets a note in [`phase-b-backlog.md`](./phase-b-backlog.md) with the setup steps needed. Nothing is skipped forever — "paused" just means "we'll do it when we have the other Phase B stuff set up."

---

## Other important files

- [**Master checklist**](./checks-master-checklist.md) — **all 121 checks in one place**, with the current status of each. Read this first to see what's done and what's not.
- [**Fixes backlog**](./testbed-fixes-backlog.md) — **every open problem, sorted by priority, with steps to fix**. Read this before you sit down to fix things.
- [Scan log](./scan-log.md) — every scan we've run, with the result
- [Testing guide](./testing-guide.md) — how to run BugBuzzer against this testbed + our branch workflow
- [Phase B backlog](./phase-b-backlog.md) — every paused check with setup steps
- [How to verify manually](./how-to-verify-manually.md) — 5 ways to prove the testbed is set up right without trusting Claude
- [Safety notes](./safety.md) — don't-abuse warnings, fake-data rules
- [Scan issues](./scan-issues/) — per-scan analysis and evidence

---

## What the status words mean

- ⬜ Pending — we haven't started this batch yet
- 🚀 Live — code is pushed and deployed, waiting for the first scan
- 🟠 Partly working — some checks work, some still need small fixes (all fixes tracked in [testbed-fixes-backlog.md](./testbed-fixes-backlog.md))
- 🔴 Blocked — code is deployed but the scanner can't reach it (e.g., something is blocking the scan)
- ✅ Done — every check in the batch works correctly on the latest scan
- 🟣 Went backwards — a check that used to work is now failing (needs a look)
