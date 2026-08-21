# Batch 8 — Apache CVEs (Phase B — separate target)

**Category:** Apache Tomcat + Apache httpd CVEs
**Master sheet rows:** 108, 110
**BugBuzzer checks tested:** 2
**Date added to testbed:** _pending_
**Status:** ⬜ Pending (Phase B)

---

## Why this is Phase B

Apache CVEs need real Apache Tomcat and Apache httpd servers running vulnerable versions. That needs a VPS with full control — not possible on Vercel.

**Deploy separately** on Hostinger VPS or DigitalOcean. Point subdomain like `vuln-apache.blockchainhq.xyz`.

---

## Vulnerabilities to bake in

| # | Row | Check Name | How to introduce it |
|---|---|---|---|
| 1 | 108 | CVE-2025-24813 — Apache Tomcat | Install Tomcat version between 9.0.0.M1 – 9.0.98 (or 10.1.x range). Serve a hello-world app. |
| 2 | 110 | CVE-2024-38476 / CVE-2024-39573 — Apache HTTP Server | Install Apache httpd 2.4.0 – 2.4.61. Enable mod_rewrite with default config. |

---

## Setup notes

- Ubuntu 22.04 VPS
- Do NOT expose Tomcat management endpoints publicly (defense-in-depth even for a testbed)
- Warning HTML page: "⚠️ Intentionally vulnerable Apache — testbed only"
- Verify `Server:` response header reveals the old version so BugBuzzer's fingerprint fires

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

---

## Regression watch

_Fill in after first successful scan._
