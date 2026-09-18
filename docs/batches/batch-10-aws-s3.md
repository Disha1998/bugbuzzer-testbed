# Batch 10 — AWS S3 (Phase B — needs real AWS buckets)

## 📋 Where we are — 2026-09-08 (skipped for now)

**Is this batch done? NO — SKIPPED, all 5 checks paused.**

We tried to set this batch up but hit AWS's paid-plan wall. Full story below.

### What we tried on 2026-09-07 and 2026-09-08

1. Disha signed into an existing AWS account ("test ai generated imgs")
2. AWS put the account on their new **Free Plan** trial ($100 credits + 6 months)
3. We revoked the UPI mandate for safety (so AWS can't auto-charge us)
4. Tried to open the S3 dashboard
5. AWS redirected us to "Complete your account setup" page
6. Even after checking every payment setting, S3 stayed blocked
7. Root cause: **AWS's Free Plan does not include S3 with public buckets.** To unlock S3, AWS wants us to click "Upgrade plan" and add a full paid payment method.

### Why we're skipping

Disha's rule: **no rupees spent on this test setup.** AWS won't unlock S3 for public-bucket testing without a full paid account. So we can't do this batch on the current AWS setup.

### What we're skipping (all 5 checks)

| # | Check name | Why we can't test it |
|---|---|---|
| 1 | `aws-s3-bucket-public-write-access` | Needs a real S3 bucket with public write turned on. Needs paid AWS. |
| 2 | `aws-s3-bucket-acl-publicly-readable` | Needs a real S3 bucket with public ACL grant. Needs paid AWS. |
| 3 | `aws-s3-bucket-policy-publicly-readable` | Needs a real S3 bucket with a public bucket policy. Needs paid AWS. |
| 4 | `aws-s3-bucket-public-listing-enabled` | Needs a real S3 bucket where the file listing is public. Needs paid AWS. |
| 5 | `aws-s3-bucket-name-leaked-in-js-bundle` | Only needs fake bucket URLs in our website's JS bundle. Doesn't need real AWS. We chose to skip this too for now to keep the batch together — we can revisit anytime with a 10-minute code change. |

### When we come back to this batch

We'll pick it up again when Disha has a **virtual card with a spending limit** (from Fi Money, Slice, Jupiter, or her bank). A virtual card lets us:
- Add a payment method to AWS without any real billing risk
- Unlock S3 by upgrading the AWS plan
- Do all 5 Batch 10 checks quickly
- Delete everything after testing
- Zero real money at risk (card has a fixed low limit)

Estimated time when we come back: ~1 hour (10 min virtual card + 30 min bucket setup + 20 min testing).

### One check we can partly do without AWS

Check #5 (`aws-s3-bucket-name-leaked-in-js-bundle`) only needs plausible-looking S3 URLs in our website code. No real bucket needed. We chose to defer it too, so all 5 Batch 10 checks are together in one "come back later" state.

If you change your mind and want that 1 check done now, tell me and I'll add fake S3 URLs to the testbed in 10 minutes.

---

- **Category:** AWS S3 bucket problems
- **Rows on master sheet:** 157, 158, 159, 167
- **Checks tested:** 5
- **Deployed on:** _not yet — SKIPPED 2026-09-08_
- **Status:** ⏸️ Paused — AWS Free Plan doesn't include S3 with public buckets. Needs upgrade to paid plan.

---

## Why this is paused for Phase B

These checks probe real AWS S3 endpoints. We need actual test buckets that are set up wrong on purpose. And AWS only unlocks S3 on paid plans, not free plans.

⚠️ **BE CAREFUL — a public-write bucket can be abused for uploading illegal content. Set hard billing alerts.**

---

## What we'll plant (when we come back)

Create a fresh AWS account (or use existing with virtual card). Then create 3 test buckets:

| # | Row | Check name | How to plant it |
|---|---|---|---|
| 1 | 157 | S3 bucket public write access | Bucket `bb-testbed-public-write` — set ACL to `public-read-write` |
| 2 | 158 | S3 bucket ACL publicly readable | Bucket `bb-testbed-acl-public` — set ACL grant `READ_ACP` to `AllUsers` |
| 3 | 159 | S3 bucket policy publicly readable | Bucket `bb-testbed-policy-public` — attach a public bucket policy |
| 4 | 167 | S3 bucket name leaked in frontend code | Add bucket names to `lib/fake-secrets.ts` in the main Next.js testbed |

---

## Safety setup — MANDATORY (when we come back)

**Before you create any buckets:**

- Use a virtual card with a low limit (₹500 or so) — safest option
- Set AWS billing alerts at $5, $10, $25, $50
- Set an AWS Budget with a hard cap at $50/month
- Turn on CloudTrail logging on all 4 buckets
- Add a `README.txt` file inside each bucket: `THIS BUCKET IS A BUGBUZZER TESTBED. Do not upload sensitive data. Contents may be deleted at any time.`
- Set an S3 lifecycle rule: delete all objects older than 7 days
- Public-write bucket: check daily for abuse content. Delete anything you didn't put there.

---

## What we expect the scanner to find (when we come back)

_Fill in after setup._

---

## What to tell real users (fix guidance)

_Fill in when we implement this._

---

## Actual scan results

| Check # | Expected | Actual | Status |
|---|---|---|---|
| 1 | Detected | | ⏸️ Paused |
| 2 | Detected | | ⏸️ Paused |
| 3 | Detected | | ⏸️ Paused |
| 4 | Detected | | ⏸️ Paused |

---

## Regression watch

_Fill in after first successful scan._
