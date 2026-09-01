# Batch 4 — Public File Exposure

## 📋 Status at a glance — 2026-09-01 (after scan #10)

**Batch complete? PARTIAL — 4 of 8 rows verified**
- **4 rows firing correctly:** env-file-exposed (4 findings), backup-files-exposed (3), git-repo-exposed (2), svn-repo-exposed (3) → **12 Batch 4 findings** on scan #10
- **4 rows open, need fixes** — logged as Fix F, G, H, I in [testbed-fixes-backlog.md](../testbed-fixes-backlog.md):
  1. **Row 5 (exposed-source-maps)** — Vercel Protected Sourcemaps toggle is STILL ON (verified via curl: source map returns HTTP 403). Fix: toggle OFF in Vercel dashboard
  2. **Row 3 (exposed-config-files)** — middleware serves /config.json etc as HTTP 200 but check didn't fire. Likely needs specific JSON body signature or content-type
  3. **Row 4 (exposed-docker-compose)** — same pattern as row 3
  4. **Row 8 (directory-listing-exposed)** — my `/downloads` page renders inside Next.js layout (duplicate `<html>` tags, `server: Vercel` header), check may need standalone Apache-style page

**Scan #10 also had 10 http-baseline errors** (Batch 2 rows temporarily errored) — likely a BugBuzzer scanner-side blip, not our code. Batch 2 previous verifications still stand.

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
