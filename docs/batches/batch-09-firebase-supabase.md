# Batch 9 — Firebase + Supabase (Phase B — real cloud projects)

**Category:** BaaS Database Security — Firebase, Supabase, exposed datastores
**Master sheet rows:** 9, 11, 12, 13, 14, 259, 261
**BugBuzzer checks tested:** 7
**Date added to testbed:** _pending_
**Status:** ⬜ Pending (Phase B)

---

## Why this is Phase B

These checks probe real Firebase and Supabase REST APIs. We need actual test projects in Firebase and Supabase — not something we can mock in Next.js.

Both have free tiers. Set up throwaway projects specifically for testing.

---

## Vulnerabilities to bake in

### Supabase (4 checks)

| # | Row | Check Name | How to introduce it |
|---|---|---|---|
| 1 | 9 | Supabase table readable without auth (RLS disabled) | Create table `test_users`. Turn OFF Row Level Security. Insert sample rows. |
| 2 | 14 | Supabase Storage bucket publicly accessible | Create bucket `test-bucket`. Set to public. Upload a dummy file. |
| 3 | 259 | Supabase Edge Function / RPC callable by anon | Create edge function with `verify_jwt = false`. Deploy. |
| 4 | 261 | Unauthenticated exposed datastore | Overlaps with above — Supabase Postgres accessible via anon key. |

### Firebase (3 checks)

| # | Row | Check Name | How to introduce it |
|---|---|---|---|
| 5 | 11 | Firebase RTDB open (.read) | Set database rules: `{ ".read": true, ".write": false }` |
| 6 | 12 | Firestore collection publicly readable | Set Firestore rules: `allow read: if true;` on one collection |
| 7 | 13 | Firebase Storage bucket publicly accessible | Set storage rules to allow public read |

### Wire into testbed

Update `lib/fake-secrets.ts` in the main Next.js testbed to include the REAL Supabase URL + anon key AND real Firebase config. This lets Batch 1's secret-in-bundle checks fire on the actual (safe) test credentials, AND the Batch 9 checks fire when BugBuzzer probes those endpoints.

---

## Setup notes

- Supabase project: `bb-testbed-supabase` — separate account, throwaway email
- Firebase project: `bb-testbed-firebase` — separate account
- Free tier only — set spending caps at $0
- Rotate credentials monthly
- Warning message in table: `WARNING: This is a BugBuzzer testbed. Data is public by design.`

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
| 5 | Detected | | ⬜ |
| 6 | Detected | | ⬜ |
| 7 | Detected | | ⬜ |

---

## Regression watch

_Fill in after first successful scan._
