# Batch 9 — Firebase + Supabase (Phase B — real cloud projects)

**Category:** BaaS Database Security — Firebase, Supabase, exposed datastores
**Master sheet rows:** 9, 11, 12, 13, 14, 259, 261
**BugBuzzer checks tested:** 7
**Date added to testbed:** 2026-09-04
**Status:** 🟠 Partly working — 2 checks out of 6 are firing. Both Firebase checks work great (CRITICAL findings). 3 Supabase checks look like they failed, but they didn't — the BugBuzzer scan tool has a bug that stopped it from checking them properly. We need to tell the BugBuzzer team. The last 1 (Firebase Storage) is paused because Firebase wants a credit card to enable it.

---

## Where we are right now (last updated 2026-09-05, after scan #20)

**Short version:** 2 checks work great, 3 checks are stuck because of a scanner bug (not our fault), 1 check is paused. Whole batch is done as far as we can take it on our side.

### 2 checks that worked ✅

1. **Firestore collection publicly readable** — CRITICAL finding. The scanner asked Firestore for data without a password and got data back.
2. **Firebase Realtime Database readable without auth** — CRITICAL finding. Same idea — scanner asked for data with no password and got `{"users":true}` back.

Both are exactly what we wanted. Big win.

### 3 checks that look failed but aren't really failed 🟡

These 3 Supabase things are actually unsafe, but the scanner never really tested them. It made a wrong guess and gave up.

- **Supabase table readable without auth** (`users_public`)
- **Supabase storage bucket publicly accessible** (`public-uploads`)
- **Supabase RPC callable by anon** (`get_public_data`)

**What the scanner said:** "Supabase changed their default in April 2026 to block anon requests, so these checks won't work."

**What is actually true:** We tested each one by hand with `curl`. The table gives back the fake alice row. The RPC gives back the fake string. Everything is open to anyone, just like we planned. The scanner's guess was wrong.

**Why this is not our fault:** We double-checked our Supabase settings. The Data API is ON. Both schemas are shared. Everything is set up correctly. The bug is in the BugBuzzer scan tool itself.

**What we do about it:** We tell the BugBuzzer team about the bug. We wrote out the exact message to send them — see `testbed-fixes-backlog.md`, look for the section called **"Fix P"**. Once the team fixes their tool, the next scan should find all 3 problems.

### 1 check that is paused ⬜

- **Firebase Storage bucket publicly accessible** — Firebase now asks for a credit card before you can make any storage bucket, even a free one. Not worth adding a card just to test one check. We already test the same idea on Supabase Storage, so we are not missing much.

---

### What we built on the Firebase side

- Firebase project name: `bugbuzzer-testbed-fb` (free plan)
- Web app registered inside the project, config saved in the file `lib/phase-b-real-configs.ts`
- **Firestore database** — one collection called `User`, one fake user doc with email `alice@fake-testbed.example`, rules set to "test mode" so anyone can read for 30 days
- **Realtime Database** — one node `users/1` with the same fake alice data, also on "test mode" rules
  - The database URL is `https://bugbuzzer-testbed-fb-default-rtdb.firebaseio.com`
- Firebase Storage is skipped (needs credit card, see above)

### What we built on the Supabase side

- Supabase project name: `bugbuzzer-testbed-sb` (free plan)
- Project URL and anon key saved in the same file `lib/phase-b-real-configs.ts`
- **Table** called `users_public` — Row Level Security is turned OFF, 1 fake alice row inside
- **Storage bucket** called `public-uploads` — "Public" toggle is ON, 1 small file uploaded
- **RPC function** called `get_public_data` — returns a small fake string, anyone can call it without a password

### How we connected all of this to the testbed website

- File `lib/phase-b-real-configs.ts` holds all the real Firebase + Supabase details
- File `components/batch-9-phase-b-configs.tsx` puts those details right into the page HTML so the scanner can find them
- The component is mounted at the bottom of `app/page.tsx`
- A card for Batch 9 was added to the batches list on the homepage

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
