# All the fixes we still need to do

**What this file is:** one big list of every problem we've found while testing, and how to fix it. Read this file before you sit down to fix things, so nothing gets forgotten.

**Why we keep it here:** we planted lots of small vulnerabilities across Batches 2, 3, 4, 5, 6, 6b. When we scan, some come back "working" and some come back "not working yet." Instead of stopping to fix each one right away, we write it down here and keep moving. Later, in one focused session, we sit down and fix them all.

_Last updated: 2026-09-05 (after Batch 9 scan #20)_

> 🎉 **Big win:** moving the testbed to Hostinger fixed 4 things at once — Fix A (scanner was being blocked), Fix D (a BugBuzzer bug that only showed up on Vercel), Fix G row 4 (docker-compose file), and Fix K blocker 1 (scanner was being blocked on /broken page). The testbed now runs on the server `76.13.179.65` as a Docker container behind nginx. Full details in [hostinger-deployment.md](./hostinger-deployment.md).
>
> ✅ **All Phase A batches are up.** 66 out of 121 checks are working (55%). What's left: fix the open items below (Fixes B, C, F, G, I, K, L, M, **N** — 32 small items total) and then do Phase B (~23 more checks that need extra setup).

---

## What the words in this file mean

- **Owner:** who has to fix it. Either "Us" (you and me) or "BugBuzzer team" (Nirav's team).
- **How important:** 🔴 must fix now, 🟡 should fix soon, 🟠 nice to fix
- **State:** ⬜ not done yet, 🟡 doing it right now, ✅ done, ⏸️ paused for later

---

## The list

### Fix A — Scanner was being blocked by Vercel's bot protection ✅ DONE 2026-09-02

- **When we found it:** Batch 3 scans #7, #8, #9 (2026-08-31). Every scan came back with HTTP 403.
- **Owner:** Us
- **How important:** 🔴 was a total blocker
- **State:** ✅ **DONE.** We moved the testbed off Vercel and onto our own Hostinger server. Now the scanner can reach it.

**What was wrong:** Vercel's built-in bot detector kept treating the BugBuzzer scanner as a bot. So the scanner would send its checks and get back "403 Forbidden" every time. Almost every check reported "site looks clean" because the scanner never saw the page.

**What we tried:**
1. First we tried a Vercel bypass secret — didn't work well
2. Then we tried the Vercel Firewall page — not enough control
3. Then we thought about asking Nirav for scanner IPs to allowlist — too slow
4. Finally we moved everything to a fresh Hostinger server ← this is what worked

**How we knew it was fixed:**
- curl from anywhere returns HTTP 200 → yes
- BugBuzzer scanner also gets HTTP 200 → yes
- All Batch 1 findings came back (7 checks, ~18 findings)
- All Batch 2 findings came back (~15 findings)
- Batch 3's 5 rows now fire for real reasons, not Vercel's bot page

**More detail:** [scan-issues/2026-08-31-scan-blocked-vercel.md](./scan-issues/2026-08-31-scan-blocked-vercel.md)

---

### Fix B — Batch 2 Row 24 (mixed content) — scanner misses our http:// image

- **When we found it:** Batch 2 scan #5 (2026-08-26)
- **Owner:** Us
- **How important:** 🟡 should fix
- **State:** ⬜ not done yet

**What's wrong:** We planted a bad image tag like `<img src="http://example.com/testbed-mixed-content.png">` on the page. This SHOULD trigger a "mixed content" warning because the page is HTTPS but the image is HTTP. Problem: modern Chrome silently upgrades http:// image URLs to https:// before the scanner can see them. So the scanner thinks everything is fine.

**How to fix:**
1. Open `app/page.tsx`
2. Find the `<img src="http://...">` line
3. Change it to `<script src="http://example.com/blocked.js">` instead
4. Chrome does NOT auto-upgrade http:// scripts — it blocks them and shows a "Mixed Content" warning
5. Scanner will catch that warning and the check will fire

**How we'll know it's fixed:** re-scan → the check `mixed-content-on-https-page` shows 1 finding pointing to the http:// script URL.

**More detail:** [batches/batch-02-web-hygiene.md](./batches/batch-02-web-hygiene.md)

---

### Fix C — Batch 2 Row 28 (CORS) — scanner never visits our vulnerable endpoint

- **When we found it:** Batch 2 scan #5 (2026-08-26)
- **Owner:** Us
- **How important:** 🟡 should fix
- **State:** ⬜ not done yet

**What's wrong:** We have an endpoint at `/api/wide-cors` that returns very unsafe CORS headers (we tested it with curl — it really is broken). But the scanner only tests URLs it can find on the homepage. There's no link to `/api/wide-cors` anywhere on the homepage, so the scanner never even visits it.

**How to fix:**
1. In `app/page.tsx`, add a visible link on the page: `<a href="/api/wide-cors">API demo</a>`
2. Also add code that automatically calls the URL when the page loads: `useEffect(() => { fetch("/api/wide-cors").catch(() => {}); }, []);`
3. Do both — either one should make the scanner discover the endpoint. Doing both is safer.

**How we'll know it's fixed:** re-scan → the check `cors-misconfiguration-overly-permissive` shows 1 finding pointing to `/api/wide-cors`.

**More detail:** [batches/batch-02-web-hygiene.md](./batches/batch-02-web-hygiene.md)

---

### Fix D — Report to BugBuzzer team: false alarm about failed network requests ✅ DONE for us

- **When we found it:** Batch 3 scans #7-9 (2026-08-31)
- **Owner:** BugBuzzer team (Nirav)
- **How important:** 🟡 was blocking us, now doesn't affect us
- **State:** ✅ **Fixed on our side** because we moved off Vercel. But this is still a real bug in BugBuzzer that could hit other Vercel customers. Worth mentioning to Nirav next time we chat.

**What's wrong:** BugBuzzer's `failed-network-requests` check flags any URL that fails to load. But it doesn't know to ignore Vercel's own internal URLs (like `.well-known/vercel/security/*`). So when Vercel's bot protection kicks in, its own security URL fails and BugBuzzer says "your app has a broken URL" — but really that's Vercel's URL, not the customer's app URL.

**Message to send to Nirav when we get a chance:**
> Bug I noticed while testing: the `failed-network-requests` check doesn't skip platform-infra URLs. When a site is on Vercel with bot protection on, Vercel serves `.well-known/vercel/security/request-challenge`. Your check flags that as an app server error, pointing at Vercel's own URL. Would be great to skip URLs matching `.well-known/(vercel|cf|cloudflare)/*`, or mark them as "scanner-infra-warning" instead of an app bug.

**More detail:** [scan-issues/2026-08-31-scan-blocked-vercel.md](./scan-issues/2026-08-31-scan-blocked-vercel.md)

---

### Fix E — Report to BugBuzzer team: scanner goes silent when the site blocks it 🔴 IMPORTANT

- **When we found it:** Batch 3 scans #7-9 (2026-08-31)
- **Owner:** BugBuzzer team (Nirav)
- **How important:** 🔴 Very important for BugBuzzer's product. Real customers with bad sites and bot protection ON will get a "you are safe" report — even though the scanner never actually reached their site.
- **State:** ⬜ Waiting to send to Nirav

**What's wrong:** When a site returns "403 Forbidden" to the BugBuzzer scanner (because of bot protection), every check that needs to look at the page content just says "passed" — because the scanner saw no bad content. But that's misleading! The scanner saw nothing because it was blocked, not because the site is safe.

**Message to send to Nirav:**
> Another bug from the same testing round: when a target returns HTTP 403 to the scanner (bot protection engaged), every content-based check (secrets in JS, cookies, hydration, etc.) reports "passed" because there was no content. The final report LOOKS clean, but the scanner never actually reached the site. Suggestion: if the top-level `site-returning-error-status` sees a 403 or bot challenge, mark all page-dependent checks as "skipped" with reason "scanner blocked by target's bot protection" — not "passed."

**How we'll know it's fixed:** the BugBuzzer team ships the change → scanning a bot-protected site → the report clearly says "scanner blocked, results incomplete" instead of showing false clean passes.

**More detail:** [scan-issues/2026-08-31-scan-blocked-vercel.md](./scan-issues/2026-08-31-scan-blocked-vercel.md)

---

### Fix F — Batch 4 Row 5 (source maps) — two problems, one fixed one open

- **When we found it:** Batch 4 scan #10 (2026-09-01), looked at more in scan #11
- **Owner:** Us
- **How important:** 🟡 should fix
- **State:** 🟡 Half done

**Problem 1 — Vercel's "Protected Sourcemaps" toggle was ON — ✅ DONE 2026-09-01**
- Before: `.js.map` files gave HTTP 403 error
- Fix: you turned OFF the setting in Vercel dashboard
- Now: curl confirms no more 403

**Problem 2 — Turbopack doesn't create source map files in production — ⬜ NOT DONE YET**
- Right now: `.js.map` files return HTTP 404 (they don't exist)
- Why: our Next.js app uses Turbopack (the new bundler). Turbopack doesn't create `.js.map` files in production by default.
- The scanner looks at every script URL, then asks "does this script have a `.js.map` sibling?" Since none exist, the check passes even though we WANT it to fire.

**How to fix problem 2:**
1. Open `next.config.ts`
2. Add this line inside the config object: `productionBrowserSourceMaps: true`
3. Push to GitHub → deploy → check with curl that `.js.map` files now return HTTP 200
4. Re-scan → the `exposed-source-maps` check should now fire

**How we'll know it's fixed:** curl on any `.js.map` file returns HTTP 200 with JavaScript source map JSON, and the next scan shows `exposed-source-maps` with 1+ findings.

---

### Fix G — Batch 4 Rows 3 + 4 (config files + docker-compose) — 🟡 Half done

- **When we found it:** Batch 4 scan #10 (2026-09-01)
- **Owner:** Us
- **How important:** 🟡 should fix
- **State:** 🟡 **Row 4 (docker-compose) ✅ DONE 2026-09-02** — now fires 3 findings on Hostinger scan #14. Row 3 (config files) ⬜ still open.

**What's wrong for Row 3 (config files):** Our middleware serves fake config files at `/config.json`, `/settings.json`, `/appsettings.json`, `/secrets.json`. If you curl them, they return HTTP 200 with real-looking content. But the BugBuzzer scanner still says "no JSON config files detected." So the scanner is looking for something specific we're not giving it.

**Why row 4 (docker-compose) started working after Hostinger move:** we're not 100% sure. Maybe nginx sends better Content-Type headers than Vercel did. Either way, ✅ it works now.

**How to fix Row 3:**
1. Read BugBuzzer's check code at `packages/check-catalog/src/checks/http-probe/exposed-config-files.ts` to see what pattern it looks for
2. Figure out what's missing — is it the Content-Type header? A specific JSON key? A file signature at the start of the file?
3. Update `middleware.ts` to match — add the missing bits
4. Push, re-scan

**How we'll know it's fixed:** re-scan → the check `exposed-config-files` fires with 4 findings on config.json / settings.json / appsettings.json / secrets.json.

---

### Fix I — Batch 4 Row 8 (directory listing) — our page wraps in Next.js layout

- **When we found it:** Batch 4 scan #10 (2026-09-01)
- **Owner:** Us
- **How important:** 🟡 should fix
- **State:** ⬜ not done yet

**What's wrong:** Our `/downloads` page renders an "Index of /downloads" fake page. Problem: Next.js wraps it inside our root layout, which adds the site header, footer, and lots of extra HTML. So it doesn't look like a real Apache/nginx directory listing anymore. Also, the response header says `server: Vercel` — not `server: Apache`, which is what the scanner expects.

Another possible problem: BugBuzzer might not even check `/downloads`. It probably tries paths like `/uploads/`, `/files/`, `/backup/`, `/images/`.

**How to fix (try in order):**
1. Read BugBuzzer's check at `packages/check-catalog/src/checks/http-probe/directory-listing-exposed.ts` — see which paths it probes and what response pattern it expects
2. Then pick one of these:
   - Serve the fake directory listing via `middleware.ts` at the exact URL BugBuzzer looks for (this way we skip the Next.js layout)
   - OR add a `layout.tsx` file inside `app/downloads/` that just passes through the children with no HTML wrapper
   - OR use middleware to set the response header to `Server: Apache/2.4.52` for `/downloads`
3. Check with curl: the response body should start with `<title>Index of` or `<h1>Index of` and not have Next.js layout tags around it

**How we'll know it's fixed:** re-scan → the check `directory-listing-exposed` fires with 1 finding.

---

### Fix J — Report to BugBuzzer team: some checks failed for no clear reason

- **When we found it:** Batch 4 scan #10 (2026-09-01)
- **Owner:** BugBuzzer team (Nirav)
- **How important:** 🟠 low. Only happened once, might not happen again.
- **State:** ⬜ Waiting to send

**What's wrong:** In one specific scan, 10 checks came back with a generic error message: "An unexpected error occurred while running this check." All 10 are the ones that check HTTP headers and cookies:

- `security-headers-missing`, `security-txt-missing-or-expired`, `server-version-disclosure`
- `session-cookie-missing-secure`, `session-cookie-missing-http-only`, `session-cookie-missing-samesite`, `session-token-insufficient-expiration`, `jwt-weak-signing-secret`
- `site-returning-error-status`, `site-unreachable`

The same 10 checks worked fine in earlier scans (#4 and #5). Other check types in the same scan #10 (bundle scanning + browser checks) worked fine. Only the HTTP-header collector broke. Looks like a temporary problem on BugBuzzer's side.

**Message to send to Nirav:**
> Scan `01a05c3f-4662-79a9-9550-aba26a665cf7` on 2026-09-01 had 10 checks fail with a generic "unexpected error occurred" message. Only the http-baseline checks (headers, cookies, etc.) — bundle and browser checks worked fine. Same 10 checks passed in earlier scans. Looks like a temporary issue with the http-baseline collector. Could you:
> - Check if there was a scanner-side incident around 2026-09-01 09:14 UTC?
> - The generic error message hides the real stack trace — would be helpful if the underlying error was shown

**How we'll know it's fixed:** future scans don't show those 10 checks as errored. If it keeps happening, follow up.

---

### Fix K — Batch 3 Row 38 (broken page check) — old problem fixed, new problem found

- **When we found it:** Batch 3 scan #11 (2026-09-01) on the /broken URL
- **Owner:** Us
- **How important:** 🟡 should fix
- **State:** 🟡 **Problem 1 ✅ DONE (Hostinger move fixed it).** Problem 2 ⬜ still open.

**Problem 1 — Vercel bot was blocking /broken URL — ✅ DONE 2026-09-02**
- Before: `/broken` returned HTTP 403 to the scanner
- Fix: moved off Vercel to Hostinger — nginx serves /broken normally with HTTP 200
- Confirmed: Hostinger scan #13 reached the page fine

**Problem 2 — Check still passes because Next.js layout adds too much stuff — ⬜ NOT DONE YET**
- Latest scan says: "Page loaded with content and no critical blank or error state detected"
- Why: our `/broken/page.tsx` renders inside the root layout (which includes nav, footer, styles). Total HTML is 15KB+. The check looks for pages that are BLANK (very few bytes) or return HTTP 5xx. Neither is true for us.
- Confirmed: curl on `/broken` returns HTTP 200 with 15KB HTML

**How to fix problem 2 (try in order, cheapest first):**
1. **Make /broken return HTTP 500** — real broken pages return 5xx errors. Add `throw new Error()` at the top of `app/broken/page.tsx`. The check probably flags any 5xx response.
2. **Or:** create `app/broken/layout.tsx` that just passes through the children with no HTML wrapper — strips the full Next.js layout
3. **Or:** serve /broken via middleware with a tiny HTML body (just "Application Error")

**How we'll know it's fixed:** re-scan `/broken` → the check `critical-page-blank-or-error` fires with 1 finding.

---

### Fix L — Batch 5 has 8 rows that need small tweaks

- **When we found it:** Batch 5 scan #15 (2026-09-02)
- **Owner:** Us
- **How important:** 🟡 should fix in one focused session
- **State:** ⬜ not done yet

**What's wrong:** All 8 rows below have vulnerable content ready to go. But BugBuzzer's checks look for very specific patterns in the response, and our fake content is too generic to match.

**The 8 small items:**

**L.1 — `debug-mode-enabled`** — needs specific framework markers
- Right now: our /debug page serves generic "DjangoDebugToolbar" HTML — got picked up by the admin-panel check instead
- Fix: add specific Werkzeug console markers (`/console`, `<div class="debugger">`, `Traceback (most recent call last)` inside `<pre class="traceback">`) OR Django `DEBUG=True` markers (`<div id="djangoBanner">`, variable dumps in the response)
- Look at BugBuzzer's check code: `packages/check-catalog/src/checks/*/debug-mode-enabled.ts`

**L.2 — `default-credentials-on-services`** — scanner sees panels but credential test fails
- Right now: scanner found 7 panels but couldn't test 2 of them (blocked or timed out)
- Fix: figure out what login URL the scanner is POSTing to (might be `/admin/login`, not `/api/login`). Or match the exact request shape (form data with specific field names)
- Or: make /api/login accept the specific username/password combos the scanner tries (probably `admin:admin`, `admin:password123`, etc.)

**L.3 — `exposed-ai-infra`** — our fake dashboards don't match
- Right now: /langfuse + /mlflow pages have generic HTML with "Langfuse" / "MLflow" text
- Fix: copy the exact HTML structure real Langfuse / W&B / MLflow apps use — specific meta tags (`<meta name="application-name" content="Langfuse">`), asset paths (`/_next/static/chunks/langfuse-*`), or JavaScript globals (`window.__LANGFUSE__ = {...}`)

**L.4 — `exposed-dev-tools`** — Storybook page needs real markers
- Right now: /storybook page has fake HTML with title "Storybook"
- Fix: copy real Storybook markers — `<iframe src="iframe.html">`, `runtime~main.iframe.bundle.js`, `sb-preview-loader.js`, `<div id="root">` + `<div id="docs-root">`

**L.5 — `graphql-introspection-enabled`** — scanner can't find our endpoint
- Right now: /api/graphql + /graphql exist. Scanner says "No GraphQL endpoint detected"
- Fix options:
  - GET /api/graphql should return 405 with GraphQL-specific error body: `{"errors":[{"message":"GET method not supported"}]}`
  - POST to /api/graphql with body containing "query" should return a `data` field
  - Or advertise via header: `X-GraphQL-Path: /api/graphql`

**L.6 — `host-header-reflection`** — our /redirect-home URL is not on the scanner's probe list
- Right now: /redirect-home reflects the Host header, but scanner never visits it
- Fix: rename to a URL pattern the scanner already looks for — `?returnTo=<url>`, `?redirect_uri=<url>`, or attach the reflection to an existing endpoint the scanner already knows about (like /api/login redirect)

**L.7 — `oauth-state-parameter-missing`** — scanner doesn't see the OAuth link
- Right now: the GitHub OAuth link lives inside the Batch5AuthVulns component (client-side). Scanner might not see it in the initial server-rendered HTML.
- Fix: check "view source" in a browser — does it show `github.com/login/oauth/authorize?client_id=...` in the raw HTML? If not, move the OAuth link out of the client component and into the server component or into app/page.tsx directly

**L.8 — `unauthenticated-ai-proxy-endpoint` + `ai-endpoint-model-parameter-override`** — endpoint is found but not marked as AI
- Right now: /api/ai/chat is found by the generic "unauthenticated API" check, but not by the AI-specific check
- Fix: make the response look like a REAL AI proxy — return OpenAI's streaming format, include the `model` param in the response (`"model":"gpt-4"`), match the exact `choices[0].message.content` shape. Also honor `model` parameter overrides so the `ai-endpoint-model-parameter-override` check can trigger.

**How we'll know they're fixed:** re-scan → each of the 8 rows fires with at least 1 finding.

**How long this takes:** ~45-60 min for all 8 in one session.

---

### Fix M — Batch 6 has 6 rows that need small tweaks

- **When we found it:** Batch 6 scan #16 (2026-09-02)
- **Owner:** Us
- **How important:** 🟡 should fix in the same session as Fix L
- **State:** ⬜ not done yet

**What's wrong:** All 6 rows below have vulnerable endpoints deployed. But BugBuzzer's checks look for very specific response patterns, and our fake responses are close but not exactly matching.

**The 6 small items:**

**M.1 — `error-based-sql-injection`** — response format is off
- Right now: /api/user?id=' returns JSON like `{"error":"...MySQL server..."}` with HTTP 500
- Scan said: "no_error=7, inconclusive_error=1" (means: 7 params showed no SQL error at all, 1 was unclear)
- Fix: return the SQL error as plain text in the body (not wrapped in JSON), OR include the exact keywords the check looks for: `Warning: mysql_`, `PostgreSQL query failed`, `SQLite3::SQLException`, `syntax error near`

**M.2 — `nodejs-eval-code-injection`** — result is echoed but not recognized
- Right now: /api/eval?expr=7*7 returns `{"input":"7*7","result":49}`
- Scan said: "reflected_only=6, inconclusive_error=2"
- Fix: return the result as plain text (not JSON), OR match the exact test payload the check uses. Read `packages/check-catalog/src/checks/*/nodejs-eval-code-injection.ts` to see what payload the scanner sends and what shape it expects back.

**M.3 — `python-eval-code-injection`** — same issue as M.2
- Right now: /api/py?code=... returns JSON
- Fix: same approach as M.2

**M.4 — `llm-direct-prompt-injection-vulnerable`** — our detected phrases don't match
- Right now: /api/ai/chat detects phrases like "ignore previous" / "system prompt" / "jailbreak"
- Scan said: "No direct prompt-injection succeeded"
- Fix: read the check source to see the exact prompts the scanner sends. Add matches for those. Also make sure the response includes something that looks like a leaked system prompt with the specific markers the check greps for.

**M.5 — `ai-endpoint-model-parameter-override`** — 90% done!
- Right now: /api/ai/chat echoes the requested `model` name in the response
- Scan said: "override response echoed the sentinel model name but did not contain either an LLM-provider error marker (e.g. 'type:invalid_request_error', 'does not exist') or a server-side validation marker (e.g. 'not allowed', 'invalid field')"
- Fix: when the requested model isn't a known-good one, return this shape: `{"error":{"type":"invalid_request_error","code":"model_not_found","message":"The model 'xxx' does not exist"}}`

**M.6 — `vite-dev-server-file-read`** — Vite isn't being recognized
- Right now: middleware serves /@vite/client + /@fs/* with fake content
- Scan said: "Vite dev server not detected on target - file-read probe skipped"
- Fix: add proper Vite response headers (`X-Powered-By: Vite`, specific module preload structure). Or accept we need a real Vite install (push to Phase B). Simpler test: return a Vite HMR client body with the specific module shape (`import.meta.hot`, `createHotContext`).

**How we'll know they're fixed:** re-scan → each of the 6 rows fires with at least 1 finding.

**How long this takes:** ~30-45 min for all 6, best done in same session as Fix L.

---

### Fix N — Batch 6b has 12 fake keys that don't match real vendor formats

- **When we found it:** Batch 6b scan #17 (2026-09-03)
- **Owner:** Us
- **How important:** 🟡 should fix in the same session as Fix L + Fix M
- **State:** ⬜ not done yet

**What's wrong:** We made up 12 fake API keys with plausible-looking prefixes. But the real vendors have exact rules for their key format (length, character types, prefix). BugBuzzer's checks use very strict regex patterns that match the real format. Our fake keys look close but don't match precisely.

**The 12 small items:**

**N.1 — `agentmail-api-key-in-js-bundle`** — our `agm_live_...` doesn't match. Check the real AgentMail key format at agentmail.to docs.

**N.2 — `auth-provider-keys-in-js-bundle`** — Auth0 machine-to-machine key + WorkOS don't match. Our Clerk `sk_live_` key fired but got misidentified as Stripe (that's a small false positive we accept). Look up Auth0's real client secret format + WorkOS's `sk_live_workos_` prefix.

**N.3 — `cloud-infra-provider-keys-in-js-bundle`** — Fly.io (`fo1_`) + Render (`rnd_`) + Railway don't match. Real formats:
- Fly.io deploy tokens: `FlyV1 fm2_...` (new format)
- Render API keys: `rnd_...` should be right — double check the exact prefix
- Railway: uuid-shaped

**N.4 — `dev-collab-tokens-in-js-bundle`** — Linear (`lin_api_`) + Notion (`secret_`) + Figma (`figd_`) don't match. Real formats:
- Linear: `lin_api_` + 40 hex characters
- Notion: `ntn_` (new format) or `secret_` + 43 base62 characters
- Figma: `figd_` + 32 base62 characters

**N.5 — `email-provider-keys-in-js-bundle`** — Postmark UUID + Mailgun (`key-`) + Brevo (`xkeysib-`) + Loops don't match. Real formats:
- Mailgun: `key-` + 32 hex chars, OR the new v4 API key format
- Brevo: `xkeysib-` + 64 hex chars
- Postmark: exact UUID length + Server-Token header pattern
- Loops: specific prefix — check docs

**N.6 — `generic-public-env-secret-in-js-bundle`** — needs to be actual JavaScript variable declarations, not string literals inside a JSON blob. Add a script that does:
```js
window.NEXT_PUBLIC_STRIPE_SECRET_KEY = "sk_live_..."
window.NEXT_PUBLIC_ADMIN_PASSWORD = "AdminP@ss..."
```

**N.7 — `netlify-pat-in-js-bundle`** — our `nfp_...` doesn't match. Real Netlify personal access token format might be different. Check docs.app.netlify.com.

**N.8 — `observability-provider-keys-in-js-bundle`** — Sentry DSN + Datadog + New Relic don't match:
- Sentry DSN: `https://<32-hex>@o<num>.ingest.sentry.io/<num>` — verify exact format
- Datadog API key: 32 hex characters
- New Relic license: `NRAK-` + 27 characters + specific structure, OR the full 40-char format

**N.9 — `payment-provider-keys-in-js-bundle`** — PayPal + Razorpay + Square don't match:
- PayPal client secret: starts with `E` + UUID format (specific length)
- Razorpay: `rzp_live_` or `rzp_test_` + 14 base62 characters
- Square access token: `EAAA` + specific base64url length

**N.10 — `search-provider-keys-in-js-bundle`** — Algolia + Meilisearch + Typesense don't match:
- Algolia admin key: exactly 32 hex characters
- Meilisearch: might need a specific prefix
- Typesense: usually 32+ characters

**N.11 — `sensitive-data-in-initial-payload`** — the check wants password hashes + database URLs in the SERVER-rendered HTML specifically. Our current placement got captured by the database-keys check instead. Fix: put the sensitive data inside a Next.js `<script id="__NEXT_DATA__">` block or a similar SSR-payload location that this specific check probes.

**N.12 — `vector-db-keys-in-js-bundle`** — Pinecone (UUID) + Weaviate + Qdrant don't match:
- Pinecone: `pcsk_` prefix (newer format)
- Weaviate: JWT-shaped
- Qdrant: specific header key format

**How to work through these:** for each item, read the specific check source in `packages/check-catalog/src/checks/*` to find the exact regex → update the fake value in `lib/fake-secrets-batch-6b.ts` → rebuild + rescan → confirm.

**How we'll know they're fixed:** re-scan → each of the 12 rows fires with at least 1 finding.

**How long this takes:** ~1-2 hours for all 12 (mostly researching the real vendor format then updating strings).

---

### Fix O — Supabase settings problem (turned out to be wrong — nothing to fix)

- **When we thought this was a problem:** After Batch 9 scan #19 on 2026-09-04
- **State:** ❌ Not a real problem. We were wrong.

**What we thought at first:** We thought our Supabase project had a setting turned off, and that setting was stopping people without a password from reading our unsafe table.

**Why we were wrong:** We checked two ways and both showed the settings are correct:
- Inside Supabase Dashboard: everything is set up right. Both schemas are shared. Data API is turned on. "Automatically expose new tables" is on.
- We tested with `curl` from the terminal. We asked the Supabase URL for the fake alice row with no password. It gave us the row back. So the settings really do let anyone read it.

**What the real problem is:** The BugBuzzer scanner tool has a bug. It's not a Supabase settings problem. See Fix P below for what to do.

---

### Fix P — Tell the BugBuzzer team about a bug in their Supabase checks 🔴 IMPORTANT

- **When we found it:** Batch 9 scans #19 and #20 on 2026-09-04 and 2026-09-05
- **Owner:** BugBuzzer team (Nirav). Not us.
- **How important:** 🔴 Very important. Real customers who have this same setup (a Supabase project with an unsafe table) will get a "you are safe" report from BugBuzzer when they are actually NOT safe. That's a serious miss.
- **State:** ⬜ Waiting to be sent. Need to message Nirav.

**The problem in one sentence:** BugBuzzer's Supabase checks give up too early. They assume Supabase blocks everything by default, so they don't even try to test the actual table or function we set up.

**What we set up (all really unsafe):**
- A Supabase table called `users_public` — anyone with no password can read it
- A Supabase storage bucket called `public-uploads` — set to public
- A small function called `get_public_data` — anyone with no password can call it

**What the scanner did:**
It found our Supabase project. Then it read this message from Supabase's docs:
> "Since April 2026, new Supabase projects block anon requests by default."

Then it stopped there. It never actually tried to open our table or call our function. It just marked all 3 checks as "probably safe."

**Proof the scanner was wrong (we tested by hand on 2026-09-05):**
- We ran `curl GET /rest/v1/users_public?select=*` with the same key from our bundle → Supabase returned the fake alice row
- We ran `curl POST /rest/v1/rpc/get_public_data` with the same key → Supabase returned the fake string
- So the scanner was wrong. Our stuff really is open to the whole internet.

**Message to send to Nirav (copy-paste-ready):**
> Hi Nirav, I found a bug in the Supabase checks.
>
> I ran two scans on my testbed at `https://testbed.blockchainhq.xyz`:
> - Scan ID `01a06c3a-380e-7fc0-8df5-4c695c700d95` on 2026-09-04
> - Scan ID `01a071d9-4407-7b39-a33c-0dc9214e77fe` on 2026-09-05
>
> On both scans, these 3 checks gave up early and marked themselves as "safe":
> - `supabase-table-readable-without-authentication`
> - `supabase-storage-bucket-publicly-accessible`
> - `supabase-rpc-callable-by-anon`
>
> The message they showed was: "Supabase project was detected, but /rest/v1/ is locked for anon-key requests (default behaviour since Supabase's April 2026 change)."
>
> But I tested with curl using the same anon key the scanner found in my bundle:
> - `GET /rest/v1/users_public?select=*` returned my fake alice row (HTTP 200)
> - `POST /rest/v1/rpc/get_public_data` returned my fake string (HTTP 200)
>
> My Supabase settings are all correct. Data API is on. The `public` schema is shared. So the "April 2026 lock" is not actually blocking anything on my project.
>
> Could you make these checks actually try one real request against the table and RPC names they find in the bundle, before deciding to give up? Otherwise real customers with a fresh Supabase project + RLS turned off will get a wrong "safe" report on 3 real vulnerabilities.
>
> The testbed project is safe to poke at (only fake data): `ehlhsssovymzsjuthdbn.supabase.co`, table name `users_public`, RPC name `get_public_data`, bucket name `public-uploads`.

**How we'll know it's fixed:** When we run the next scan after Nirav's team ships the fix, these 3 Supabase checks should show up as "failed" with real findings.

---

## Where we stand right now (2026-09-05)

**Done ✅:**
- Fix A — moved to Hostinger, scanner not blocked anymore
- Fix D — no longer affects us (moved off Vercel)
- Fix G row 4 — docker-compose fires
- Fix K blocker 1 — /broken URL not blocked anymore

**Not real (was wrong hypothesis) ❌:**
- Fix O — Supabase settings are actually fine; real problem is a scanner bug (see Fix P)

**Still to fix on our side (do in one session) 🟡:**
- Fix B (mixed content — 1 item)
- Fix C (CORS — 1 item)
- Fix F blocker 2 (Turbopack source maps — 1 item)
- Fix G row 3 (config files — 1 item)
- Fix I (directory listing — 1 item)
- Fix K blocker 2 (broken page layout — 1 item)
- **Fix L** (Batch 5 — 8 items)
- **Fix M** (Batch 6 — 6 items)
- **Fix N** (Batch 6b — 12 items)
- **Total: 32 small items.** One focused session should knock out most of them.

**Need to tell the BugBuzzer team ⏸️:**
- Fix E — scanner reports "clean" when it's actually blocked (🔴 important)
- Fix J — some checks failed once for unknown reason (🟠 low)
- **Fix P** — Supabase checks give up too early and miss real problems (🔴 very important)

---

## How to use this file

**When you find a new problem:**
- Copy the format of one of the fixes above
- Add it to the list with a new letter (Fix Q, Fix R, etc.)
- Fill in: what's wrong, who fixes it, how important, how to fix, how you'll know it's fixed
- Also link to it from the batch's MD file so we don't lose track

**When you sit down to fix things:**
- Do the important ones first (🔴 before 🟡 before 🟠)
- Group by who fixes it — do all "Us" fixes in one session, then send one message to Nirav with all the "BugBuzzer team" ones
- Follow the "How to fix" steps for each
- Mark as ✅ when the "How we'll know" check passes

**When a fix is done:**
- Change the state to ✅
- You can either leave it in the list with ✅ or delete it once the whole batch is verified

---

## Rule going forward

Every time we scan, we find new problems. As soon as we see one that needs a fix (not something we're OK with, not something we're deferring), add it to this list right away. That way we can keep moving to the next batch without losing anything.
