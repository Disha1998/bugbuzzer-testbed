# Batch 7 — WordPress CVEs (Phase B — separate target)

**Category:** WordPress core + plugin CVEs
**Master sheet rows:** 97, 98, 99, 100, 101, 102, 103
**BugBuzzer checks tested:** 7
**Date added to testbed:** _pending_
**Status:** ⬜ Pending (Phase B)

---

## Why this is Phase B

WordPress CVEs need a real WordPress install with specific old versions of core + plugins. That can't run on the Next.js testbed on Vercel.

**Deploy separately** on Hostinger shared hosting or a small VPS. Point to a new subdomain like `vuln-wp.blockchainhq.xyz`.

---

## Vulnerabilities to bake in

| # | Row | Check Name | How to introduce it |
|---|---|---|---|
| 1 | 97 | Multi-CVE — WordPress Core | Install an OLD WordPress core version (any version older than latest) |
| 2 | 98 | CVE-2024-27956 — WP Automatic plugin | Install WP Automatic plugin, version < 3.92.1 |
| 3 | 99 | CVE-2024-10924 — Really Simple Security plugin | Install RSS plugin version 9.0.0 - 9.1.1.1, enable 2FA setting |
| 4 | 100 | CVE-2025-9501 — W3 Total Cache plugin | Install W3 Total Cache version < 2.8.13 |
| 5 | 101 | CVE-2025-8489 — King Addons for Elementor | Install King Addons version 24.12.92 - 51.1.14 |
| 6 | 102 | CVE-2025-7384 — Contact Form 7 + DB plugin | Install Database for Contact Form 7 version ≤ 1.4.3 |
| 7 | 103 | CVE-2025-24000 — Post SMTP plugin | Install Post SMTP plugin in affected version range |

---

## Setup notes

- Download old plugin versions from WordPress.org plugin archive
- Use throwaway WordPress install on Hostinger (or VPS)
- Admin credentials: `wpadmin` / `TestbedPassword!123` (change if going live)
- Backups: NOT enabled — we want to reset when needed
- Warning banner in `<footer>`: "⚠️ Intentionally vulnerable WordPress — testbed only"

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
