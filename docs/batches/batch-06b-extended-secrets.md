# Batch 6b — Extended Secrets (V6 Bundle + AI + Webhooks + Provider Keys)

**Category:** Secrets & Keys in JS Bundle (extended provider coverage)
**Master sheet rows:** 265, 290, 296, 297, 298, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314
**BugBuzzer checks tested:** 20
**Date added to testbed:** _pending_
**Status:** ⬜ Pending

---

## What this batch tests

Same as Batch 1 (secrets in JS bundle) but for the 20 provider-specific checks — Vector DB keys, Auth providers, Cloud/Hosting tokens, CMS credentials, CRM tokens, DB connection strings, Dev/collab tokens, Email/SMS, Maps, Observability, Payments, Realtime, Search.

---

## Vulnerabilities to bake in

Extend `lib/fake-secrets.ts` with one fake key per provider. Follow real prefix formats.

| # | Row | Check Name | Fake prefix example |
|---|---|---|---|
| 1 | 265 | Additional secret types in bundle | `NEXT_PUBLIC_MY_CUSTOM_SECRET=<high-entropy>` |
| 2 | 290 | AgentMail API key | `am-xxx` (verify format from AgentMail docs) |
| 3 | 296 | xAI / Mistral / Groq / Together / Perplexity / Cohere LLM keys | `xai-xxx`, `gsk_xxx`, `pplx-xxx`, etc. |
| 4 | 297 | Vector DB API key (Pinecone / Weaviate / Qdrant / Chroma / Turbopuffer) | Pinecone starts with UUID |
| 5 | 298 | Voice AI provider key (Vapi / Retell / Bland / ElevenLabs) | ElevenLabs: `sk_` prefix |
| 6 | 300 | Netlify PAT | `nfp_xxx` |
| 7 | 301 | Webhook URL in JS bundle | `hooks.slack.com/services/T.../B.../xxx` |
| 8 | 302 | Product Analytics Secret (PostHog / Segment server) | `phc_` for PostHog, `wsec_` for Segment |
| 9 | 303 | Auth Provider Secret (Clerk / Auth0 / Okta / WorkOS / Stytch) | `sk_test_` or `sk_live_` |
| 10 | 304 | Cloud / Hosting Provider Token (DO / Vercel / Heroku / Fastly / CF) | Vercel: `xxx`, CF: `Bearer xxx` |
| 11 | 305 | CMS / Media Provider Credential (Contentful / Sanity / Cloudinary etc.) | Contentful management: `CFPAT-xxx` |
| 12 | 306 | CRM / Forms Provider Token (HubSpot / Typeform / Intercom etc.) | HubSpot: `pat-` |
| 13 | 307 | Serverless Database Credential (PlanetScale / MongoDB / Postgres etc.) | `mongodb+srv://user:pass@host/db` |
| 14 | 308 | Developer / Collaboration Token (npm / Docker / Notion / Linear / Figma / Slack / Airtable) | npm: `npm_xxx`, Notion: `secret_xxx` |
| 15 | 309 | Email / SMS Provider (Mailgun / Brevo / MailerSend / Mailchimp / Twilio) | Twilio: `AC` prefix + auth token |
| 16 | 310 | Maps Provider Secret (Mapbox / Radar) | Mapbox secret: `sk.` prefix |
| 17 | 311 | Observability Provider Token (Sentry / Grafana / New Relic / Datadog / Rollbar) | Sentry auth: `sntrys_xxx` |
| 18 | 312 | Payment Provider Secret (PayPal / Braintree / GoCardless / Square / Paddle / Razorpay etc.) | Provider-specific |
| 19 | 313 | Realtime / Feature-Flag Secret (PubNub / Pusher / Agora / LaunchDarkly etc.) | LaunchDarkly: `sdk-` for server SDK |
| 20 | 314 | Search Provider Admin Key (Algolia / Meilisearch / Typesense) | Algolia admin: 32-char hex |

---

## Expected BugBuzzer scan results

_Fill in after implementation._

---

## Suggested fix (for real users)

Same fix as Batch 1 — move all backend secrets out of client-side code, use server-side environment variables + backend API routes.

---

## Actual scan results

| Check # | Expected | Actual | Status |
|---|---|---|---|
| 1-20 | Detected | | ⬜ |

---

## Regression watch

_Fill in after first successful scan._
