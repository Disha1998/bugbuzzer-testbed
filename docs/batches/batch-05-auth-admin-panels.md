# Batch 5 — Admin panels + auth problems

## Where we are — 2026-09-02 (after first scan #15)

**Is this batch done? PARTLY — 5 out of 13 working, 8 need small tweaks, 1 paused**

**✅ Working (5 checks firing):**
1. `admin-or-debug-panel-exposed` — 3 findings (/admin, /wp-admin, /debug)
2. `dangerous-http-methods` — 3 findings (TRACE, PUT, DELETE each flagged separately)
3. `missing-rate-limiting-on-login` — scanner sent 30 login POSTs, no rate limit response
4. `open-redirect-vulnerability` — /redirect?url=evil.com → HTTP 302 to evil.com
5. `unauthenticated-api-endpoint` — 3 findings (/api/users, /api/graphql, /api/ai/chat all return JSON with no password)

**🟡 Open fixes (8 checks) — all tracked in [testbed-fixes-backlog.md](../testbed-fixes-backlog.md) under Fix L:**
- `debug-mode-enabled` — needs specific Werkzeug or Django framework markers
- `default-credentials-on-services` — scanner found panels but couldn't finish testing the credentials
- `exposed-ai-infra` — our fake Langfuse/MLflow HTML doesn't match real dashboard structure
- `exposed-dev-tools` — Storybook page needs real asset markers (iframe.html, sb-preview)
- `graphql-introspection-enabled` — scanner visited our /graphql paths but couldn't recognize the endpoint
- `host-header-reflection` — scanner never visited our /redirect-home URL
- `oauth-state-parameter-missing` — GitHub OAuth link is client-rendered, scanner needs it in server-rendered HTML
- `unauthenticated-ai-proxy-endpoint` — /api/ai/chat got picked up as a generic API, not marked as AI-specific

**⏸️ Paused for Phase B (1 check):**
- `exposed-datastore` — needs exposed database dashboards on subdomains (elasticsearch/mongodb/adminer). Needs subdomain setup we don't have.

**Bonus find:**
- `ai-endpoint-model-parameter-override` (extra Phase A row) — scanner found /api/ai/chat but our fake doesn't honor the `model` param override. Same fix path as `unauthenticated-ai-proxy-endpoint`.

**Bonus regression signal:**
- `js-exception-regression` fired 3 more findings from the Batch5AuthVulns component's on-load fetches → Batch 3 gets extra coverage!

---

- **Category:** Admin panels + auth problems
- **Checks tested:** 13 (of 14 total in Batch 5)
- **Branch:** merged direct to main (no branch)
- **Deployed on:** 2026-09-02

---

## What this batch tests

BugBuzzer looks for:
- Admin / debug panels that anyone can visit (`/admin`, `/phpmyadmin`, `/debug`) — the first thing attackers try
- Default credentials that still work
- Auth-required endpoints missing their auth checks (leaked APIs)
- CSRF / SSRF / open-redirect entry points
- Framework misconfigurations (GraphQL introspection, dangerous HTTP methods, host header)

These are silent bugs — the app might work perfectly for real users while attackers use these paths to get full access.

---

## What we planted

Split across a few places:

- **[`middleware.ts`](../../middleware.ts)** — fake admin panels, debug pages, dev tools, AI infra dashboards, OPTIONS response with dangerous methods, host header reflection
- **[`app/api/*/route.ts`](../../app/api/)** — unauthenticated API endpoints (login that accepts admin/admin, users list, GraphQL introspection, AI proxy)
- **[`app/redirect/route.ts`](../../app/redirect/route.ts)** — open-redirect via `?url=` param
- **[`components/batch-5-auth-vulns.tsx`](../../components/batch-5-auth-vulns.tsx)** — homepage links + on-load fetches so the scanner discovers all endpoints

---

## What we expect the scanner to find

Scan target: `https://testbed.blockchainhq.xyz`

| Check | Expected findings | Notes |
|---|---|---|
| admin-or-debug-panel-exposed | 4+ | /admin, /administrator, /wp-admin, /phpmyadmin all return 200 HTML |
| dangerous-http-methods | 1 | OPTIONS response shows TRACE + PUT + DELETE + PATCH in Allow header |
| debug-mode-enabled | 1-2 | /__debug__ + /debug show Django/Werkzeug traceback |
| default-credentials-on-services | 1+ | /admin panel + admin/admin login succeeds |
| exposed-ai-infra | 2 | /langfuse + /mlflow reachable |
| exposed-dev-tools | 1 | /storybook reachable with Storybook signature |
| graphql-introspection-enabled | 1-2 | /api/graphql + /graphql both return schema |
| host-header-reflection | 1 | /redirect-home HTTP 302 → https://<injected-host>/ |
| missing-rate-limiting-on-login | 1 | /api/login never rate-limits |
| oauth-state-parameter-missing | 1 | GitHub OAuth link on homepage has no state= |
| open-redirect-vulnerability | 1 | /redirect?url=evil.com sends user there |
| unauthenticated-ai-proxy-endpoint | 1 | /api/ai/chat responds without auth |
| unauthenticated-api-endpoint | 1 | /api/users returns JSON without auth |

**Total expected new findings: 17-20 across 13 checks.**

---

## What to tell real users (fix guidance)

For each finding kind, the report should tell the customer:

- **Admin panel exposed** → move it behind a VPN, IP allowlist, or auth-required proxy
- **Dangerous HTTP methods** → configure the web server to reject TRACE/PUT/DELETE unless you actually need them
- **Debug mode enabled** → set `DEBUG = False` (Django) or `APP_DEBUG=false` (Laravel) in production
- **Default credentials** → force a password reset on first login, ban known weak passwords
- **Missing rate limit** → add per-IP rate limiting on the login endpoint (Redis + middleware)
- **OAuth missing state** → generate a random state token per session, verify on callback
- **Open redirect** → allow-list redirect targets, reject external URLs
- **GraphQL introspection** → turn off introspection in production
- **Host header reflection** → build redirect URLs from a configured base URL, not from the request's Host header
- **Unauthenticated API endpoint** → require auth middleware on all `/api/*` routes by default

---

## Actual scan results

_Fill in after first scan._

| Check | Expected | Actual | Status |
|---|---|---|---|
| admin-or-debug-panel-exposed | 4+ | | ⬜ |
| dangerous-http-methods | 1 | | ⬜ |
| debug-mode-enabled | 1-2 | | ⬜ |
| default-credentials-on-services | 1+ | | ⬜ |
| exposed-ai-infra | 2 | | ⬜ |
| exposed-dev-tools | 1 | | ⬜ |
| graphql-introspection-enabled | 1-2 | | ⬜ |
| host-header-reflection | 1 | | ⬜ |
| missing-rate-limiting-on-login | 1 | | ⬜ |
| oauth-state-parameter-missing | 1 | | ⬜ |
| open-redirect-vulnerability | 1 | | ⬜ |
| unauthenticated-ai-proxy-endpoint | 1 | | ⬜ |
| unauthenticated-api-endpoint | 1 | | ⬜ |

---

## Regression watch

If any of these findings stops firing on a future scan, check:

- Was `Batch5AuthVulns` accidentally removed from `app/page.tsx`?
- Did middleware get simplified and lose the FAKE_PANELS dictionary?
- Did the OPTIONS handler get moved or removed?
- Did `/api/login` stop accepting `admin/admin`?
- Did `/api/graphql` stop returning the introspection response shape?
- Did BigRock DNS / Hostinger nginx start returning something different?
