# Batch 9 — Firebase + Supabase (Phase B — real cloud projects)

**Category:** BaaS Database Security — Firebase, Supabase, exposed datastores
**Master sheet rows:** 9, 11, 12, 13, 14, 259, 261
**BugBuzzer checks tested:** 7
**Date added to testbed:** 2026-09-04
**Status:** 🚀 Live — Firebase 2/3 + Supabase 3/3 wired in; Firebase Storage deferred (needs Blaze billing). Awaiting first scan.

---

## Status at a glance — 2026-09-04

**Batch complete? DEPLOYED, awaiting first scan — 5 of 6 checks wired in**

**Rows firing (expected):** Firestore public read, RTDB public read, Supabase RLS-off table, Supabase public bucket, Supabase anon RPC.

**Open issues:** Firebase Storage deferred (needs Blaze billing). Fix: leave as Phase B; Supabase Storage covers the "public bucket" concept in-scan.

### Firebase side (2 of 3 checks)

- ✅ Project: `bugbuzzer-testbed-fb` (Spark free plan)
- ✅ Web app registered — config in `lib/phase-b-real-configs.ts`
- ✅ **Firestore** — `User` collection with fake `alice@fake-testbed.example` doc (test-mode rules, public read/write for 30 days)
- ✅ **Realtime Database** — `users/1` node with fake alice data (test-mode rules)
  - URL: `https://bugbuzzer-testbed-fb-default-rtdb.firebaseio.com`
- ⬜ **Firebase Storage** — **DEFERRED** — Firebase requires Blaze plan (billing enabled) since Nov 2024 to create any storage bucket. Not worth a card for one check; Supabase Storage covers the "public bucket" concept.

### Supabase side (3 of 3 checks)

- ✅ Project: `bugbuzzer-testbed-sb` (Free plan)
- ✅ URL + anon key in `lib/phase-b-real-configs.ts`
- ✅ **Table** — `users_public` with **RLS disabled**, 1 fake alice row
- ✅ **Storage bucket** — `public-uploads` with **Public toggle ON**, 1 fake file uploaded
- ✅ **RPC function** — `get_public_data` returning fake string, SECURITY INVOKER, anon-callable

### Wiring

- ✅ `lib/phase-b-real-configs.ts` — real Firebase + Supabase configs
- ✅ `components/batch-9-phase-b-configs.tsx` — renders configs into JSX + inline JSON + window globals
- ✅ Mounted in `app/page.tsx` at bottom of main
- ✅ Batch 9 card added to BATCHES array with status "Live"

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
| 7 | 13 | Firebase Storage bucket publicly accessible | ⬜ **BLOCKED** — Firebase forces Blaze (billing) to create any bucket. Deferred; will re-enable if we ever move testbed billing to Blaze. |

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
