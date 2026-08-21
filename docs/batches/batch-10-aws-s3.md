# Batch 10 — AWS S3 (Phase B — real AWS buckets)

**Category:** AWS S3 Bucket misconfigurations
**Master sheet rows:** 157, 158, 159, 167
**BugBuzzer checks tested:** 4
**Date added to testbed:** _pending_
**Status:** ⬜ Pending (Phase B)

---

## Why this is Phase B

These checks probe real AWS S3 endpoints. We need actual test buckets with intentional misconfigurations.

⚠️ **HIGH CARE — public-write bucket can be abused.** Set hard billing alerts.

---

## Vulnerabilities to bake in

Create a fresh AWS account (throwaway email, no production access). Create 4 test buckets:

| # | Row | Check Name | How to introduce it |
|---|---|---|---|
| 1 | 157 | S3 bucket public write access | Bucket `bb-testbed-public-write` — set ACL to `public-read-write` |
| 2 | 158 | S3 bucket ACL publicly readable | Bucket `bb-testbed-acl-public` — set ACL grant `READ_ACP` to `AllUsers` |
| 3 | 159 | S3 bucket policy publicly readable | Bucket `bb-testbed-policy-public` — attach public bucket policy |
| 4 | 167 | S3 bucket name leaked in frontend code | Add bucket names to `lib/fake-secrets.ts` in main Next.js testbed |

---

## Safety setup — MANDATORY

**Before creating any buckets:**

- Set AWS billing alert at $5, $10, $25, $50
- Set AWS Budget: hard cap at $50/month
- Enable CloudTrail logging on all 4 buckets
- Add a `README.txt` file inside each bucket: `THIS BUCKET IS A BUGBUZZER TESTBED. Do not upload sensitive data. Contents may be deleted at any time.`
- Set S3 lifecycle rule: delete all objects older than 7 days
- Public-write bucket: check daily for abuse content. Delete anything you didn't put there.

---

## Expected BugBuzzer scan results

_Fill in after setup._

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

---

## Regression watch

_Fill in after first successful scan._
