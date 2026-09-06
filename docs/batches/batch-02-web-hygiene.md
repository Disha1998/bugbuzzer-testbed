# Batch 2 — Web hygiene (headers, cookies, SSL, SRI)

## 📋 Where we are — 2026-08-26

**Is this batch done? NO ❌**
- **7 out of 9 checks are working** (77%)
- **2 open items (need small testbed fixes):**
  1. **Row 24 — mixed-content-on-https-page** — our `<img src="http://...">` tag gets silently upgraded to `https://` by Chrome before the scanner can see it. Fix: use `<script src="http://...">` instead — Chrome blocks that (doesn't upgrade it) and leaves a console warning the scanner catches.
  2. **Row 28 — cors-misconfiguration-overly-permissive** — our `/api/wide-cors` endpoint really is broken (we tested it with curl). But nothing on the homepage links to it, so the scanner never visits it. Fix: add an `<a href="/api/wide-cors">` link + a `fetch("/api/wide-cors")` call that runs when the page loads.

Plus **3 rows paused for Phase B** (SSL cert expiry / domain expiry / subdomain takeover — need Hostinger VPS + throwaway domain). Tracked in [phase-b-backlog.md](../phase-b-backlog.md).

Last scan: `BB-20260826-E71978` (2026-08-26). 15 Batch 2 findings + 18 Batch 1 findings + 4 environmental + 8 Lodash CVEs (bonus) = 45 findings total. No false alarms.

---

- **Category:** Web hygiene — headers, cookies, SSL, DNS, SRI
- **Rows on master sheet:** 19, 20, 21, 24, 28, 30, 50, 53, 54, 55, 88
- **Checks tested:** 11 total (2 free, 6 need code, 1 bonus, 3 paused for Phase B)
- **Branch:** `batch-02-web-hygiene`
- **Deployed on:** 2026-08-26
- **Status:** 🟡 In progress — code applied, waiting for the next scan

---

## What this batch tests

These are quiet web-hygiene problems that weaken browser security or invite attackers. Users don't see them until something goes wrong.

- Missing security headers (CSP, HSTS, X-Frame-Options, etc.)
- SSL certificate expiring soon
- Domain registration expiring soon
- Mixed HTTP content on an HTTPS page
- CORS wide open (`Access-Control-Allow-Origin: *`)
- Missing `security.txt`
- Subdomain takeover risk (dangling CNAME records)
- Cookies missing HttpOnly / Secure / SameSite flags
- Session tokens that expire way too far in the future
- Third-party CDN scripts without SRI (subresource integrity)

---

## Split into 3 buckets

### Bucket A — Fires for free (nothing to add)

| Row | Check | Why it fires without any changes |
|---|---|---|
| 19 | security-headers-missing | Vercel's default doesn't send CSP, HSTS-includeSubDomains, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy — check fires 6 sub-findings |
| 30 | security-txt-missing-or-expired | Testbed has no `/.well-known/security.txt` |

### Bucket B — We added code for this (6 rows + 1 bonus)

| # | Row | Check | What we did |
|---|---|---|---|
| 1 | 24 | mixed-content-on-https-page | Added `<img src="http://example.com/testbed-mixed-content.png">` in `app/page.tsx` (positioned off-screen so it doesn't affect the visual layout) |
| 2 | 28 | cors-misconfiguration-overly-permissive | Added a new route `app/api/wide-cors/route.ts` that reflects incoming `Origin` headers AND sets `Access-Control-Allow-Credentials: true` (the classic "reflect any origin with credentials" bug) |
| 3 | 53 | session-cookie-missing-http-only | `middleware.ts` sets `sessionid=<random>` with no HttpOnly flag |
| 4 | 54 | session-cookie-missing-secure | Same cookie, no Secure flag |
| 5 | 55 | session-cookie-missing-samesite | Same cookie, no SameSite flag |
| 6 | 88 | sri-missing | `app/layout.tsx` has `<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js" async />` — no `integrity=` attribute |
| BONUS | — | session-token-insufficient-expiration | Middleware also sets `authtoken=<JWT>` where `exp = 4102444800` (Jan 1 2100 — about 74 years out) |

### Bucket C — Paused for Phase B (needs setup we don't have yet)

| Row | Check | Why paused |
|---|---|---|
| 20 | ssl-certificate-issues (expiring soon) | Vercel auto-renews SSL certs — we can't force an "expiring soon" state. Needs a Hostinger VPS with certbot auto-renew turned off. |
| 21 | domain-registration-expiring-soon | Our domain has 443 days until renewal — can't force imminent expiry without buying a throwaway domain and waiting ~11 months. |
| 50 | subdomain-takeover | Requires a real dangling CNAME on a domain — but if it's actually vulnerable while live, and pointing it at unclaimed cloud resources, that's risky on our main domain. Needs a throwaway domain. |

Full setup steps for these 3 are in [`docs/phase-b-backlog.md`](../phase-b-backlog.md).

---

## Files we changed for this batch

| File | Change | Rows covered |
|---|---|---|
| `middleware.ts` (new, root) | Sets `sessionid` and `authtoken` cookies on every page response | 53, 54, 55, session-token bonus |
| `app/api/wide-cors/route.ts` (new) | GET + OPTIONS handlers that reflect the incoming Origin with credentials | 28 |
| `app/layout.tsx` (edited) | Third-party `<script>` from cdn.jsdelivr.net with no integrity hash | 88 |
| `app/page.tsx` (edited) | Off-screen `<img>` with an `http://` src | 24 |

No new dependencies added.

---

## What we expect the scanner to find

When you run BugBuzzer against the testbed, you should see these Batch 2 findings on top of Batch 1's ongoing detections:

| # | Check | Expected findings | Severity |
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

**Total expected new findings: ~13** on top of Batch 1's 18. Next scan should show ~31 findings from Batch 1 + 2 combined.

---

## What to tell real users (fix guidance)

For each finding kind, the scan report should tell the customer:

- **Missing headers** → add the header in your web server, CDN, or framework middleware. Give specific values.
- **Mixed content** → replace `http://` sub-resource URLs with `https://` versions.
- **CORS misconfig** → allow specific origins by name instead of reflecting whatever comes in. Never combine wildcard with credentials.
- **Cookies missing flags** → set HttpOnly, Secure, and SameSite=Lax (or Strict) on session cookies.
- **JWT far-future exp** → set `exp` to 15-60 minutes for access tokens. Use short-lived access tokens + refresh tokens for longer sessions.
- **SRI missing** → generate an integrity hash for each CDN script/style and add `integrity="sha384-…" crossorigin`.

Detailed fixes for each already live in BugBuzzer's own check code — every check emits its own `remediation` field.

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

If any of these findings stops firing on a future scan, check:

- Did Vercel or Next.js start sending one of the missing security headers by default?
- Did the `middleware.ts` matcher change and stop setting cookies?
- Did the CDN script get removed from the layout, or did SRI get added?
- Did the mixed-content image get removed?
- Did the `/api/wide-cors` route disappear or did the CORS headers get tightened?
- Did the cookie name change from `sessionid` (which would break the session-cookie recognition)?
