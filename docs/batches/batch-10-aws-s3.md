# Batch 10 — AWS S3 (Phase B — needs real AWS buckets)

- **Category:** AWS S3 bucket misconfigurations
- **Rows on master sheet:** 157, 158, 159, 167
- **Checks tested:** 4
- **Deployed on:** _not yet_
- **Status:** ⏸️ Paused (Phase B)

---

## Why this is paused for Phase B

These checks probe real AWS S3 endpoints. We need actual test buckets that are set up wrong on purpose.

⚠️ **BE CAREFUL — a public-write bucket can be abused for uploading illegal content. Set hard billing alerts.**

---

## What we'll plant

Create a fresh AWS account (throwaway email, no production access). Then create 4 test buckets:

| # | Row | Check name | How to plant it |
|---|---|---|---|
| 1 | 157 | S3 bucket public write access | Bucket `bb-testbed-public-write` — set ACL to `public-read-write` |
| 2 | 158 | S3 bucket ACL publicly readable | Bucket `bb-testbed-acl-public` — set ACL grant `READ_ACP` to `AllUsers` |
| 3 | 159 | S3 bucket policy publicly readable | Bucket `bb-testbed-policy-public` — attach a public bucket policy |
| 4 | 167 | S3 bucket name leaked in frontend code | Add bucket names to `lib/fake-secrets.ts` in the main Next.js testbed |

---

## Safety setup — MANDATORY

**Before you create any buckets:**

- Set AWS billing alerts at $5, $10, $25, $50
- Set an AWS Budget with a hard cap at $50/month
- Turn on CloudTrail logging on all 4 buckets
- Add a `README.txt` file inside each bucket: `THIS BUCKET IS A BUGBUZZER TESTBED. Do not upload sensitive data. Contents may be deleted at any time.`
- Set an S3 lifecycle rule: delete all objects older than 7 days
- Public-write bucket: check daily for abuse content. Delete anything you didn't put there.

---

## What we expect the scanner to find

_Fill in after setup._

---

## What to tell real users (fix guidance)

_Fill in when we implement this._

---

## Actual scan results

| Check # | Expected | Actual | Status |
|---|---|---|---|
| 1 | Detected | | ⬜ |
| 2 | Detected | | ⬜ |
| 3 | Detected | | ⬜ |
| 4 | Detected | | ⬜ |

---

## Regression watch

_Fill in after first successful scan._
