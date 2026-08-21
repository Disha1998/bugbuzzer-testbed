# Batch 4 — Public File Exposure

**Category:** Public files leaking secrets or source
**Master sheet rows:** 17, 18, 25, 72, 73, 74, 76, 113
**BugBuzzer checks tested:** 8
**Date added to testbed:** _pending_
**Status:** ⬜ Pending

---

## What this batch tests

BugBuzzer probes common web paths where developers accidentally leave sensitive files exposed. These are "fix once, stays fixed" issues — great fit for the one-time $19 scan.

---

## Vulnerabilities to bake in

| # | Row | Check Name | How to introduce it |
|---|---|---|---|
| 1 | 17 | .env file publicly accessible | Put a fake `.env` file with `FAKE_API_KEY=xxx` in `/public/` folder |
| 2 | 18 | Backup and config files publicly accessible | Add `/public/backup.sql`, `/public/config.bak`, `/public/database.yml` with dummy content |
| 3 | 25 | Git repository accidentally exposed (.git folder) | Add `/public/.git/HEAD` with `ref: refs/heads/main` |
| 4 | 72 | Webpack / Vite source map files publicly accessible | Enable source maps in `next.config.ts` → `productionBrowserSourceMaps: true` |
| 5 | 73 | Exposed JSON config files | Add `/public/config.json` and `/public/appsettings.json` with dummy secrets |
| 6 | 74 | SVN repository metadata exposed | Add `/public/.svn/entries` with dummy SVN content |
| 7 | 76 | AWS S3 bucket linked from site (public listing) | Add a JS reference to `bugbuzzer-fake-testbed-bucket.s3.amazonaws.com` — combines with Batch 10 |
| 8 | 113 | Docker Compose config file publicly accessible | Add `/public/docker-compose.yml` with dummy services |

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

---

## Regression watch

_Fill in after first successful scan._
