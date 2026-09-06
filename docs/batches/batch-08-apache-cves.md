# Batch 8 — Apache CVEs (Phase B — needs a separate target)

- **Category:** Apache Tomcat + Apache httpd CVEs
- **Rows on master sheet:** 108, 110
- **Checks tested:** 2
- **Deployed on:** _not yet_
- **Status:** ⏸️ Paused (Phase B)

---

## Why this is paused for Phase B

Apache CVE checks need real Apache Tomcat and Apache httpd servers running old vulnerable versions. That needs a VPS with full control — not possible on our current setup.

**Plan:** deploy separately on Hostinger VPS or DigitalOcean. Point a subdomain like `vuln-apache.blockchainhq.xyz`.

---

## What we'll plant

| # | Row | Check name | How to plant it |
|---|---|---|---|
| 1 | 108 | CVE-2025-24813 — Apache Tomcat | Install Tomcat version between 9.0.0.M1 – 9.0.98 (or a 10.1.x version in the affected range). Serve a hello-world app. |
| 2 | 110 | CVE-2024-38476 / CVE-2024-39573 — Apache HTTP Server | Install Apache httpd version 2.4.0 – 2.4.61. Turn on mod_rewrite with default config. |

---

## Setup notes

- Ubuntu 22.04 VPS
- Do NOT expose Tomcat management endpoints publicly (defense-in-depth, even for a testbed)
- Warning HTML page: "⚠️ Intentionally vulnerable Apache — testbed only"
- Make sure the `Server:` response header reveals the old version so BugBuzzer's fingerprint fires

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

---

## Regression watch

_Fill in after first successful scan._
