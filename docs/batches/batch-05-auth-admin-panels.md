# Batch 5 — Auth, Access & Admin Panels

**Category:** Auth bypass, admin panel exposure, rate limiting, session handling
**Master sheet rows:** 23, 77, 78, 79, 115, 128, 132, 134, 137, 145, 148, 151, 181
**BugBuzzer checks tested:** 13
**Date added to testbed:** _pending_
**Status:** ⬜ Pending

---

## What this batch tests

The most dangerous silent-failure category. Auth code changes frequently and breaks silently — user thinks their admin panel is protected, but it isn't.

---

## Vulnerabilities to bake in

| # | Row | Check Name | How to introduce it |
|---|---|---|---|
| 1 | 23 | Open redirect vulnerability | Add `/api/redirect?url=<external>` route that 302s without validation |
| 2 | 77 | Admin panel accessible without auth | Add `/admin` page with no auth middleware — just renders admin UI |
| 3 | 78 | GraphQL introspection enabled in production | Add `/api/graphql` route with introspection ON |
| 4 | 79 | Exposed developer tools without auth | Add `/grafana`, `/jenkins`, `/kibana` mock pages returning tool signatures |
| 5 | 115 | Framework debug mode enabled in production | Add `/debug` page rendering Next.js dev overlay content |
| 6 | 128 | Unauthenticated API endpoint access | Add `/api/users`, `/api/admin/settings` returning data without auth |
| 7 | 132 | JWT weak secret brute force | Return a JWT signed with the weak `jwt_secret` from Batch 1 fake keys — hashcat can crack in seconds |
| 8 | 134 | OAuth state parameter missing | Add an OAuth login link that omits `state=` parameter |
| 9 | 137 | Missing rate limiting on login | Add `/api/login` that accepts unlimited requests, always returns 401 or 200 |
| 10 | 145 | Next.js Server Actions exposed as public endpoints | Add a `"use server"` function that mutates data without auth check |
| 11 | 148 | Default credentials on services | Add fake mock endpoints suggesting `admin:admin` works |
| 12 | 151 | Password reset poisoning via Host header | Add `/api/reset-password` that echoes back `Host` header in the reset URL |
| 13 | 181 | Insufficient session / token expiration | Return a JWT with no `exp` claim or exp = 100 years out |

---

## Expected BugBuzzer scan results

_Fill in after implementation._

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
| 8 | Detected | | ⬜ |
| 9 | Detected | | ⬜ |
| 10 | Detected | | ⬜ |
| 11 | Detected | | ⬜ |
| 12 | Detected | | ⬜ |
| 13 | Detected | | ⬜ |

---

## Regression watch

_Fill in after first successful scan._
