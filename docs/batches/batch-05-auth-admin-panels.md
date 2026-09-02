# Batch 5 — Auth & Admin Panels

## Status at a glance — 2026-09-02 (deployed, awaiting first scan)

**Batch complete? NO — 13 rows deployed, first scan pending**
- All 13 planted vulns live on Hostinger deployment
- 1 row deferred to Phase B: `exposed-datastore` (needs subdomain infra like `admin.testbed.blockchainhq.xyz`)
- Ready to scan `https://testbed.blockchainhq.xyz`

**Rows deployed:**
1. `admin-or-debug-panel-exposed` — fake admin panels at `/admin`, `/administrator`, `/wp-admin`, `/phpmyadmin`
2. `dangerous-http-methods` — middleware responds to OPTIONS with `Allow: GET, HEAD, POST, PUT, DELETE, PATCH, TRACE, OPTIONS`
3. `debug-mode-enabled` — fake Django/Werkzeug debug page at `/__debug__` and `/debug`
4. `default-credentials-on-services` — `/api/login` accepts `admin/admin`, `admin/password`, `root/root`, `administrator/administrator`
5. `exposed-ai-infra` — fake Langfuse at `/langfuse`, fake MLflow at `/mlflow`
6. `exposed-dev-tools` — fake Storybook at `/storybook`
7. `graphql-introspection-enabled` — `/api/graphql` + `/graphql` return full schema on introspection query
8. `host-header-reflection` — `/redirect-home` reflects Host header into 302 redirect Location
9. `missing-rate-limiting-on-login` — `/api/login` has no rate limit
10. `oauth-state-parameter-missing` — homepage has GitHub OAuth authorize link with no `state` param
11. `open-redirect-vulnerability` — `/redirect?url=<any>` redirects to arbitrary URL
12. `unauthenticated-ai-proxy-endpoint` — `/api/ai/chat` returns OpenAI-shaped response for any prompt, no auth
13. `unauthenticated-api-endpoint` — `/api/users` returns list of fake user records, no auth

**Deferred to Phase B:**
- `exposed-datastore` — requires exposed database dashboards (elasticsearch, mongodb, adminer) on subdomains. Scanner enumerates via crt.sh. Needs real subdomain setup.

---

**Category:** Auth & admin panel exposure
**BugBuzzer checks tested:** 13 (of 14 total Batch 5)
**Branch:** merged direct to main (no branch)
**Date added to testbed:** 2026-09-02

---

## What this batch tests

BugBuzzer looks for:
- Publicly reachable admin / debug panels attackers try first (`/admin`, `/phpmyadmin`, `/debug`)
- Default credentials that still work
- Auth-required endpoints missing auth checks (leaked APIs)
- CSRF / SSRF / open-redirect entry points
- Framework misconfigurations (GraphQL introspection, dangerous HTTP methods, host header)

These are silent bugs — the app might work perfectly for real users while attackers use these paths as entry points to full compromise.

---

## Vulnerabilities baked in

Split across three places:

- **[`middleware.ts`](../../middleware.ts)** — fake admin panels, debug pages, dev tools, AI infra dashboards, OPTIONS with dangerous methods, host header reflection
- **[`app/api/*/route.ts`](../../app/api/)** — unauth API endpoints (login accepting admin/admin, users list, GraphQL introspection, AI proxy)
- **[`app/redirect/route.ts`](../../app/redirect/route.ts)** — open-redirect via `?url=` param
- **[`components/batch-5-auth-vulns.tsx`](../../components/batch-5-auth-vulns.tsx)** — homepage links + on-load fetches so scanner discovers all endpoints

---

## Expected BugBuzzer scan results

Scan target: `https://testbed.blockchainhq.xyz`

| Check | Expected finding count | Notes |
|---|---|---|
| admin-or-debug-panel-exposed | 4+ | /admin, /administrator, /wp-admin, /phpmyadmin all return 200 HTML |
| dangerous-http-methods | 1 | OPTIONS shows TRACE + PUT + DELETE + PATCH in Allow header |
| debug-mode-enabled | 1-2 | /__debug__ + /debug show Django/Werkzeug traceback |
| default-credentials-on-services | 1+ | /admin panel + admin/admin login succeeds |
| exposed-ai-infra | 2 | /langfuse + /mlflow reachable |
| exposed-dev-tools | 1 | /storybook reachable with Storybook signature |
| graphql-introspection-enabled | 1-2 | /api/graphql + /graphql both return schema |
| host-header-reflection | 1 | /redirect-home 302 → https://<injected-host>/ |
| missing-rate-limiting-on-login | 1 | /api/login never rate-limits |
| oauth-state-parameter-missing | 1 | GitHub OAuth link on homepage has no state= |
| open-redirect-vulnerability | 1 | /redirect?url=evil.com redirects there |
| unauthenticated-ai-proxy-endpoint | 1 | /api/ai/chat responds without auth |
| unauthenticated-api-endpoint | 1 | /api/users returns JSON without auth |

**Total expected new findings: 17-20 across 13 checks.**

---

## Suggested fix (for real users)

For each finding kind, the user-facing report tells the customer:

- **Admin panel exposed** → move behind VPN, IP-allowlist, or auth-required proxy
- **Dangerous HTTP methods** → configure web server to reject TRACE/PUT/DELETE unless needed
- **Debug mode enabled** → set `DEBUG = False` (Django) or `APP_DEBUG=false` (Laravel) in production
- **Default credentials** → force password reset on first login, ban known weak passwords
- **Missing rate limit** → add per-IP rate limit on login endpoint (Redis + middleware)
- **OAuth missing state** → generate random state token per session, verify on callback
- **Open redirect** → allowlist redirect targets, reject external URLs
- **GraphQL introspection** → disable introspection in production
- **Host header reflection** → build redirect URLs from configured base URL, not request Host header
- **Unauth API endpoint** → require auth middleware on all `/api/*` routes by default

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

If any of these findings stops appearing on a future scan, investigate:

- Was `Batch5AuthVulns` accidentally removed from `app/page.tsx`?
- Did middleware get simplified and lose the FAKE_PANELS dict?
- Did the OPTIONS handler get moved / removed?
- Did `/api/login` stop accepting `admin/admin`?
- Did `/api/graphql` stop returning the introspection response shape?
- Did BigRock DNS / Hostinger nginx start returning something different?
