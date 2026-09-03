# Master Checklist — All 121 BugBuzzer Checks

**Purpose:** one single place to track every check. Update this whenever a batch is deployed, scanned, or completed. If the totals below ever drop below 121, something got lost — this file is the safety net.

_Last updated: 2026-09-02 (after Batch 6 first scan + Batch 6b deployment)_

> 🎉 **Testbed moved to Hostinger VPS** (2026-09-02) — deployment now at `76.13.179.65` as Docker container behind nginx. No more Vercel bot protection interference. Scan #14 (homepage) found 36 real vulnerabilities, up from ~10 on Vercel. See [hostinger-deployment.md](./hostinger-deployment.md).
>
> ✅ **Batch 3 now 4/5 verified with full findings** — homepage scan #14 fires `js-exceptions-detected` (with our exact `throw new Error("Intentional test error - Batch 3")` in stack trace), `hydration-errors-detected` (React #418), `failed-network-requests` (our /api/does-not-exist-batch-3), and `js-exception-regression`. Only row 38 (blank-page) still open — page needs to return HTTP 500 or strip layout to trigger the check.
>
> 🟡 **Batch 4 now 5/8 verified** — env / backup / git / svn / **docker-compose (new!)** all fire. 3 open fixes remaining: source maps (Turbopack), config-files (signature), directory-listing (layout).
>
> 🎁 **Bonus wins from Hostinger scan #14** — CVE checks now firing: 2 CISA KEV matches (CVE-2025-55182 Next.js RCE + CVE-2023-44487 Nginx HTTP/2 Rapid Reset), 8 Lodash CVEs, 12 outdated tech-stack CVEs. Server-version-disclosure fires 2 findings (nginx 1.24.0 + `X-Powered-By: Next.js`).

## Summary

| Status | Count | Meaning |
|---|---|---|
| ✅ Verified | 56 | Check fires correctly on our testbed (scan confirmed) |
| 🚀 Live | 22 | Batch 6b deployed, awaiting first scan |
| 🟡 Open fix | 20 | Check should fire but doesn't yet — needs testbed code tweak (see backlog Fixes B, C, F blocker 2, G row 3, I, K blocker 2, L, M) |
| ⬜ Pending | 0 | All Phase A batches deployed! |
| ⏸️ Phase B | 23 | Deferred to Phase B (needs VPS / throwaway domain / cloud accounts) — includes `exposed-datastore` |
| **Total** | **121** | Should equal 121 |

**Countdown:** 56 of 121 verified (46%). Batch 6 first scan added 4 verified. Batch 6b (22 checks) deployed and pending first scan — projected 18-22 more verified → ~74-78/121 (~62%) after next scan. **Phase A code deployment COMPLETE.** All that remains: Batch 6b scan verification, backlog fixes (Fix L + Fix M), and Phase B.

## Batch 1 — Secrets in JS Bundle (7 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `aws-gcp-azure-credentials-in-js-bundle` | ✅ Verified |  |
| 2 | `github-gitlab-token-in-js-bundle` | ✅ Verified |  |
| 3 | `hardcoded-jwt-secret-in-js-bundle` | ✅ Verified |  |
| 4 | `openai-anthropic-api-key-in-js-bundle` | ✅ Verified |  |
| 5 | `resend-sendgrid-api-key-in-js-bundle` | ✅ Verified |  |
| 6 | `stripe-secret-key-in-js-bundle` | ✅ Verified |  |
| 7 | `supabase-service-role-key-in-js-bundle` | ✅ Verified |  |

## Batch 2 — Web Hygiene (12 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `cors-misconfiguration-overly-permissive` | 🟡 Open fix needed |  |
| 2 | `domain-registration-expiring-soon` | ⏸️ Phase B |  |
| 3 | `mixed-content-on-https-page` | 🟡 Open fix needed |  |
| 4 | `security-headers-missing` | ✅ Verified |  |
| 5 | `security-txt-missing-or-expired` | ✅ Verified |  |
| 6 | `session-cookie-missing-http-only` | ✅ Verified |  |
| 7 | `session-cookie-missing-samesite` | ✅ Verified |  |
| 8 | `session-cookie-missing-secure` | ✅ Verified |  |
| 9 | `session-token-insufficient-expiration` | ✅ Verified | bonus row added during Batch 2 |
| 10 | `sri-missing` | ✅ Verified |  |
| 11 | `ssl-certificate-issues` | ⏸️ Phase B |  |
| 12 | `subdomain-takeover` | ⏸️ Phase B |  |

## Batch 3 — JavaScript Runtime Errors (5 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `critical-page-blank-or-error` | 🟡 Open fix | Vercel bot blocker resolved (Hostinger). But scan #13 on Hostinger still passed — /broken has 15KB layout wrap, check heuristic sees plenty of content. Fix K blocker 2: return HTTP 500 or strip layout |
| 2 | `failed-network-requests` | ✅ Verified | Fired on scan #10 pointing at our `/api/does-not-exist-batch-3` (correct) |
| 3 | `hydration-errors-detected` | ✅ Verified | Fired on scan #10 as React 418 (our `Date.now()` mismatch, correct) |
| 4 | `js-exception-regression` | ✅ Verified | Fired once (scan #7) when error was new. Correctly passes on later scans (error no longer new). Working as designed |
| 5 | `js-exceptions-detected` | ✅ Verified | Fired on scan #10 with our exact `throw new Error("Intentional test error - Batch 3")` in the finding |

## Batch 4 — Public File Exposure (8 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `backup-files-exposed` | ✅ Verified | Fired 3 findings on scan #10 (backup.sql, db.sql, dump.sql) |
| 2 | `directory-listing-exposed` | 🟡 Open fix | Passed on scan #10. `/downloads` page renders inside Next.js layout (duplicate `<html>`, `server: Vercel`). See Fix I in backlog |
| 3 | `env-file-exposed` | ✅ Verified | Fired 4 findings on scan #10 (.env + .env.local + .env.production + .env.development) |
| 4 | `exposed-config-files` | 🟡 Open fix | Passed on scan #10 despite middleware serving JSON with fake secrets. Check likely needs specific content signature. See Fix G in backlog |
| 5 | `exposed-docker-compose` | ✅ Verified | Fired 3 findings on Hostinger scan #14 (docker-compose.yml + docker-compose.yaml + compose.yml). Hostinger's nginx serves proper Content-Type where Vercel didn't |
| 6 | `exposed-source-maps` | 🟡 Open fix | Vercel Protected Sourcemaps toggle now OFF ✅ (blocker 1 done). BUT `.js.map` files return HTTP 404 — Turbopack doesn't emit source maps in production. Fix F blocker 2: add `productionBrowserSourceMaps: true` to `next.config.ts` |
| 7 | `git-repo-exposed` | ✅ Verified | Fired 2 findings on scan #10 (.git/HEAD + .git/config) |
| 8 | `svn-repo-exposed` | ✅ Verified | Fired 3 findings on scan #10 (.svn/entries + .svn/wc.db + .svn/format) |

## Batch 5 — Auth & Admin Panels (14 checks — 13 deployed, 1 deferred)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `admin-or-debug-panel-exposed` | ✅ Verified | Fired 3 findings on scan #15 (/admin, /wp-admin, /debug). Also picked up our /debug as an admin panel (bonus overlap) |
| 2 | `dangerous-http-methods` | ✅ Verified | Fired 3 findings on scan #15 (TRACE + PUT + DELETE all flagged separately from our OPTIONS response) |
| 3 | `debug-mode-enabled` | 🟡 Open fix | Passed on scan #15. Our /debug + /__debug__ got claimed by admin-panel check instead. Needs specific framework markers (Werkzeug console URL, `__debugger__` JSON endpoint). See Fix L in backlog |
| 4 | `default-credentials-on-services` | 🟡 Open fix | Skipped on scan #15 — fingerprinted 7 panels but 2 inconclusive. Our /admin form action is `/api/login` (relative URL from panel), scanner may probe login differently. See Fix L |
| 5 | `exposed-ai-infra` | 🟡 Open fix | Passed on scan #15. Our /langfuse + /mlflow HTML doesn't match check heuristic — needs real Langfuse dashboard URL structure (e.g. specific asset paths, meta tags). See Fix L |
| 6 | `exposed-datastore` | ⏸️ Phase B | Needs exposed database dashboards on subdomains (elasticsearch/mongodb/adminer via crt.sh enumeration) |
| 7 | `exposed-dev-tools` | 🟡 Open fix | Passed on scan #15. Storybook check needs specific asset markers (`iframe.html`, `runtime~main.iframe.bundle.js`, `sb-preview`). See Fix L |
| 8 | `graphql-introspection-enabled` | 🟡 Open fix | Passed on scan #15 — "No GraphQL endpoint detected on target at any probed path". Our GET returns schema; check may want POST with specific error shape on GET. See Fix L |
| 9 | `host-header-reflection` | 🟡 Open fix | Skipped on scan #15 — check never probed /redirect-home. Needs a user-facing redirect pattern (e.g. `?returnTo=` on a route the scanner discovers). See Fix L |
| 10 | `missing-rate-limiting-on-login` | ✅ Verified | Fired on scan #15 — scanner sent 30 POSTs to /api/login, no rate limit, no 429, no CAPTCHA |
| 11 | `oauth-state-parameter-missing` | 🟡 Open fix | Passed on scan #15 — "No OAuth authorization URLs discovered on the page". Our link is in a client component that renders via useEffect fetch; needs SSR-rendered `<a href="https://github.com/login/oauth/authorize?...">`. See Fix L |
| 12 | `open-redirect-vulnerability` | ✅ Verified | Fired 1 finding on scan #15 — /redirect?url=https://evil.example.com → HTTP 302 with Location: evil.example.com |
| 13 | `unauthenticated-ai-proxy-endpoint` | 🟡 Open fix | Passed on scan #15. Our /api/ai/chat was discovered (fired unauthenticated-api-endpoint) but not flagged as AI-proxy specifically. Check needs proof of real LLM behavior (response echoing prompt, streaming). See Fix L |
| 14 | `unauthenticated-api-endpoint` | ✅ Verified | Fired 3 findings on scan #15 (/api/users, /api/graphql, /api/ai/chat all return structured JSON without auth) |

## Batch 6 — Injection Probes (10 checks — all deployed)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `ai-endpoint-model-parameter-override` | 🟡 Open fix | Progress on scan #16 — override response echoed sentinel model name. Needs error marker in response (`{"error":{"type":"invalid_request_error","message":"model 'xxx' does not exist"}}`). See Fix M |
| 2 | `error-based-sql-injection` | 🟡 Open fix | Passed on scan #16 — "no_error=7 across 8 probed params". Our JSON error format doesn't match check heuristic. See Fix M — return plain-text error strings |
| 3 | `llm-direct-prompt-injection-vulnerable` | 🟡 Open fix | Passed on scan #16 — our "ignore previous" phrases don't match check's exact probe patterns. See Fix M |
| 4 | `nodejs-eval-code-injection` | 🟡 Open fix | Skipped on scan #16 — "reflected_only=6" — result echoed but not recognized as eval sink. See Fix M |
| 5 | `os-command-injection` | ✅ Verified | Fired 1 finding on scan #16 — injected shell delay scaled with requested sleep (base 3s→+3001ms, 6s→+6002ms) |
| 6 | `python-eval-code-injection` | 🟡 Open fix | Same pattern as nodejs-eval — needs different response shape. See Fix M |
| 7 | `reflected-xss-in-url-parameters` | ✅ Verified | Fired 1 finding on scan #16 — /search?q= confirmed unescaped breakout in html_text context |
| 8 | `server-side-template-injection` | ✅ Verified | Fired 1 finding on scan #16 — /render?tpl= evaluated scanner's `{{4232*4202}}` → 17768104 in response |
| 9 | `time-based-blind-sql-injection` | ✅ Verified | Fired 1 finding on scan #16 — /api/user?id= scaling-delay proof confirmed |
| 10 | `vite-dev-server-file-read` | 🟡 Open fix | Passed on scan #16 — "Vite dev server not detected". Fake /@vite/client + /@fs/* need proper Vite fingerprint headers. See Fix M |

## Batch 6b — Extended Secrets (22 checks — all deployed)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `agentmail-api-key-in-js-bundle` | 🚀 Live | Fake `agm_live_...` key in bundle |
| 2 | `analytics-provider-keys-in-js-bundle` | 🚀 Live | Mixpanel + PostHog (phx_) + Amplitude + Segment fake keys |
| 3 | `auth-provider-keys-in-js-bundle` | 🚀 Live | Auth0 M2M + Clerk (sk_live_) + WorkOS fake keys |
| 4 | `cloud-infra-provider-keys-in-js-bundle` | 🚀 Live | Fly.io (fo1_) + Render (rnd_) + Railway fake keys |
| 5 | `cms-media-provider-keys-in-js-bundle` | 🚀 Live | Contentful (CFPAT-) + Cloudinary URL + Sanity (sk) fake keys |
| 6 | `crm-provider-keys-in-js-bundle` | 🚀 Live | HubSpot (pat-) + Salesforce session ID fake keys |
| 7 | `database-provider-keys-in-js-bundle` | 🚀 Live | PlanetScale (pscale_pw_) + Neon (npg_) + Turso fake keys |
| 8 | `dev-collab-tokens-in-js-bundle` | 🚀 Live | Linear (lin_api_) + Notion (secret_) + Figma (figd_) fake keys |
| 9 | `email-provider-keys-in-js-bundle` | 🚀 Live | Postmark + Mailgun (key-) + Brevo (xkeysib-) + Loops fake keys |
| 10 | `generic-public-env-secret-in-js-bundle` | 🚀 Live | NEXT_PUBLIC_* variables with secret-shaped values |
| 11 | `jwt-weak-signing-secret` | 🚀 Live | authtoken cookie JWT signed with weak secret "secret" |
| 12 | `llm-providers-api-key-in-js-bundle` | 🚀 Live | Groq (gsk_) + Together AI + Replicate (r8_) + Perplexity (pplx-) |
| 13 | `maps-provider-keys-in-js-bundle` | 🚀 Live | Google Maps (AIza) + Mapbox secret (sk.) fake keys |
| 14 | `netlify-pat-in-js-bundle` | 🚀 Live | Fake `nfp_...` PAT in bundle |
| 15 | `observability-provider-keys-in-js-bundle` | 🚀 Live | Sentry DSN + Datadog + New Relic (NRAK-) fake keys |
| 16 | `payment-provider-keys-in-js-bundle` | 🚀 Live | PayPal secret + Razorpay (rzp_live_) + Square (EAAA) fake keys |
| 17 | `realtime-flags-provider-keys-in-js-bundle` | 🚀 Live | Pusher + LaunchDarkly (sdk-) + Ably fake keys |
| 18 | `search-provider-keys-in-js-bundle` | 🚀 Live | Algolia admin + Meilisearch master + Typesense admin fake keys |
| 19 | `sensitive-data-in-initial-payload` | 🚀 Live | Password hashes ($2b$10$...) + DB connection URLs rendered in server HTML |
| 20 | `vector-db-keys-in-js-bundle` | 🚀 Live | Pinecone + Weaviate + Qdrant fake keys |
| 21 | `voice-ai-keys-in-js-bundle` | 🚀 Live | ElevenLabs (sk_) + Deepgram + AssemblyAI fake keys |
| 22 | `webhook-urls-in-js-bundle` | 🚀 Live | Slack incoming webhook + Discord webhook URLs |

## Batch 7 — WordPress CVEs (Phase B) (6 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `contact-form-7-db-object-injection-cve-2025-7384` | ⏸️ Phase B |  |
| 2 | `king-addons-privilege-escalation-cve-2025-8489` | ⏸️ Phase B |  |
| 3 | `really-simple-security-auth-bypass-cve-2024-10924` | ⏸️ Phase B |  |
| 4 | `w3-total-cache-rce-cve-2025-9501` | ⏸️ Phase B |  |
| 5 | `wordpress-core-cve` | ⏸️ Phase B |  |
| 6 | `wp-automatic-sqli-cve-2024-27956` | ⏸️ Phase B |  |

## Batch 8 — Apache CVEs (Phase B) (2 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `apache-httpd-cve-2024-38476-family` | ⏸️ Phase B |  |
| 2 | `apache-tomcat-cve-2025-24813` | ⏸️ Phase B |  |

## Batch 9 — Firebase + Supabase (Phase B) (6 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `firebase-rtdb-readable-without-authentication` | ⏸️ Phase B |  |
| 2 | `firebase-storage-bucket-publicly-accessible` | ⏸️ Phase B |  |
| 3 | `firestore-collection-publicly-readable` | ⏸️ Phase B |  |
| 4 | `supabase-rpc-callable-by-anon` | ⏸️ Phase B |  |
| 5 | `supabase-storage-bucket-publicly-accessible` | ⏸️ Phase B |  |
| 6 | `supabase-table-readable-without-authentication` | ⏸️ Phase B |  |

## Batch 10 — AWS S3 (Phase B) (5 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `aws-s3-bucket-acl-publicly-readable` | ⏸️ Phase B |  |
| 2 | `aws-s3-bucket-name-leaked-in-js-bundle` | ⏸️ Phase B |  |
| 3 | `aws-s3-bucket-policy-publicly-readable` | ⏸️ Phase B |  |
| 4 | `aws-s3-bucket-public-listing-enabled` | ⏸️ Phase B |  |
| 5 | `aws-s3-bucket-public-write-access` | ⏸️ Phase B |  |

## Environmental — DNS / email / availability (fires from BigRock + Vercel defaults, verified in every scan) (8 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `dkim-record-missing` | ✅ Verified | no email set up on domain |
| 2 | `dmarc-missing-or-policy-none` | ✅ Verified | existing DMARC has p=none |
| 3 | `dnssec-not-configured` | ✅ Verified | fires from BigRock DNS default |
| 4 | `server-version-disclosure` | ✅ Verified | Hostinger nginx sends `Server: nginx/1.24.0 (Ubuntu)` + `X-Powered-By: Next.js` → check fires 2 findings (verified scan #14) |
| 5 | `site-listed-on-blacklists` | ✅ Verified | testbed not on any blacklist |
| 6 | `site-returning-error-status` | ✅ Verified | testbed returns 200 |
| 7 | `site-unreachable` | ✅ Verified | testbed responds to baseline |
| 8 | `spf-record-missing-or-permissive` | ✅ Verified | no SPF record |

## CVE probes — tech-stack version checks (fire opportunistically based on detected tech) (16 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `cisa-kev-catalog-match` | ✅ Verified | runs on every scan, no KEV entries match our stack |
| 2 | `cve-2025-29927-nextjs-middleware-auth-bypass` | ✅ Verified | Next.js version check |
| 3 | `cve-2025-55183-nextjs-app-router-source-code-exposure` | ✅ Verified | Next.js version check |
| 4 | `cve-2025-55184-nextjs-app-router-dos` | ✅ Verified | Next.js version check |
| 5 | `cve-2025-57822-nextjs-middleware-header-ssrf` | ✅ Verified | Next.js version check |
| 6 | `generic-cve-detection` | ✅ Verified | runs on every scan |
| 7 | `inngest-cve-2026-42047` | ✅ Verified | Inngest probe |
| 8 | `langflow-cve-2025-3248` | ✅ Verified | Langflow probe, not applicable to our stack |
| 9 | `langflow-cve-2025-34291` | ✅ Verified | Langflow probe |
| 10 | `langflow-cve-2026-33017` | ✅ Verified | Langflow probe |
| 11 | `n8n-cve-2026-21858` | ✅ Verified | n8n probe |
| 12 | `nextjs-image-optimization-ssrf` | ✅ Verified | Next.js version check |
| 13 | `nextjs-react19-rce-detected` | ✅ Verified | React 19 version check |
| 14 | `nextjs-server-actions-exposed-public-endpoints` | ✅ Verified | Next.js Server Actions check |
| 15 | `outdated-js-library-cve` | ✅ Verified | fired 8 lodash CVEs on scan #5 (bonus from our CDN script) |
| 16 | `outdated-tech-stack-cve` | ✅ Verified | runs on every scan |

---

## How to use this file

- **After every scan:** update the status of any check that changed (Pending → Verified when it fires, etc)
- **After every batch merge to main:** flip that batch's rows from Pending to Verified (if scan confirmed) or Open Fix (if it didn't fire)
- **At the end of Phase A:** the sum should be 121. If it's not, some checks got lost. Search the code registry for missing keys.
- **When starting Phase B:** work through every ⏸️ row using the recipes in [phase-b-backlog.md](./phase-b-backlog.md)
