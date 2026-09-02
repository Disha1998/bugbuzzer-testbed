# Testbed Fixes Backlog

**One central list of every open fix across all Phase A batches.** Read this file before every fix session so nothing gets lost.

Follows Disha's "collect first, fix later" strategy — deploy vulnerabilities across all Phase A batches (2, 3, 4, 5, 6, 6b), collect open issues in each batch's MD, consolidate here, then work through this list in one focused fix session.

_Last updated: 2026-09-02 (after Batch 5 first scan)_

> 🎉 **Hostinger migration resolved 4 fixes** — Fix A (Vercel bot), Fix D (BugBuzzer bug from Vercel infra), Fix G row 4 (docker-compose signature), Fix K blocker 1 (Vercel bot on /broken). Testbed now runs on `76.13.179.65` as a Docker container behind nginx. See [hostinger-deployment.md](./hostinger-deployment.md).
>
> 🚀 **Batch 5 deployed** — 5 of 13 rows verified on scan #15. 8 rows need content-shape refinement — all bundled as **Fix L** below. 1 row deferred to Phase B.

---

## Legend

- **Owner:** who does the fix (Us / BugBuzzer team / Vercel / etc.)
- **Priority:** P1 (blocker), P2 (important), P3 (nice to have)
- **State:** ⬜ Open, 🟡 In progress, ✅ Done, ⏸️ Deferred

---

## Open fixes

### Fix A — Unblock BugBuzzer scanner from Vercel bot protection ✅ RESOLVED 2026-09-02

- **From:** Batch 3 scans #7, #8, #9 (2026-08-31) — all got HTTP 403
- **Owner:** Us (Disha)
- **Priority:** 🔴 P1 (was blocker)
- **State:** ✅ **RESOLVED via Option 4 — moved testbed to Hostinger VPS**

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

### Fix D — Report BugBuzzer bug: `failed-network-requests` false positive on infra URLs ✅ RESOLVED for us

- **From:** Batch 3 scans #7-9 (2026-08-31)
- **Owner:** BugBuzzer team (Nirav)
- **Priority:** 🟡 P2 (was blocking us; now moot for our testbed since we're off Vercel)
- **State:** ✅ **RESOLVED for our testbed** (Hostinger has no `.well-known/vercel/...` URLs to trigger the false positive). Still a real BugBuzzer product bug affecting other Vercel-hosted customers — worth reporting to Nirav next chat.

**What's wrong:** Check has no filter for platform infrastructure URLs (`.well-known/vercel/security/*`, `.well-known/cloudflare/*`, etc). When Vercel bot protection engages, its challenge endpoint's failure gets flagged as an app server error. False positive for the customer.

**Fix steps (message to Nirav):**
> Bug I found while testing: `failed-network-requests` check (`packages/check-catalog/src/checks/browser-baseline/failed-network-requests.ts`) has no filter for platform-infra URLs. When a target's Vercel bot protection engages, it serves `.well-known/vercel/security/request-challenge`. The check flags this as an app server error pointing at Vercel's own infra URL. Suggest: filter out `.well-known/(vercel|cf|cloudflare)/*` patterns OR downgrade to a `scanner-infra-warning` category.

**Verification:** BugBuzzer team ships the filter → re-scan any Vercel-under-bot-protection site → no spurious findings pointing at Vercel infra URLs.

**Full details:** [scan-issues/2026-08-31-scan-blocked-vercel.md](./scan-issues/2026-08-31-scan-blocked-vercel.md) Issue 9

---

### Fix F — Batch 4 Row 5 (exposed-source-maps) — TWO blockers, one solved one open

- **From:** Batch 4 scan #10 (2026-09-01), refined after scan #11 (2026-09-01)
- **Owner:** Us
- **Priority:** 🟡 P2
- **State:** 🟡 Partially resolved (blocker 1 done, blocker 2 open)

**Blocker 1 — Vercel Protected Sourcemaps toggle — ✅ RESOLVED 2026-09-01**
- Was: `.js.map` returned HTTP 403 (Protected Sourcemaps ON)
- Fix applied: Disha toggled OFF in Vercel dashboard
- Verified via curl: no more 403

**Blocker 2 — Turbopack doesn't emit source maps in production — ⬜ OPEN**
- Verified via curl: `.js.map` now returns HTTP 404 (not 403 anymore, but the file doesn't exist)
- Root cause: our Next.js app uses Turbopack (the new bundler), which does not generate `.js.map` files in production by default
- BugBuzzer's check discovers script URLs on the page, then probes each script's `.map` counterpart. Since no .map exists, check passes.

**Fix steps for blocker 2 (cheapest first):**
1. Edit `next.config.ts` in bugbuzzer-testbed — add `productionBrowserSourceMaps: true` to the config object
2. Push → Vercel deploys → verify with curl that `.js.map` files now return HTTP 200
3. Re-scan → `exposed-source-maps` should fire on the newly-exposed real Next.js source maps

**Verification:** curl a `.js.map` file returns HTTP 200 with JavaScript source map JSON content; next scan flags `exposed-source-maps` with 1+ findings.

---

### Fix G — Batch 4 Rows 3 + 4 (exposed-config-files + exposed-docker-compose) — 🟡 Partially resolved

- **From:** Batch 4 scan #10 (2026-09-01)
- **Owner:** Us
- **Priority:** 🟡 P2
- **State:** 🟡 **Row 4 (docker-compose) ✅ RESOLVED 2026-09-02** — fires 3 findings on Hostinger scan #14. Row 3 (config-files) ⬜ still open.

**What's wrong for Row 3 (config-files):** Middleware serves `/config.json`, `/settings.json`, `/appsettings.json`, `/secrets.json` as HTTP 200 with real-looking content (verified with curl). But BugBuzzer's `exposed-config-files` check still passes with "No publicly accessible JSON configuration files detected".

**Why row 4 (docker-compose) started firing after Hostinger move:** unclear — maybe nginx sends proper Content-Type headers where Vercel didn't, or the check has a signature that matched our YAML on Hostinger. Either way, ✅ done.

**Fix steps for Row 3 (config-files):**
1. Read BugBuzzer's check source: `packages/check-catalog/src/checks/http-probe/exposed-config-files.ts`
2. Look at what response pattern the check requires (Content-Type? specific JSON keys? file signature bytes?)
3. Adjust `middleware.ts` FAKE_CONFIG_JSON — add missing signatures, or structure content differently
4. Push, re-scan

**Verification:** re-scan → `exposed-config-files` fires with 4 findings on config.json / settings.json / appsettings.json / secrets.json.

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

### Fix K — Batch 3 Row 38 (critical-page-blank-or-error) — Vercel bot fixed, new blocker: Next.js layout wraps page

- **From:** Batch 3 scan #11 (2026-09-01 — /broken URL scan)
- **Owner:** Us
- **Priority:** 🟡 P2
- **State:** 🟡 **Blocker 1 (Vercel bot) ✅ RESOLVED via Hostinger move.** Blocker 2 (layout wrap) ⬜ still open.

**Blocker 1 — Vercel bot challenge on /broken URL — ✅ RESOLVED 2026-09-02**
- Was: `/broken` returned HTTP 403 to scanner (Vercel bot detection targeting rarely-visited paths)
- Fix applied: moved off Vercel to Hostinger — nginx serves /broken cleanly with HTTP 200
- Verified: Hostinger scan #13 (/broken) reached the page successfully

**Blocker 2 — Check still passes because Next.js layout adds too much content — ⬜ OPEN**
- Hostinger scan #13: `critical-page-blank-or-error: passed - Page loaded with content and no critical blank or error state detected.`
- Root cause: our `/broken/page.tsx` renders inside the root layout (nav, footer, styles). Total content is 15KB+ and doesn't match the check's "blank or error" heuristic. The check probably looks for either <500 bytes of content OR HTTP 5xx status.
- Curl confirms: `/broken` returns HTTP 200 with 15KB HTML (full layout wrap).

**Fix steps for blocker 2 (cheapest first):**
1. **Return HTTP 500 for /broken** — real broken pages return 5xx. Add `notFound()` or explicit `throw new Error()` in `app/broken/page.tsx`, OR make it a route that intentionally throws. Check likely flags any 5xx.
2. **Alternative:** create `app/broken/layout.tsx` that just passes through `{children}` without wrapping in `<html><body>...</body></html>` — strips the Next.js layout content
3. **Alternative:** serve /broken via middleware with minimal HTML body (just "Application Error" + no layout)

**Verification:** re-scan `/broken` → `critical-page-blank-or-error` fires with 1 finding.

---

### Fix L — Batch 5 open items (8 rows need content-shape refinement)

- **From:** Batch 5 scan #15 (2026-09-02)
- **Owner:** Us
- **Priority:** 🟡 P2 (do in one focused session)
- **State:** ⬜ Open

**What's wrong:** all 8 rows below have vulnerable content deployed, but BugBuzzer's checks have specific content-shape heuristics they need to match. Our current fake content is too generic.

**Sub-items (each is a small tweak):**

**L.1 — `debug-mode-enabled`** — needs specific framework debug markers
- Currently: our /debug + /__debug__ serve generic "DjangoDebugToolbar" HTML → picked up by admin-panel check instead
- Fix: add Werkzeug console URL structure (`/console`, `<div class="debugger">`, `Traceback (most recent call last)` in `<pre class="traceback">`) OR Django `DEBUG=True` markers (`<div id="djangoBanner">`, request/response variable dumps)
- Read BugBuzzer check source: `packages/check-catalog/src/checks/*/debug-mode-enabled.ts`

**L.2 — `default-credentials-on-services`** — panels fingerprint but creds test inconclusive
- Currently: scanner fingerprinted 7 panels but 2 couldn't be tested (WAF/timeout)
- Fix: check what login endpoint the scanner actually POSTs to (may be `/admin/login` not `/api/login`), OR match the exact request shape (form-encoded with specific field names)
- Alternative: make our /admin form action absolute-URL `/api/login` visible AND make /api/login accept the exact credentials the check probes (check may try `admin:admin`, `admin:password123`, etc.)

**L.3 — `exposed-ai-infra`** — fake dashboards don't match check heuristic
- Currently: /langfuse + /mlflow serve generic HTML with "Langfuse" / "MLflow" text
- Fix: match real Langfuse/W&B/MLflow HTML structure — specific meta tags (`<meta name="application-name" content="Langfuse">`), asset paths (`/_next/static/chunks/langfuse-*`), or window global variables (`window.__LANGFUSE__ = {...}`)

**L.4 — `exposed-dev-tools`** — Storybook needs real markers
- Currently: /storybook serves fake HTML with "Storybook" title
- Fix: serve real Storybook markers — `<iframe src="iframe.html">`, `runtime~main.iframe.bundle.js`, `sb-preview-loader.js`, `<div id="root">` + `<div id="docs-root">`

**L.5 — `graphql-introspection-enabled`** — endpoint discovery failed
- Currently: /api/graphql + /graphql exist. Scanner says "No GraphQL endpoint detected on target at any probed path"
- Fix options: (a) GET /api/graphql returns 405 Method Not Allowed with GraphQL-specific error body (`{"errors":[{"message":"GET method not supported"}]}`), (b) POST to /api/graphql with body containing "query" returns `data` field, (c) advertise via HTTP header (`X-GraphQL-Path: /api/graphql`)

**L.6 — `host-header-reflection`** — /redirect-home not on scanner probe list
- Currently: /redirect-home reflects Host header but scanner doesn't probe it
- Fix: rename to a discoverable pattern — `?returnTo=<url>`, `?redirect_uri=<url>`, or hook the reflection into an existing endpoint the scanner already discovered (e.g. /api/login redirect after success)

**L.7 — `oauth-state-parameter-missing`** — OAuth link not discovered
- Currently: GitHub OAuth link is in Batch5AuthVulns component (client component with useEffect fetches). Scanner may not see the `<a href=>` rendered in initial HTML.
- Fix: verify our OAuth link is in the server-rendered HTML (view-source should show `github.com/login/oauth/authorize?client_id=...`). If missing, move the OAuth link out of the client component into a server component or app/page.tsx directly

**L.8 — `unauthenticated-ai-proxy-endpoint` + `ai-endpoint-model-parameter-override`** — endpoint discovered but not AI-flagged
- Currently: /api/ai/chat picked up by unauthenticated-api-endpoint (generic) but not flagged as AI proxy specifically
- Fix: make our response look like a REAL AI proxy — return OpenAI streaming format, echo the input `model` param in response (`"model":"gpt-4"`), match expected `choices[0].message.content` shape more precisely. Also honor `model` param overrides to trigger `ai-endpoint-model-parameter-override`

**Verification:** rescan → each of the 8 rows fires with at least 1 finding.

**Estimated effort:** ~45-60 min for all 8 sub-items in one session.

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

**Priority summary right now (2026-09-02, after Batch 5 first scan):**
- ✅ Resolved: Fix A (Vercel bot — moved to Hostinger), Fix D (moot), Fix G-row4 (docker-compose), Fix K-blocker1 (Vercel bot on /broken)
- 🟡 P2 still open: Fix B (mixed content), Fix C (CORS), Fix F-blocker2 (Turbopack source maps), Fix G-row3 (config-files), Fix I (directory listing), Fix K-blocker2 (broken page layout wrap), **Fix L (Batch 5 — 8 sub-items)**
- ⏸️ BugBuzzer team bugs to report: Fix E (silent regression when blocked), Fix J (http-baseline transient errors) — no longer affecting us but worth reporting

---

## Rule going forward

Every batch scan surfaces its own issues. As soon as an issue is confirmed as "needs a fix" (not a scanner false positive we accept, not a Phase B deferral), add it to this backlog with proper Owner + Priority + Fix steps + Verification. Then you can move on to the next batch without losing the item.
