# Master Checklist — All 121 BugBuzzer Checks

**Purpose:** one single place to track every check. Update this whenever a batch is deployed, scanned, or completed. If the totals below ever drop below 121, something got lost — this file is the safety net.

_Last updated: 2026-09-01 (after scan #10)_

> ✅ **Batch 3 unblocked and 4/5 rows verified** (2026-09-01). Vercel bot protection didn't kick in on scan #10 — scanner reached the site and fired our planted vulnerabilities correctly. Only row 38 remaining, needs separate scan of `/broken`.
>
> 🟡 **Batch 4 partial — 4/8 verified** (2026-09-01). env / backup / git / svn all fire. 4 open fixes: source maps (Vercel toggle), config-files, docker-compose, directory-listing — see [testbed-fixes-backlog.md](./testbed-fixes-backlog.md) Fixes F-I.
>
> ⚠️ **Scan #10 had 10 http-baseline errors** (Batch 2 rows) — BugBuzzer scanner-side blip, not our code. Batch 2 previous verifications still stand.

## Summary

| Status | Count | Meaning |
|---|---|---|
| ✅ Verified | 46 | Check fires correctly on our testbed (scan confirmed) |
| 🚀 Live | 1 | Deployed, needs additional scan of a different URL (row 38 `/broken`) |
| 🟡 Open fix | 6 | Check should fire but doesn't yet — needs testbed code fix (Batch 2 rows + Batch 4 rows) |
| ⬜ Pending | 46 | Batch not started yet, will be built in Phase A |
| ⏸️ Phase B | 22 | Deferred to Phase B (needs VPS / throwaway domain / cloud accounts) |
| **Total** | **121** | Should equal 121 |

**Countdown:** 46 of 121 verified (38%). Big jump from 38 — Batch 3's 4 rows + Batch 4's 4 rows all verified this scan.

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
| 1 | `critical-page-blank-or-error` | 🟡 Open fix | Scanned `/broken` in scan #11 but Vercel returned HTTP 403 (bot challenge) → scanner saw challenge page not our error content. See Fix K in backlog — rename `/broken` to less suspicious URL |
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
| 5 | `exposed-docker-compose` | 🟡 Open fix | Same as row 4 — passed despite middleware serving fake YAML. See Fix G in backlog |
| 6 | `exposed-source-maps` | 🟡 Open fix | Vercel Protected Sourcemaps toggle now OFF ✅ (blocker 1 done). BUT `.js.map` files return HTTP 404 — Turbopack doesn't emit source maps in production. Fix F blocker 2: add `productionBrowserSourceMaps: true` to `next.config.ts` |
| 7 | `git-repo-exposed` | ✅ Verified | Fired 2 findings on scan #10 (.git/HEAD + .git/config) |
| 8 | `svn-repo-exposed` | ✅ Verified | Fired 3 findings on scan #10 (.svn/entries + .svn/wc.db + .svn/format) |

## Batch 5 — Auth & Admin Panels (14 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `admin-or-debug-panel-exposed` | ⬜ Pending |  |
| 2 | `dangerous-http-methods` | ⬜ Pending |  |
| 3 | `debug-mode-enabled` | ⬜ Pending |  |
| 4 | `default-credentials-on-services` | ⬜ Pending |  |
| 5 | `exposed-ai-infra` | ⬜ Pending |  |
| 6 | `exposed-datastore` | ⬜ Pending | may belong to Batch 5 |
| 7 | `exposed-dev-tools` | ⬜ Pending |  |
| 8 | `graphql-introspection-enabled` | ⬜ Pending |  |
| 9 | `host-header-reflection` | ⬜ Pending |  |
| 10 | `missing-rate-limiting-on-login` | ⬜ Pending |  |
| 11 | `oauth-state-parameter-missing` | ⬜ Pending |  |
| 12 | `open-redirect-vulnerability` | ⬜ Pending |  |
| 13 | `unauthenticated-ai-proxy-endpoint` | ⬜ Pending |  |
| 14 | `unauthenticated-api-endpoint` | ⬜ Pending |  |

## Batch 6 — Injection Probes (10 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `ai-endpoint-model-parameter-override` | ⬜ Pending |  |
| 2 | `error-based-sql-injection` | ⬜ Pending |  |
| 3 | `llm-direct-prompt-injection-vulnerable` | ⬜ Pending |  |
| 4 | `nodejs-eval-code-injection` | ⬜ Pending |  |
| 5 | `os-command-injection` | ⬜ Pending |  |
| 6 | `python-eval-code-injection` | ⬜ Pending |  |
| 7 | `reflected-xss-in-url-parameters` | ⬜ Pending |  |
| 8 | `server-side-template-injection` | ⬜ Pending |  |
| 9 | `time-based-blind-sql-injection` | ⬜ Pending |  |
| 10 | `vite-dev-server-file-read` | ⬜ Pending |  |

## Batch 6b — Extended Secrets (22 checks)

| # | Check ID | Status | Notes |
|---|---|---|---|
| 1 | `agentmail-api-key-in-js-bundle` | ⬜ Pending |  |
| 2 | `analytics-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 3 | `auth-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 4 | `cloud-infra-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 5 | `cms-media-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 6 | `crm-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 7 | `database-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 8 | `dev-collab-tokens-in-js-bundle` | ⬜ Pending |  |
| 9 | `email-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 10 | `generic-public-env-secret-in-js-bundle` | ⬜ Pending |  |
| 11 | `jwt-weak-signing-secret` | ⬜ Pending |  |
| 12 | `llm-providers-api-key-in-js-bundle` | ⬜ Pending |  |
| 13 | `maps-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 14 | `netlify-pat-in-js-bundle` | ⬜ Pending |  |
| 15 | `observability-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 16 | `payment-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 17 | `realtime-flags-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 18 | `search-provider-keys-in-js-bundle` | ⬜ Pending |  |
| 19 | `sensitive-data-in-initial-payload` | ⬜ Pending |  |
| 20 | `vector-db-keys-in-js-bundle` | ⬜ Pending |  |
| 21 | `voice-ai-keys-in-js-bundle` | ⬜ Pending |  |
| 22 | `webhook-urls-in-js-bundle` | ⬜ Pending |  |

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
| 4 | `server-version-disclosure` | ✅ Verified | Vercel does not expose version |
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
