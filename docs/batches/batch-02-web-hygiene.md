# Batch 2 — Web Hygiene (Headers, Cookies, SSL, SRI)

**Category:** Web Hygiene — headers, cookies, SSL, DNS, SRI
**Master sheet rows:** 19, 20, 21, 24, 28, 30, 50, 53, 54, 55, 88
**BugBuzzer checks tested:** 11
**Date added to testbed:** _pending_
**Status:** ⬜ Pending

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
- Subresource Integrity (SRI) missing on CDN scripts

---

## Vulnerabilities to bake in

| # | Row | Check Name | How to introduce it |
|---|---|---|---|
| 1 | 19 | Security headers missing or dropped after deploy | Do NOT set CSP / HSTS / X-Frame / X-Content-Type / Referrer-Policy / Permissions-Policy in `next.config.ts` |
| 2 | 20 | SSL certificate expiring soon | Auto-checked on real domain — verifiable on the live testbed URL |
| 3 | 21 | Domain registration expiring soon | Auto-checked via WHOIS on `blockchainhq.xyz` |
| 4 | 24 | Mixed content on HTTPS page | Load one image or script from `http://` URL on the page |
| 5 | 28 | CORS misconfiguration — overly permissive | Add API route with `Access-Control-Allow-Origin: *` and `Allow-Credentials: true` |
| 6 | 30 | security.txt missing or expired | Do not add `/.well-known/security.txt` |
| 7 | 50 | Subdomain takeover vulnerability | Optional — add dangling CNAME to unclaimed 3rd party (careful — real risk) |
| 8 | 53 | Session cookies missing HttpOnly flag | Set a cookie in an API route without `HttpOnly` |
| 9 | 54 | Session cookies missing Secure flag | Set a cookie without `Secure` |
| 10 | 55 | Cookies missing SameSite attribute | Set a cookie without `SameSite` |
| 11 | 88 | SRI missing on CDN-hosted scripts | Load a script from cdn.jsdelivr.net without `integrity` attribute |

---

## Expected BugBuzzer scan results

_Fill in expected findings after implementation._

---

## Suggested fix (for real users)

_Fill in customer-facing fix guide when implementing._

---

## Actual scan results

_Fill in after scan._

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

---

## Regression watch

_Fill in after first successful scan._
