# Batch 2 — Web Hygiene (Headers, Cookies, SSL, SRI)

**Category:** Web Hygiene — headers, cookies, SSL, DNS, SRI
**Master sheet rows:** 19, 20, 21, 24, 28, 30, 50, 53, 54, 55, 88
**BugBuzzer checks tested:** 11 total (2 free, 6 add-code, 1 bonus, 3 deferred to Phase B)
**Branch:** `batch-02-web-hygiene`
**Date added to testbed:** 2026-08-26
**Status:** 🟡 In progress — code applied, awaiting first scan on Vercel preview URL

---

## What this batch tests

These are "silent" web-hygiene misconfigurations that break browser security or attract attackers. Users don't see them until something goes wrong.

- Missing security headers (CSP, HSTS, X-Frame-Options, etc.)
- SSL certificate expiring
- Domain registration expiring
- Mixed HTTP content on HTTPS page
- CORS wide open (`Access-Control-Allow-Origin: *`)
- Missing security.txt
- Subdomain takeover risk (dangling CNAMEs)
- Cookies missing HttpOnly / Secure / SameSite flags
- Session tokens with far-future expiry
- Subresource Integrity (SRI) missing on CDN scripts

---

## Scope split — 3 buckets

### Bucket A — Already fires for free (no code needed)

| Row | Check | Why it fires without changes |
|---|---|---|
| 19 | security-headers-missing | Vercel default already omits CSP, HSTS-includeSubDomains, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy — check fires 6 sub-findings |
| 30 | security-txt-missing-or-expired | Testbed has no `/.well-known/security.txt` |

### Bucket B — Code added in this batch (6 rows + 1 bonus)

| # | Row | Check | How it's introduced |
|---|---|---|---|
| 1 | 24 | mixed-content-on-https-page | `<img src="http://example.com/testbed-mixed-content.png">` in `app/page.tsx` (positioned off-screen so it doesn't affect visual layout) |
| 2 | 28 | cors-misconfiguration-overly-permissive | New route `app/api/wide-cors/route.ts` — reflects incoming `Origin` header AND sets `Access-Control-Allow-Credentials: true` (the classic "arbitrary origin reflection with credentials" bug) |
| 3 | 53 | session-cookie-missing-http-only | Root `middleware.ts` sets `sessionid=<random>` with no HttpOnly |
| 4 | 54 | session-cookie-missing-secure | Same cookie, no Secure attribute |
| 5 | 55 | session-cookie-missing-samesite | Same cookie, no SameSite attribute |
| 6 | 88 | sri-missing | `<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js" async />` in `app/layout.tsx` without `integrity=` attribute |
| BONUS | — | session-token-insufficient-expiration | Root `middleware.ts` also sets `authtoken=<JWT>` with payload `{"sub":"testbed-user","iat":1735689600,"exp":4102444800}` — `exp` is Jan 1 2100 (~74 years out) |

### Bucket C — Deferred to Phase B (needs infrastructure beyond current Vercel testbed)

| Row | Check | Why deferred |
|---|---|---|
| 20 | ssl-certificate-issues (expiring soon) | Vercel auto-renews SSL certs — cannot force an "expiring soon" state. Needs Hostinger VPS with certbot auto-renew disabled |
| 21 | domain-registration-expiring-soon | `blockchainhq.xyz` has 443 days until renewal — cannot force imminent expiry without buying a sacrificial domain and waiting ~11 months |
| 50 | subdomain-takeover | Requires a real dangling CNAME on a domain — actually vulnerable while live, and pointing it at unclaimed cloud resources is risky on the main domain. Needs a throwaway domain |

Full setup steps for these 3 are in [`docs/phase-b-backlog.md`](../phase-b-backlog.md).

---

## Files added / edited in this batch

| File | Change | Rows covered |
|---|---|---|
| `middleware.ts` (new, root) | Sets `sessionid` and `authtoken` cookies on every page response | 53, 54, 55, session-token bonus |
| `app/api/wide-cors/route.ts` (new) | GET + OPTIONS handlers reflecting incoming Origin with credentials | 28 |
| `app/layout.tsx` (edited) | Unhashed `<script>` from cdn.jsdelivr.net | 88 |
| `app/page.tsx` (edited) | Off-screen `<img>` with `http://` src | 24 |

Zero external dependencies added.

---

## Expected BugBuzzer scan results

When you run BugBuzzer against the Vercel preview URL (or `https://testbed.blockchainhq.xyz/` after merge), you should see these Batch 2 findings on top of Batch 1's ongoing detections:

| # | Check | Expected finding count | Severity |
|---|---|---|---|
| 1 | security-headers-missing | 6 sub-findings (HSTS-includeSubDomains, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | 2 high + 3 medium + 1 low |
| 2 | security-txt-missing-or-expired | 1 | warning |
| 3 | mixed-content-on-https-page | 1 (http://example.com image) | medium/high |
| 4 | cors-misconfiguration-overly-permissive | 1 (`/api/wide-cors` route) | high |
| 5 | session-cookie-missing-http-only | 1 (sessionid cookie) | medium/high |
| 6 | session-cookie-missing-secure | 1 (sessionid cookie) | medium/high |
| 7 | session-cookie-missing-samesite | 1 (sessionid cookie) | medium/high |
| 8 | session-token-insufficient-expiration | 1 (authtoken JWT with exp = 2100) | medium |
| 9 | sri-missing | 1 (lodash.min.js from cdn.jsdelivr.net) | medium |

**Total expected new findings: ~13** on top of Batch 1's 18. Next scan should show ~31 findings from Batch 1+2.

---

## Suggested fix (for real users) — high-level

For each finding kind, the user-facing report should tell the customer:

- **Missing headers** → set the header in their web server / CDN / framework middleware. Give specific values.
- **Mixed content** → replace `http://` sub-resource URLs with `https://` equivalents.
- **CORS misconfig** → allowlist specific origins instead of reflecting the incoming Origin; never combine wildcard with credentials.
- **Cookies missing flags** → set HttpOnly, Secure, SameSite=Lax (or Strict) on session cookies.
- **JWT far-future exp** → set exp to 15-60 minutes for access tokens; use short-lived access + refresh tokens for longer sessions.
- **SRI missing** → generate integrity hash for each CDN script/style and add `integrity="sha384-…" crossorigin`.

Detailed remediation for each already lives in BugBuzzer's own check code (each check emits its own `remediation` field).

---

## Actual scan results

_Fill in after the first Batch 2 scan._

| Check | Expected | Actual | Status |
|---|---|---|---|
| security-headers-missing | 6 sub-findings | | ⬜ |
| security-txt-missing | 1 | | ⬜ |
| mixed-content-on-https-page | 1 | | ⬜ |
| cors-misconfiguration-overly-permissive | 1 | | ⬜ |
| session-cookie-missing-http-only | 1 | | ⬜ |
| session-cookie-missing-secure | 1 | | ⬜ |
| session-cookie-missing-samesite | 1 | | ⬜ |
| session-token-insufficient-expiration | 1 | | ⬜ |
| sri-missing | 1 | | ⬜ |

---

## Regression watch

If any of these findings stops appearing on a future scan, investigate:

- Did Vercel or Next.js start emitting one of the missing security headers by default?
- Did the `middleware.ts` matcher change and stop setting cookies?
- Did the CDN script get removed from layout or SRI accidentally added?
- Did the mixed-content image get removed?
- Did the `/api/wide-cors` route disappear or the CORS headers get tightened?
- Did the cookie name change from `sessionid` (breaking session-cookie name recognition)?
