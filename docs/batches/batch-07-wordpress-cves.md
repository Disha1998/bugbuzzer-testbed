# Batch 7 — WordPress CVEs (Phase B — needs a separate target)

- **Category:** WordPress core + plugin CVEs
- **Rows on master sheet:** 97, 98, 99, 100, 101, 102, 103
- **Checks tested:** 7
- **Deployed on:** _not yet_
- **Status:** ⏸️ Paused (Phase B)

---

## Why this is paused for Phase B

WordPress CVE checks need a real WordPress install with specific old versions of WordPress core + plugins. That can't run on our Next.js testbed.

**Plan:** deploy WordPress separately on Hostinger shared hosting or a small VPS. Point it at a new subdomain like `vuln-wp.blockchainhq.xyz`.

---

## What we'll plant

| # | Row | Check name | How to plant it |
|---|---|---|---|
| 1 | 97 | Multi-CVE — WordPress Core | Install an OLD WordPress core version (any version older than latest) |
| 2 | 98 | CVE-2024-27956 — WP Automatic plugin | Install WP Automatic plugin, version below 3.92.1 |
| 3 | 99 | CVE-2024-10924 — Really Simple Security plugin | Install RSS plugin version 9.0.0 - 9.1.1.1, turn on 2FA setting |
| 4 | 100 | CVE-2025-9501 — W3 Total Cache plugin | Install W3 Total Cache version below 2.8.13 |
| 5 | 101 | CVE-2025-8489 — King Addons for Elementor | Install King Addons version 24.12.92 - 51.1.14 |
| 6 | 102 | CVE-2025-7384 — Contact Form 7 + DB plugin | Install Database for Contact Form 7 version 1.4.3 or lower |
| 7 | 103 | CVE-2025-24000 — Post SMTP plugin | Install Post SMTP plugin in affected version range |

---

## Setup notes

- Download old plugin versions from the WordPress.org plugin archive
- Use a throwaway WordPress install on Hostinger (or a VPS)
- Admin credentials: `wpadmin` / `TestbedPassword!123` (change these if going live)
- Backups: NOT enabled — we want to reset when needed
- Warning banner in the `<footer>`: "⚠️ Intentionally vulnerable WordPress — testbed only"

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
| 5 | Detected | | ⬜ |
| 6 | Detected | | ⬜ |
| 7 | Detected | | ⬜ |

---

## Regression watch

_Fill in after first successful scan._
