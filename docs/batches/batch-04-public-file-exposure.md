# Batch 4 — Public File Exposure

## 📋 Status at a glance — 2026-09-01

**Batch complete? NO ❌** (deployed, awaiting first scan)
- **0 of 8 rows verified** — code deployed, needs first scan
- **1 conditional dependency:** Row 5 (source maps) requires Vercel "Protected Sourcemaps" toggle OFF. Without that, row 5 will not fire.
- **Reused inheritance:** blocked by same Fix A as Batch 3 IF Vercel bot protection extends to URL-probe requests. Batch 4 checks probe specific URLs directly, so should work even under browser-fingerprint bot protection. If they DON'T work, log as extension of Fix A.

**Setup required before scanning (one-time):**
1. Merge this batch to main → Vercel auto-deploys
2. Open Vercel dashboard → bugbuzzer-testbed → Settings → Deployment Protection → scroll to **"Protected Sourcemaps"** → toggle OFF → Save
3. Then scan `https://testbed.blockchainhq.xyz/` in BugBuzzer beta

If you skip step 2, row 5 (source maps) will not fire. Rows 1-4 and 6-8 don't depend on that setting.

---

**Category:** Public File Exposure (URL probes)
**Master sheet rows:** covers 8 checks — see table below
**BugBuzzer checks tested:** 8
**Branch:** `batch-04-public-file-exposure`
**Date added to testbed:** 2026-09-01

---

## What this batch tests

BugBuzzer probes standard "attacker" URLs to check if the site accidentally exposes sensitive files. This is the "did the developer commit their .env file" class of vulnerability.

Real developers leave these behind by mistake:
- `.env` with real DB passwords
- `.git/` folder with full source history (attacker `git clone`s your production code)
- Backup files (`.sql`, `.zip`) with database dumps
- Source maps (`.js.map`) revealing unminified source code
- Config files with API keys

---

## Vulnerabilities baked in

All 8 vulnerabilities are served by `middleware.ts` (root file). One middleware intercepts every "attack URL" and returns fake vulnerable content. No real secrets, no real DB.

| # | Row | Check ID | How the middleware serves it |
|---|---|---|---|
| 1 | — | backup-files-exposed | Intercepts `/backup.sql`, `/db.sql`, `/dump.sql`, `/backup.zip`, `/backup.tar.gz` → returns fake SQL dump / zip content |
| 2 | — | env-file-exposed | Intercepts `/.env`, `/.env.local`, `/.env.production`, `/.env.development` → returns fake env file with `DATABASE_URL=...`, `STRIPE_SECRET_KEY=...`, `JWT_SECRET=...` |
| 3 | — | exposed-config-files | Intercepts `/config.json`, `/settings.json`, `/appsettings.json`, `/secrets.json` → returns JSON with fake `apiEndpoint`, `stripeSecretKey`, `databaseUrl`, `jwtSecret` |
| 4 | — | exposed-docker-compose | Intercepts `/docker-compose.yml`, `/docker-compose.yaml`, `/compose.yml` → returns fake docker-compose YAML with `POSTGRES_PASSWORD`, `STRIPE_SECRET_KEY` |
| 5 | — | exposed-source-maps | Vercel's real Next.js `.js.map` files — requires Vercel "Protected Sourcemaps" OFF |
| 6 | — | git-repo-exposed | Intercepts `/.git/config`, `/.git/HEAD`, `/.git/index` → returns fake git config pointing at `git@github.com:fake-user/fake-testbed-repo.git` |
| 7 | — | svn-repo-exposed | Intercepts `/.svn/entries`, `/.svn/wc.db`, `/.svn/format` → returns fake SVN metadata |
| 8 | — | directory-listing-exposed | `/downloads` page renders as Apache-style "Index of /downloads" HTML with file listing + `Apache/2.4.52` server footer |

---

## Files added / edited

| File | Change |
|---|---|
| `middleware.ts` (edit) | Added `EXPOSED_FILES` lookup table + interception branch that runs BEFORE the Batch 2 cookie branch. 22 attack URLs served. |
| `app/downloads/page.tsx` (new) | Fake "Index of /" HTML page for row 8. |
| `app/page.tsx` (edit) | Flipped BATCHES[3].status Pending → Live + filled checks[] with 8 friendly names. |

Zero new dependencies.

---

## Expected BugBuzzer scan results

| Check | Expected findings | Notes |
|---|---|---|
| backup-files-exposed | 1-3 findings (depends on how many URLs the scanner probes) | Middleware serves `/backup.sql`, `/db.sql`, `/dump.sql`, `/backup.zip`, `/backup.tar.gz` |
| env-file-exposed | 1-3 findings | Middleware serves `/.env` variants with fake secrets |
| exposed-config-files | 1-2 findings | JSON config files with fake API keys |
| exposed-docker-compose | 1 finding | docker-compose.yml served |
| exposed-source-maps | 1+ finding (IF Vercel Protected Sourcemaps OFF) | Real Next.js source maps become public |
| git-repo-exposed | 1 finding | .git/config + HEAD + index all served |
| svn-repo-exposed | 1 finding | .svn/entries + wc.db + format all served |
| directory-listing-exposed | 1 finding | /downloads renders as Apache "Index of /" |

**Total expected new findings: ~10-15** on top of Batch 1 + Batch 2 + Batch 3 findings (once scanner is unblocked from Fix A).

---

## What visitors of testbed will see

- Homepage: unchanged
- `/downloads`: shows a fake Apache directory listing (harmless HTML page)
- Anyone curling `/.env` etc.: gets fake vulnerable content — no real secrets

All content is FAKE. No real database, no real credentials, no real source code.

---

## Actual scan results

_Fill in after first scan._

| Check | Expected | Actual | Status |
|---|---|---|---|
| backup-files-exposed | 1-3 | | ⬜ |
| env-file-exposed | 1-3 | | ⬜ |
| exposed-config-files | 1-2 | | ⬜ |
| exposed-docker-compose | 1 | | ⬜ |
| exposed-source-maps | 1+ | | ⬜ |
| git-repo-exposed | 1 | | ⬜ |
| svn-repo-exposed | 1 | | ⬜ |
| directory-listing-exposed | 1 | | ⬜ |

---

## Regression watch

If any of these findings stops appearing on a future scan, investigate:

- Was `middleware.ts` edited and lost the EXPOSED_FILES table?
- Did the middleware `matcher` change and stop matching these paths?
- Did Vercel change how it handles requests to `/.env` or `.git/` folders? (Vercel sometimes blocks dotfiles at the CDN edge)
- Did `Protected Sourcemaps` toggle get flipped back ON in Vercel?
- Did `/downloads/page.tsx` get deleted or changed to render normal content?
- Did the middleware branch order change so cookies run first and short-circuit the file-exposure branch?
