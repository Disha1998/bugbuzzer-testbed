# Testbed Fixes Backlog

**One central list of every open fix across all Phase A batches.** Read this file before every fix session so nothing gets lost.

Follows Disha's "collect first, fix later" strategy — deploy vulnerabilities across all Phase A batches (2, 3, 4, 5, 6, 6b), collect open issues in each batch's MD, consolidate here, then work through this list in one focused fix session.

_Last updated: 2026-09-01_

---

## Legend

- **Owner:** who does the fix (Us / BugBuzzer team / Vercel / etc.)
- **Priority:** P1 (blocker), P2 (important), P3 (nice to have)
- **State:** ⬜ Open, 🟡 In progress, ✅ Done, ⏸️ Deferred

---

## Open fixes

### Fix A — Unblock BugBuzzer scanner from Vercel bot protection

- **From:** Batch 3 scans #7, #8, #9 (2026-08-31) — all got HTTP 403
- **Owner:** Us (Disha)
- **Priority:** 🔴 P1 (blocker — Batch 3 verification stuck, all future batches at risk)
- **State:** ⬜ Open

**Fixes these issues:** 8 issues (all Batch 3 rows not verifying + Batch 1/2 regressions caused by scanner block)

**Try in order (cheapest first):**

1. **Vercel Protection Bypass secret** (~10 min)
   - Vercel dashboard → bugbuzzer-testbed → Settings → Deployment Protection → "Protection Bypass for Automation" → "+ Add Secret"
   - Ask Nirav if BugBuzzer can send `x-vercel-protection-bypass: <secret>` header
   - Verify: curl with header → 200; re-scan → checks fire

2. **Vercel Firewall tab — Attack Challenge Mode toggle** (~10 min)
   - Vercel dashboard → bugbuzzer-testbed → top nav → "Firewall" (not Settings)
   - If tab exists → find "Attack Challenge Mode" → turn OFF
   - Verify: re-scan gets 200

3. **Ask Nirav for scanner IPs** (~1 day)
   - Get BugBuzzer scanner IP ranges → allowlist in Vercel Firewall
   - Verify: re-scan gets 200

4. **Move testbed to Hostinger VPS** (~2-3 hours) — nuclear option
   - Deploy Next.js app on Hostinger VPS (Node + nginx)
   - Point DNS to VPS IP
   - No built-in bot protection → scanner always works
   - Verify: re-scan, all Batch 1/2/3 findings return

**What "fixed" looks like:**
- Curl gets 200 → yes (already true)
- BugBuzzer scanner sees HTTP 200 → currently NO (this is the goal)
- All Batch 1 findings return (7 checks, ~18 findings)
- All Batch 2 findings return (~15 findings)
- Batch 3's 5 rows fire for OUR planted reasons, not Vercel's challenge URL

**Full details:** [scan-issues/2026-08-31-scan-blocked-vercel.md](./scan-issues/2026-08-31-scan-blocked-vercel.md)

---

### Fix B — Batch 2 Row 24 (mixed-content) — scanner misses http:// img

- **From:** Batch 2 scan #5 (2026-08-26)
- **Owner:** Us
- **Priority:** 🟡 P2
- **State:** ⬜ Open

**What's wrong:** we planted `<img src="http://example.com/testbed-mixed-content.png">`. Chrome auto-upgrades http:// image requests to https:// before the scanner observes them. Check reports "no insecure sub-resources" — false negative.

**Fix steps:**
1. Change `<img src="http://...">` in `app/page.tsx` to `<script src="http://example.com/blocked.js">`
2. Browsers BLOCK scripts (don't auto-upgrade) → leaves a "Mixed Content" console warning
3. Scanner catches the warning → check fires

**Verification:** re-scan → `mixed-content-on-https-page` fires with 1 finding pointing at the http:// script URL.

**Full details:** [batches/batch-02-web-hygiene.md](./batches/batch-02-web-hygiene.md) "Status at a glance" section

---

### Fix C — Batch 2 Row 28 (CORS) — scanner doesn't discover /api/wide-cors

- **From:** Batch 2 scan #5 (2026-08-26)
- **Owner:** Us
- **Priority:** 🟡 P2
- **State:** ⬜ Open

**What's wrong:** `/api/wide-cors` route returns wildcard CORS correctly (verified with curl). But scanner only tests URLs it discovers on the page. Nothing on the homepage links to `/api/wide-cors` → scanner never tests it → check passes.

**Fix steps:**
1. In `app/page.tsx`, add: `<a href="/api/wide-cors">API demo</a>` (visible link so scanner discovers it in HTML)
2. AND add on-load: `useEffect(() => { fetch("/api/wide-cors").catch(() => {}); }, []);`
3. Belt-and-suspenders — either one should make the scanner discover the endpoint

**Verification:** re-scan → `cors-misconfiguration-overly-permissive` fires with 1 finding pointing at `/api/wide-cors`.

**Full details:** [batches/batch-02-web-hygiene.md](./batches/batch-02-web-hygiene.md) "Status at a glance" section

---

### Fix D — Report BugBuzzer bug: `failed-network-requests` false positive on infra URLs

- **From:** Batch 3 scans #7-9 (2026-08-31)
- **Owner:** BugBuzzer team (Nirav)
- **Priority:** 🟡 P2 (real bug, affects every Vercel-hosted customer scanned under bot protection)
- **State:** ⬜ Open

**What's wrong:** Check has no filter for platform infrastructure URLs (`.well-known/vercel/security/*`, `.well-known/cloudflare/*`, etc). When Vercel bot protection engages, its challenge endpoint's failure gets flagged as an app server error. False positive for the customer.

**Fix steps (message to Nirav):**
> Bug I found while testing: `failed-network-requests` check (`packages/check-catalog/src/checks/browser-baseline/failed-network-requests.ts`) has no filter for platform-infra URLs. When a target's Vercel bot protection engages, it serves `.well-known/vercel/security/request-challenge`. The check flags this as an app server error pointing at Vercel's own infra URL. Suggest: filter out `.well-known/(vercel|cf|cloudflare)/*` patterns OR downgrade to a `scanner-infra-warning` category.

**Verification:** BugBuzzer team ships the filter → re-scan any Vercel-under-bot-protection site → no spurious findings pointing at Vercel infra URLs.

**Full details:** [scan-issues/2026-08-31-scan-blocked-vercel.md](./scan-issues/2026-08-31-scan-blocked-vercel.md) Issue 9

---

### Fix F — Batch 4 Row 5 (exposed-source-maps) — Vercel Protected Sourcemaps still ON

- **From:** Batch 4 scan #10 (2026-09-01)
- **Owner:** Us (Disha — Vercel dashboard toggle)
- **Priority:** 🟡 P2
- **State:** ⬜ Open

**What's wrong:** BugBuzzer probed source map URLs. Verified with curl: `_next/static/immutable/chunks/*.js.map` returns HTTP 403. Vercel's "Protected Sourcemaps" feature is ON — source maps only accessible to team members.

**Fix steps:**
1. Vercel dashboard → bugbuzzer-testbed → Settings → Deployment Protection
2. Scroll to **"Protected Sourcemaps"** section
3. Toggle **OFF** → Save
4. Wait ~30 sec for change to propagate
5. Verify with curl: `curl -sI https://testbed.blockchainhq.xyz/_next/static/immutable/chunks/<any>.js.map` should return HTTP 200
6. Re-scan → `exposed-source-maps` should fire

**Verification:** re-scan → `exposed-source-maps` fires with 1+ findings on Next.js source map files.

---

### Fix G — Batch 4 Rows 3 + 4 (exposed-config-files + exposed-docker-compose) — check didn't recognize content

- **From:** Batch 4 scan #10 (2026-09-01)
- **Owner:** Us
- **Priority:** 🟡 P2
- **State:** ⬜ Open

**What's wrong:** Middleware serves `/config.json`, `/settings.json`, `/appsettings.json`, `/secrets.json` and `/docker-compose.yml`, `/docker-compose.yaml`, `/compose.yml` all as HTTP 200 with real-looking content (verified with curl). But BugBuzzer's checks passed with "No publicly accessible JSON configuration files detected" / "No publicly accessible Docker Compose config files detected".

Two possibilities:
1. BugBuzzer's checks look for specific content signatures we're not matching
2. Response Content-Type isn't being preserved by Next.js middleware (curl showed no `content-type` header in my quick test — worth digging)

**Fix steps:**
1. Read BugBuzzer's check source: `packages/check-catalog/src/checks/http-probe/exposed-config-files.ts` and `exposed-docker-compose.ts`
2. Look at what response pattern each check requires (Content-Type? specific JSON keys? YAML structure?)
3. Adjust `middleware.ts` EXPOSED_FILES entries — either fix Content-Type, add missing signatures, or structure content differently
4. Push, re-scan

**Verification:** re-scan → both checks fire with expected findings.

---

### Fix I — Batch 4 Row 8 (directory-listing-exposed) — page rendered inside Next.js layout

- **From:** Batch 4 scan #10 (2026-09-01)
- **Owner:** Us
- **Priority:** 🟡 P2
- **State:** ⬜ Open

**What's wrong:** `/downloads` renders "Index of /downloads" HTML but inside the Next.js root layout — creating duplicate `<html>` tags and response header shows `server: Vercel` (not `server: Apache/*`). Real directory listings come from Apache/nginx and have specific structure.

Also possible: BugBuzzer's check doesn't probe `/downloads` at all — it probably probes `/uploads/`, `/files/`, `/backup/`, `/images/`, etc.

**Fix steps (try in order):**
1. Read BugBuzzer's check code: `packages/check-catalog/src/checks/http-probe/directory-listing-exposed.ts`
2. Check what paths it probes AND what response pattern it needs
3. Options:
   - Serve the fake directory listing via `middleware.ts` at the URL BugBuzzer probes (bypassing Next.js layout entirely)
   - OR add a `layout.tsx` under `app/downloads/` that just passes through `children` with no HTML wrapper
   - OR set response headers to include `Server: Apache/2.4.52` via middleware for `/downloads`
4. Verify with curl: response HTML is standalone (no `<!DOCTYPE html><html>` from Next.js), body starts with `<title>Index of` or `<h1>Index of`

**Verification:** re-scan → `directory-listing-exposed` fires with 1 finding.

---

### Fix J — Report BugBuzzer bug: http-baseline collector transient errors

- **From:** Batch 4 scan #10 (2026-09-01)
- **Owner:** BugBuzzer team (Nirav)
- **Priority:** 🟠 P3 (transient, but worth logging)
- **State:** ⬜ Open

**What's wrong:** Scan #10 had 10 checks return `status: "error"` with generic `errorMessage: "An unexpected error occurred while running this check"`. All 10 are http-baseline-collector-based:

- `security-headers-missing`, `security-txt-missing-or-expired`, `server-version-disclosure`
- `session-cookie-missing-{secure, http-only, samesite}`, `session-token-insufficient-expiration`, `jwt-weak-signing-secret`
- `site-{returning-error-status, unreachable}`

Same 10 checks worked fine in scan #5 (2026-08-26) and scan #4 (2026-08-24). Bundle-static and browser-baseline collectors both worked in scan #10 (Batch 1 and Batch 3 findings fired correctly). Only the http-baseline collector failed.

Likely a transient BugBuzzer scanner-side issue with the http-baseline collector for this scan run. Batch 2 previous verifications still stand — this is not our regression.

**Fix steps (message to Nirav next time we ping the team):**
> Scan `01a05c3f-4662-79a9-9550-aba26a665cf7` on 2026-09-01 had 10 http-baseline checks return `status: "error"` with a generic "unexpected error occurred" message — while bundle-static and browser-baseline checks in the same scan worked fine. Same 10 checks passed cleanly in prior scans. Looks like a transient http-baseline collector issue. Worth checking:
> - Was there a scanner-side incident around 2026-09-01 09:14 UTC?
> - Is the generic `errorMessage` swallowing a real stack trace? Would help to surface the underlying cause.

**Verification:** future scans should not show these 10 checks as `errored`. If it happens again, escalate.

---

### Fix E — Report BugBuzzer bug: silent regression when scanner is blocked

- **From:** Batch 3 scans #7-9 (2026-08-31)
- **Owner:** BugBuzzer team (Nirav)
- **Priority:** 🔴 P1 for BugBuzzer product quality (customers will get false "clean" reports on badly misconfigured sites when their bot protection blocks the scanner)
- **State:** ⬜ Open

**What's wrong:** when target returns 403 to the scanner (bot protection engaged), every content-dependent check reports `status: "passed"` because it saw no content. Scan LOOKS clean, actually scanner never reached the site. Real customers will get false negatives on very bad sites.

**Fix steps (message to Nirav):**
> Second bug from same testing: when target returns HTTP 403 to scanner (bot protection engaged), every content-dependent check (secrets in JS bundle, cookies, hydration, etc.) reports `status: "passed"` because it saw no content. Scan LOOKS clean. Suggest: if top-level `site-returning-error-status` reports 403 or challenge, mark all page-dependent checks as `status: "skipped"` with reason `"scanner blocked by target's bot protection"` instead of `passed`.

**Verification:** BugBuzzer team ships the change → scan a bot-protected site → report clearly says "scanner blocked, results incomplete" instead of showing clean passes.

**Full details:** [scan-issues/2026-08-31-scan-blocked-vercel.md](./scan-issues/2026-08-31-scan-blocked-vercel.md) Issue 10

---

## How to use this file

**When adding a new fix:**
- Copy the section format above (heading + Owner + Priority + State + fixes-these-issues + steps + verification + link)
- Add to the "Open fixes" list
- Cross-reference from the originating batch MD or scan-issues MD

**When starting a fix session:**
- Sort by Priority (P1 first)
- Group by Owner (do all "Us" fixes in one session, all "BugBuzzer team" fixes in one Nirav message)
- Work through the "Fix steps" for each
- Mark as ✅ Done when Verification passes

**When a fix lands:**
- Change State to ✅ Done
- Move to a "Completed" section (or delete after the batch is fully verified)

**Priority summary right now:**
- 🔴 P1: Fix A (unblock scanner) — blocks all further progress
- 🔴 P1 for BugBuzzer: Fix E (silent regression)
- 🟡 P2: Fix B (mixed content), Fix C (CORS), Fix D (infra URL filter)

---

## Rule going forward

Every batch scan surfaces its own issues. As soon as an issue is confirmed as "needs a fix" (not a scanner false positive we accept, not a Phase B deferral), add it to this backlog with proper Owner + Priority + Fix steps + Verification. Then you can move on to the next batch without losing the item.
