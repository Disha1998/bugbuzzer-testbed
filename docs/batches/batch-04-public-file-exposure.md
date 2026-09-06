# Batch 4 — Files that should not be public

## 📋 Where we are — 2026-09-01 (after scan #10)

**Is this batch done? PARTLY — 4 out of 8 checks work**
- **4 checks are working:** env-file-exposed (4 findings), backup-files-exposed (3), git-repo-exposed (2), svn-repo-exposed (3) → **12 Batch 4 findings** on scan #10
- **4 checks still need fixes** — tracked as Fix F, G, H, I in [testbed-fixes-backlog.md](../testbed-fixes-backlog.md):
  1. **Row 5 (exposed-source-maps)** — Vercel's Protected Sourcemaps toggle is still ON (curl confirms .map files return HTTP 403). Fix: turn it OFF in the Vercel dashboard.
  2. **Row 3 (exposed-config-files)** — middleware serves /config.json etc. with HTTP 200 but the check didn't fire. Probably needs a specific JSON body pattern or content type.
  3. **Row 4 (exposed-docker-compose)** — same problem as row 3. (Later note: this got fixed after we moved to Hostinger — see the master checklist.)
  4. **Row 8 (directory-listing-exposed)** — our `/downloads` page renders inside the Next.js layout (has duplicate `<html>` tags, `server: Vercel` header). Check probably needs a standalone Apache-style page.

**Scan #10 also had 10 HTTP-header checks fail with a generic error** — likely a temporary BugBuzzer scanner problem, not our code. Batch 2 previous verifications still stand. Tracked as Fix J.

---

- **Category:** Files that should not be public (URL probes)
- **Rows on master sheet:** 8 checks — see table below
- **Checks tested:** 8
- **Branch:** `batch-04-public-file-exposure`
- **Deployed on:** 2026-09-01

---

## What this batch tests

BugBuzzer visits well-known "attacker URLs" to see if the site accidentally exposes sensitive files. This is the "oops, we committed our .env file" class of bug.

Real developers leave these behind by mistake:
- `.env` with real DB passwords
- `.git/` folder with the full source history (attacker can `git clone` your production code)
- Backup files (`.sql`, `.zip`) with database dumps
- Source maps (`.js.map`) that reveal the unminified source code
- Config files with API keys inside

---

## What we planted

All 8 vulnerabilities are served by `middleware.ts` (root file). The middleware intercepts every "attack URL" and returns fake vulnerable content. No real secrets, no real DB.

| # | Check ID | How we serve it |
|---|---|---|
| 1 | backup-files-exposed | Middleware catches `/backup.sql`, `/db.sql`, `/dump.sql`, `/backup.zip`, `/backup.tar.gz` → returns fake SQL dump / zip content |
| 2 | env-file-exposed | Catches `/.env`, `/.env.local`, `/.env.production`, `/.env.development` → returns fake env file with `DATABASE_URL=...`, `STRIPE_SECRET_KEY=...`, `JWT_SECRET=...` |
| 3 | exposed-config-files | Catches `/config.json`, `/settings.json`, `/appsettings.json`, `/secrets.json` → returns JSON with fake `apiEndpoint`, `stripeSecretKey`, `databaseUrl`, `jwtSecret` |
| 4 | exposed-docker-compose | Catches `/docker-compose.yml`, `/docker-compose.yaml`, `/compose.yml` → returns fake docker-compose YAML with `POSTGRES_PASSWORD`, `STRIPE_SECRET_KEY` |
| 5 | exposed-source-maps | Vercel's real Next.js `.js.map` files — needs Vercel "Protected Sourcemaps" turned OFF |
| 6 | git-repo-exposed | Catches `/.git/config`, `/.git/HEAD`, `/.git/index` → returns fake git config pointing at `git@github.com:fake-user/fake-testbed-repo.git` |
| 7 | svn-repo-exposed | Catches `/.svn/entries`, `/.svn/wc.db`, `/.svn/format` → returns fake SVN metadata |
| 8 | directory-listing-exposed | `/downloads` page renders as an Apache-style "Index of /downloads" HTML with file listing + `Apache/2.4.52` server footer |

---

## Files we changed

| File | Change |
|---|---|
| `middleware.ts` (edit) | Added `EXPOSED_FILES` lookup table + interception logic. Runs BEFORE the Batch 2 cookie logic. 22 attack URLs served. |
| `app/downloads/page.tsx` (new) | Fake "Index of /" HTML page for row 8 |
| `app/page.tsx` (edit) | Marked BATCHES[3] as Live + filled in 8 friendly names |

No new dependencies.

---

## What we expect the scanner to find

| Check | Expected findings | Notes |
|---|---|---|
| backup-files-exposed | 1-3 findings (depends how many URLs the scanner tries) | Middleware serves `/backup.sql`, `/db.sql`, `/dump.sql`, `/backup.zip`, `/backup.tar.gz` |
| env-file-exposed | 1-3 findings | Middleware serves `/.env` variants with fake secrets |
| exposed-config-files | 1-2 findings | JSON config files with fake API keys |
| exposed-docker-compose | 1 finding | docker-compose.yml served |
| exposed-source-maps | 1+ finding (IF Vercel Protected Sourcemaps is OFF) | Real Next.js source maps become public |
| git-repo-exposed | 1 finding | .git/config + HEAD + index all served |
| svn-repo-exposed | 1 finding | .svn/entries + wc.db + format all served |
| directory-listing-exposed | 1 finding | /downloads renders as Apache "Index of /" |

**Total expected new findings: ~10-15** on top of Batches 1-3 findings.

---

## What visitors will see

- Homepage: unchanged
- `/downloads`: shows a fake Apache directory listing (harmless HTML page)
- Anyone who curls `/.env` etc.: gets fake vulnerable content — no real secrets

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

If any of these findings stops firing on a future scan, check:

- Was `middleware.ts` edited and lost the EXPOSED_FILES table?
- Did the middleware `matcher` change and stop matching these paths?
- Did Vercel or Hostinger's nginx change how it handles requests to `/.env` or `.git/` folders?
- Did `Protected Sourcemaps` toggle get flipped back ON in Vercel?
- Did `/downloads/page.tsx` get deleted or changed to render normal content?
- Did the middleware branch order change so cookies run first and skip the file-exposure logic?
