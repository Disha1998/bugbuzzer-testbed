# Master checklist — all 121 BugBuzzer checks

**What this file is:** one place to see every check we're testing. Update it whenever a batch is deployed, scanned, or finished. If the total below is ever less than 121, something got lost. This file is our safety net.

_Last updated: 2026-09-05 (after Batch 9 scan #20)_

> 🎉 **Testbed is now on Hostinger** (moved 2026-09-02). It runs at IP `76.13.179.65` as a Docker container behind nginx. No more Vercel bot problems. Scan #14 found 36 real problems, up from about 10 on Vercel. See [hostinger-deployment.md](./hostinger-deployment.md).
>
> ✅ **Batch 3 is now 4 out of 5 working.** Scan #14 caught our fake error, hydration bug, failed API call, and repeat-error check. Only the "blank page" check is still open — the /broken page needs to return HTTP 500 or drop the layout wrap.
>
> 🟡 **Batch 4 is now 5 out of 8 working.** .env / backup files / .git / .svn / **docker-compose (new!)** all fire. 3 still open: source maps (Turbopack blocker), config files (needs different response shape), directory listing (Next.js layout wraps it).
>
> 🎁 **Bonus wins from Hostinger scan #14** — CVE checks are firing: 2 CISA KEV hits (a Next.js RCE and a Nginx HTTP/2 attack), 8 old Lodash bugs, 12 general tech-stack CVEs. Server version disclosure fires 2 findings.
>
> ✅ **Batch 9 (Firebase + Supabase)** — 2 Firebase checks fire as CRITICAL. 3 Supabase checks look failed but actually the scanner has a bug (Fix P). 1 Firebase check paused (needs credit card).

## Summary

| Status | Count | What it means |
|---|---|---|
| ✅ Working | 68 | Check fires correctly on our testbed. Scan proved it. |
| 🟡 Open fix | 32 | We built the vulnerability but scanner doesn't catch it yet. Small tweaks needed (see Fixes B, C, F blocker 2, G row 3, I, K blocker 2, L, M, N in backlog). |
| 🟡 Scanner bug | 3 | Vulnerability is really there, we tested by hand. But scanner has a bug that makes it miss them. Waiting on BugBuzzer team (Fix P). |
| ⏸️ Paused | 18 | Deferred to Phase B or later — needs extra setup (VPS, WordPress install, real cloud account, credit card, etc.). |
| **Total** | **121** | Should always add up to 121. |

**Progress:** 68 out of 121 working (56%). Batch 6b's first scan added 10 wins (including cracking our weak-signed JWT cookie!). Batch 9 added 2 more. **All Phase A code is deployed.** What's left: work through Fixes B/C/F/G/I/K/L/M/N in one focused session, wait for Nirav on Fix P, then do the remaining Phase B setup.

## Batch 1 — Secrets in JS Bundle (7 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `aws-gcp-azure-credentials-in-js-bundle` | ✅ Working |  |
| 2 | `github-gitlab-token-in-js-bundle` | ✅ Working |  |
| 3 | `hardcoded-jwt-secret-in-js-bundle` | ✅ Working |  |
| 4 | `openai-anthropic-api-key-in-js-bundle` | ✅ Working |  |
| 5 | `resend-sendgrid-api-key-in-js-bundle` | ✅ Working |  |
| 6 | `stripe-secret-key-in-js-bundle` | ✅ Working |  |
| 7 | `supabase-service-role-key-in-js-bundle` | ✅ Working |  |

## Batch 2 — Web Hygiene (12 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `cors-misconfiguration-overly-permissive` | 🟡 Open fix | Need to add a link to /api/wide-cors on the homepage so the scanner finds it. See Fix C. |
| 2 | `domain-registration-expiring-soon` | ⏸️ Paused |  |
| 3 | `mixed-content-on-https-page` | 🟡 Open fix | Chrome auto-upgrades our test http:// image. Fix: switch to a `<script>` tag instead. See Fix B. |
| 4 | `security-headers-missing` | ✅ Working |  |
| 5 | `security-txt-missing-or-expired` | ✅ Working |  |
| 6 | `session-cookie-missing-http-only` | ✅ Working |  |
| 7 | `session-cookie-missing-samesite` | ✅ Working |  |
| 8 | `session-cookie-missing-secure` | ✅ Working |  |
| 9 | `session-token-insufficient-expiration` | ✅ Working | bonus row added during Batch 2 |
| 10 | `sri-missing` | ✅ Working |  |
| 11 | `ssl-certificate-issues` | ⏸️ Paused |  |
| 12 | `subdomain-takeover` | ⏸️ Paused |  |

## Batch 3 — JavaScript Runtime Errors (5 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `critical-page-blank-or-error` | 🟡 Open fix | Vercel bot problem is fixed (thanks to Hostinger). But /broken page still has 15KB of layout HTML, so scanner doesn't think it's broken. Fix K blocker 2: return HTTP 500 or drop the layout. |
| 2 | `failed-network-requests` | ✅ Working | Fires because our page loads a URL that doesn't exist (/api/does-not-exist-batch-3) |
| 3 | `hydration-errors-detected` | ✅ Working | Fires as React error #418 (our `Date.now()` trick works) |
| 4 | `js-exception-regression` | ✅ Working | Fired once when the error was new. Correctly stays silent on later scans (error is no longer new). Working as designed. |
| 5 | `js-exceptions-detected` | ✅ Working | Fires with our exact error text: `throw new Error("Intentional test error - Batch 3")` |

## Batch 4 — Public File Exposure (8 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `backup-files-exposed` | ✅ Working | Fires 3 findings (backup.sql, db.sql, dump.sql) |
| 2 | `directory-listing-exposed` | 🟡 Open fix | Our /downloads page renders inside Next.js layout (has duplicate `<html>` tags). See Fix I. |
| 3 | `env-file-exposed` | ✅ Working | Fires 4 findings (.env + .env.local + .env.production + .env.development) |
| 4 | `exposed-config-files` | 🟡 Open fix | Middleware serves JSON with fake secrets but scanner doesn't recognize the pattern. Needs specific content signature. See Fix G. |
| 5 | `exposed-docker-compose` | ✅ Working | Fires 3 findings (docker-compose.yml + .yaml + compose.yml). Started working after Hostinger move — nginx sends better Content-Type than Vercel did. |
| 6 | `exposed-source-maps` | 🟡 Open fix | Vercel setting is fixed. But Turbopack doesn't make source map files in production. Fix F blocker 2: add `productionBrowserSourceMaps: true` to `next.config.ts`. |
| 7 | `git-repo-exposed` | ✅ Working | Fires 2 findings (.git/HEAD + .git/config) |
| 8 | `svn-repo-exposed` | ✅ Working | Fires 3 findings (.svn/entries + .svn/wc.db + .svn/format) |

## Batch 5 — Auth & Admin Panels (14 checks — 13 deployed, 1 paused)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `admin-or-debug-panel-exposed` | ✅ Working | Fires 3 findings (/admin, /wp-admin, /debug). Bonus: our /debug page also gets picked up by this check. |
| 2 | `dangerous-http-methods` | ✅ Working | Fires 3 findings (TRACE + PUT + DELETE all flagged from our OPTIONS response) |
| 3 | `debug-mode-enabled` | 🟡 Open fix | Our /debug + /__debug__ pages got claimed by the admin-panel check instead. Needs specific Werkzeug or Django markers. See Fix L. |
| 4 | `default-credentials-on-services` | 🟡 Open fix | Scanner found 7 panels but 2 couldn't be tested. Our login URL setup may not match what the scanner expects. See Fix L. |
| 5 | `exposed-ai-infra` | 🟡 Open fix | Our /langfuse + /mlflow pages don't match the check's pattern. Needs real Langfuse or MLflow dashboard structure. See Fix L. |
| 6 | `exposed-datastore` | ⏸️ Paused | Needs exposed database dashboards on subdomains (elasticsearch/mongodb/adminer). |
| 7 | `exposed-dev-tools` | 🟡 Open fix | Our Storybook page needs specific asset markers (`iframe.html`, `runtime~main.iframe.bundle.js`). See Fix L. |
| 8 | `graphql-introspection-enabled` | 🟡 Open fix | Scanner says "no GraphQL endpoint detected." Our response shape doesn't match what the check expects. See Fix L. |
| 9 | `host-header-reflection` | 🟡 Open fix | Scanner never visits our /redirect-home URL. Needs a URL pattern the scanner actually probes. See Fix L. |
| 10 | `missing-rate-limiting-on-login` | ✅ Working | Fires because scanner sent 30 login POSTs and got no rate limit, no 429, no CAPTCHA |
| 11 | `oauth-state-parameter-missing` | 🟡 Open fix | Scanner doesn't see our OAuth link because it's in a client component. Needs to be in the server-rendered HTML. See Fix L. |
| 12 | `open-redirect-vulnerability` | ✅ Working | Fires because /redirect?url=https://evil.example.com sends HTTP 302 to evil.example.com |
| 13 | `unauthenticated-ai-proxy-endpoint` | 🟡 Open fix | Scanner found our /api/ai/chat but didn't mark it as AI-specific. Needs response that looks like real OpenAI output. See Fix L. |
| 14 | `unauthenticated-api-endpoint` | ✅ Working | Fires 3 findings (/api/users, /api/graphql, /api/ai/chat — all return JSON without asking for a password) |

## Batch 6 — Injection Probes (10 checks — all deployed)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `ai-endpoint-model-parameter-override` | 🟡 Open fix | Almost there — our response echoes the fake model name. Just needs an error marker like `{"error":{"type":"invalid_request_error"}}`. See Fix M. |
| 2 | `error-based-sql-injection` | 🟡 Open fix | Our JSON error format doesn't match. Fix: return SQL error as plain text. See Fix M. |
| 3 | `llm-direct-prompt-injection-vulnerable` | 🟡 Open fix | Our detected phrases don't match what the scanner tries. See Fix M. |
| 4 | `nodejs-eval-code-injection` | 🟡 Open fix | Our result is echoed but not recognized as an eval sink. Needs different response shape. See Fix M. |
| 5 | `os-command-injection` | ✅ Working | Fires because our /api/shell?cmd= endpoint sleeps for the requested duration (proof of command injection) |
| 6 | `python-eval-code-injection` | 🟡 Open fix | Same problem as nodejs-eval — needs different response shape. See Fix M. |
| 7 | `reflected-xss-in-url-parameters` | ✅ Working | Fires because /search?q= reflects input without escaping (HTML injection possible) |
| 8 | `server-side-template-injection` | ✅ Working | Fires because /render?tpl= evaluates scanner's math expression (proof of template injection) |
| 9 | `time-based-blind-sql-injection` | ✅ Working | Fires because /api/user?id= delay scales with the requested sleep duration |
| 10 | `vite-dev-server-file-read` | 🟡 Open fix | Scanner says "Vite dev server not detected." Our fake /@vite/client needs proper Vite headers. See Fix M. |

## Batch 6b — Extended Secrets (22 checks — all deployed)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `agentmail-api-key-in-js-bundle` | 🟡 Open fix | Our `agm_live_...` format doesn't match AgentMail's real key regex. See Fix N. |
| 2 | `analytics-provider-keys-in-js-bundle` | ✅ Working | Fires 3 findings (PostHog `phx_` personal key). Mixpanel/Amplitude/Segment formats didn't match. |
| 3 | `auth-provider-keys-in-js-bundle` | 🟡 Open fix | Auth0 + WorkOS formats don't match. Our Clerk `sk_live_` key got detected as Stripe by mistake (small false positive we accept). See Fix N. |
| 4 | `cloud-infra-provider-keys-in-js-bundle` | 🟡 Open fix | Fly.io + Render + Railway formats don't match. See Fix N. |
| 5 | `cms-media-provider-keys-in-js-bundle` | ✅ Working | Fires 6 findings (Contentful CMA + Cloudinary URL). Sanity token didn't match. |
| 6 | `crm-provider-keys-in-js-bundle` | ✅ Working | Fires 3 findings (HubSpot `pat-na1-`). Salesforce didn't match. |
| 7 | `database-provider-keys-in-js-bundle` | ✅ Working | Fires 9 findings (Neon Postgres + MySQL + Mongo connection strings). Also picked up our SSR payload DB URLs as bonus. |
| 8 | `dev-collab-tokens-in-js-bundle` | 🟡 Open fix | Linear + Notion + Figma formats don't match. See Fix N. |
| 9 | `email-provider-keys-in-js-bundle` | 🟡 Open fix | Postmark + Mailgun + Brevo + Loops formats don't match. See Fix N. |
| 10 | `generic-public-env-secret-in-js-bundle` | 🟡 Open fix | Check wants real `NEXT_PUBLIC_X="..."` variable declarations, not strings in JSON. See Fix N. |
| 11 | `jwt-weak-signing-secret` | ✅ Working | Fires — scanner cracked our JWT signed with the weak secret "secret" using a 103,781-entry wordlist. Big win! |
| 12 | `llm-providers-api-key-in-js-bundle` | ✅ Working | Fires 6 findings (Groq `gsk_` + Perplexity `pplx-`). Together AI + Replicate didn't match. |
| 13 | `maps-provider-keys-in-js-bundle` | ✅ Working | Fires 3 findings (Mapbox secret `sk.` — even authenticates as live!). Google Maps didn't match. |
| 14 | `netlify-pat-in-js-bundle` | 🟡 Open fix | Our `nfp_...` format doesn't match. See Fix N. |
| 15 | `observability-provider-keys-in-js-bundle` | 🟡 Open fix | Sentry DSN + Datadog + New Relic formats don't match. See Fix N. |
| 16 | `payment-provider-keys-in-js-bundle` | 🟡 Open fix | PayPal + Razorpay + Square formats don't match. See Fix N. |
| 17 | `realtime-flags-provider-keys-in-js-bundle` | ✅ Working | Fires 3 findings (LaunchDarkly SDK `sdk-` key). Pusher + Ably didn't match. |
| 18 | `search-provider-keys-in-js-bundle` | 🟡 Open fix | Algolia + Meilisearch + Typesense formats don't match. See Fix N. |
| 19 | `sensitive-data-in-initial-payload` | 🟡 Open fix | Our DB URLs got picked up by the database check instead. Password hash format didn't match. See Fix N. |
| 20 | `vector-db-keys-in-js-bundle` | 🟡 Open fix | Pinecone + Weaviate + Qdrant formats don't match. See Fix N. |
| 21 | `voice-ai-keys-in-js-bundle` | ✅ Working | Fires 2 findings (ElevenLabs `sk_`). Deepgram + AssemblyAI didn't match. |
| 22 | `webhook-urls-in-js-bundle` | ✅ Working | Fires 4 findings (Slack + Discord webhook URLs both caught) |

## Batch 7 — WordPress CVEs (Phase B) (6 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `contact-form-7-db-object-injection-cve-2025-7384` | ⏸️ Paused | Needs a real WordPress install |
| 2 | `king-addons-privilege-escalation-cve-2025-8489` | ⏸️ Paused | Needs a real WordPress install |
| 3 | `really-simple-security-auth-bypass-cve-2024-10924` | ⏸️ Paused | Needs a real WordPress install |
| 4 | `w3-total-cache-rce-cve-2025-9501` | ⏸️ Paused | Needs a real WordPress install |
| 5 | `wordpress-core-cve` | ⏸️ Paused | Needs a real WordPress install |
| 6 | `wp-automatic-sqli-cve-2024-27956` | ⏸️ Paused | Needs a real WordPress install |

## Batch 8 — Apache CVEs (Phase B) (2 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `apache-httpd-cve-2024-38476-family` | ⏸️ Paused | Needs Apache instead of nginx |
| 2 | `apache-tomcat-cve-2025-24813` | ⏸️ Paused | Needs Apache Tomcat |

## Batch 9 — Firebase + Supabase (6 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `firebase-rtdb-readable-without-authentication` | ✅ Working (CRITICAL) | Scanner asked the database for data with no password. Database gave back `{"users":true}`. Exactly what we wanted. |
| 2 | `firebase-storage-bucket-publicly-accessible` | ⏸️ Paused | Firebase asks for a credit card to make any storage bucket. Not worth adding a card for one check. |
| 3 | `firestore-collection-publicly-readable` | ✅ Working (CRITICAL) | Scanner asked Firestore for data with no password. Firestore let it read every collection. Exactly what we wanted. |
| 4 | `supabase-rpc-callable-by-anon` | 🟡 Scanner bug (Fix P) | We tested by hand — anyone can call `get_public_data` with no password. Scanner didn't try, it just gave up. Waiting on BugBuzzer team. |
| 5 | `supabase-storage-bucket-publicly-accessible` | 🟡 Scanner bug (Fix P) | Same problem as row 4 — scanner gave up too early. |
| 6 | `supabase-table-readable-without-authentication` | 🟡 Scanner bug (Fix P) | We tested by hand — anyone can read the `users_public` table with no password. Scanner said "probably safe" without really trying. Waiting on BugBuzzer team. |

## Batch 10 — AWS S3 (Phase B) (5 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `aws-s3-bucket-acl-publicly-readable` | ⏸️ Paused | Needs a real AWS account + throwaway S3 buckets |
| 2 | `aws-s3-bucket-name-leaked-in-js-bundle` | ⏸️ Paused | Needs a real AWS account |
| 3 | `aws-s3-bucket-policy-publicly-readable` | ⏸️ Paused | Needs a real AWS account |
| 4 | `aws-s3-bucket-public-listing-enabled` | ⏸️ Paused | Needs a real AWS account |
| 5 | `aws-s3-bucket-public-write-access` | ⏸️ Paused | Needs a real AWS account |

## Environmental — DNS / email / availability (fires from BigRock + Vercel defaults, verified in every scan) (8 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `dkim-record-missing` | ✅ Working | We don't have email set up on the domain |
| 2 | `dmarc-missing-or-policy-none` | ✅ Working | Existing DMARC record has `p=none` (no enforcement) |
| 3 | `dnssec-not-configured` | ✅ Working | Fires because BigRock's DNS default doesn't turn on DNSSEC |
| 4 | `server-version-disclosure` | ✅ Working | Hostinger nginx sends `Server: nginx/1.24.0 (Ubuntu)` + `X-Powered-By: Next.js` — check fires 2 findings |
| 5 | `site-listed-on-blacklists` | ✅ Working | Testbed is not on any blacklist (correct, it's a fresh domain) |
| 6 | `site-returning-error-status` | ✅ Working | Testbed returns HTTP 200 (correct) |
| 7 | `site-unreachable` | ✅ Working | Testbed responds to the baseline request (correct) |
| 8 | `spf-record-missing-or-permissive` | ✅ Working | No SPF record on the domain |

## CVE probes — tech-stack version checks (fire based on detected tech) (16 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `cisa-kev-catalog-match` | ✅ Working | Fires 2 findings on our stack (Next.js RCE + Nginx HTTP/2) |
| 2 | `cve-2025-29927-nextjs-middleware-auth-bypass` | ✅ Working | Next.js version check fires |
| 3 | `cve-2025-55183-nextjs-app-router-source-code-exposure` | ✅ Working | Next.js version check fires |
| 4 | `cve-2025-55184-nextjs-app-router-dos` | ✅ Working | Next.js version check fires |
| 5 | `cve-2025-57822-nextjs-middleware-header-ssrf` | ✅ Working | Next.js version check fires |
| 6 | `generic-cve-detection` | ✅ Working | Runs on every scan |
| 7 | `inngest-cve-2026-42047` | ✅ Working | Inngest probe (not applicable to us, correct) |
| 8 | `langflow-cve-2025-3248` | ✅ Working | Langflow probe (not applicable to us, correct) |
| 9 | `langflow-cve-2025-34291` | ✅ Working | Langflow probe (not applicable to us, correct) |
| 10 | `langflow-cve-2026-33017` | ✅ Working | Langflow probe (not applicable to us, correct) |
| 11 | `n8n-cve-2026-21858` | ✅ Working | n8n probe (not applicable to us, correct) |
| 12 | `nextjs-image-optimization-ssrf` | ✅ Working | Next.js version check |
| 13 | `nextjs-react19-rce-detected` | ✅ Working | React 19 version check fires as CRITICAL (KEV listed) |
| 14 | `nextjs-server-actions-exposed-public-endpoints` | ✅ Working | Next.js Server Actions check |
| 15 | `outdated-js-library-cve` | ✅ Working | Fires 8 Lodash CVEs (bonus from our CDN script) |
| 16 | `outdated-tech-stack-cve` | ✅ Working | Runs on every scan, fires 12 findings |

---

## How to use this file

- **After every scan:** update the status of any check that changed (Pending → Working when it fires, etc.)
- **After every batch merge to main:** flip that batch's rows to ✅ Working (if scan confirmed) or 🟡 Open fix (if it didn't fire)
- **At the end of Phase A:** the total should be 121. If it's not, some checks got lost. Search the code registry for missing IDs.
- **When starting Phase B:** work through every ⏸️ row using the steps in [phase-b-backlog.md](./phase-b-backlog.md)
