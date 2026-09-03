# Batch 6b — Extended Secrets (V6 bundle + AI + webhooks)

## Status at a glance — 2026-09-03 (after first scan #17)

**Batch complete? PARTIAL — 10 of 22 verified, 12 open fixes**

**✅ Verified (10 rows firing):**
1. `jwt-weak-signing-secret` — big win! Scanner cracked our JWT signed with "secret" using 103,781-entry wordlist
2. `analytics-provider-keys-in-js-bundle` — 3 findings (PostHog `phx_` personal key)
3. `cms-media-provider-keys-in-js-bundle` — 6 findings (Contentful CMA + Cloudinary URL)
4. `crm-provider-keys-in-js-bundle` — 3 findings (HubSpot PAT `pat-na1-`)
5. `database-provider-keys-in-js-bundle` — **9 findings** (Neon Postgres + MySQL + Mongo connection strings, plus our SSR-payload DB URLs bonus-detected here)
6. `llm-providers-api-key-in-js-bundle` — 6 findings (Groq `gsk_` + Perplexity `pplx-`)
7. `maps-provider-keys-in-js-bundle` — 3 findings (Mapbox secret `sk.` — even confirmed as live!)
8. `realtime-flags-provider-keys-in-js-bundle` — 3 findings (LaunchDarkly SDK `sdk-`)
9. `voice-ai-keys-in-js-bundle` — 2 findings (ElevenLabs `sk_`)
10. `webhook-urls-in-js-bundle` — 4 findings (Slack + Discord webhooks)

**🟡 Open fixes (12 rows) — all in [testbed-fixes-backlog.md](../testbed-fixes-backlog.md) under Fix N:**
- `agentmail` — `agm_live_...` format doesn't match
- `auth-provider` — Auth0 + WorkOS don't match; Clerk got detected as Stripe (false positive)
- `cloud-infra` — Fly/Render/Railway formats don't match
- `dev-collab` — Linear/Notion/Figma formats don't match
- `email-provider` — Postmark/Mailgun/Brevo/Loops formats don't match
- `generic-public-env` — needs actual `NEXT_PUBLIC_X="..."` var declarations, not strings
- `netlify-pat` — `nfp_...` doesn't match check regex
- `observability` — Sentry DSN + Datadog + New Relic formats don't match
- `payment-provider` — PayPal/Razorpay/Square formats don't match
- `search-provider` — Algolia/Meilisearch/Typesense formats don't match
- `sensitive-data-in-initial-payload` — our DB URLs got captured by database check; need SSR-payload-shaped hash
- `vector-db` — Pinecone/Weaviate/Qdrant formats don't match

**Bonus findings:**
- `stripe-secret-key-in-js-bundle` now fires 6 findings (up from 3) — our Clerk `sk_live_` key overlaps Stripe's regex (Clerk detected AS Stripe, not as Clerk)
- No js-exception-regression (correct behavior — no new console errors since prior scan)

---

**Category:** Extended secret detection (V6 bundle categories)
**BugBuzzer checks tested:** 22 (full Batch 6b)
**Branch:** merged direct to main (no branch)
**Date added to testbed:** 2026-09-02

---

## What this batch tests

Batch 1 covered the "core 7" secrets everyone leaks (OpenAI, Anthropic, Stripe, Supabase, AWS, GitHub, JWT). Batch 6b covers the next 22 categories — all the second-tier services that also commonly get leaked in client bundles:
- LLM providers beyond OpenAI/Anthropic (Groq, Together, Replicate, Perplexity)
- Vector DBs (Pinecone, Weaviate, Qdrant)
- Observability + analytics (Sentry, Datadog, Mixpanel, PostHog, Amplitude)
- Auth providers (Auth0, Clerk, WorkOS)
- CMS + media (Contentful, Cloudinary, Sanity)
- Payment providers (PayPal, Razorpay, Square)
- ... and more

Also 3 special-shape checks:
- `jwt-weak-signing-secret` — authtoken cookie JWT signed with weak secret "secret" (BugBuzzer's dictionary attack will crack it)
- `generic-public-env-secret-in-js-bundle` — `NEXT_PUBLIC_*` variables with secret-shaped values (a very common leak pattern)
- `sensitive-data-in-initial-payload` — password hashes + database connection URLs rendered in server HTML (SSR leak)

**All values FAKE** — verified by BugBuzzer's liveness probes (real providers reject them).

---

## Vulnerabilities baked in

- **[`lib/fake-secrets-batch-6b.ts`](../../lib/fake-secrets-batch-6b.ts)** — all 22 categories of fake keys
- **[`components/batch-6b-extended-secrets.tsx`](../../components/batch-6b-extended-secrets.tsx)** — renders all keys directly into JSX + inline `application/json` script (same trick as Batch 1)
- **[`middleware.ts`](../../middleware.ts)** — updated `authtoken` cookie to JWT signed with weak secret "secret" (for `jwt-weak-signing-secret`)

---

## Expected BugBuzzer scan results

Scan target: `https://testbed.blockchainhq.xyz`

| Check | Expected finding count | Notes |
|---|---|---|
| agentmail-api-key-in-js-bundle | 1+ | `agm_live_...` fake key |
| analytics-provider-keys-in-js-bundle | 3-4 | Mixpanel + PostHog + Amplitude + Segment |
| auth-provider-keys-in-js-bundle | 2-3 | Auth0 + Clerk + WorkOS |
| cloud-infra-provider-keys-in-js-bundle | 2-3 | Fly.io + Render + Railway |
| cms-media-provider-keys-in-js-bundle | 2-3 | Contentful + Cloudinary + Sanity |
| crm-provider-keys-in-js-bundle | 1-2 | HubSpot + Salesforce |
| database-provider-keys-in-js-bundle | 2-3 | PlanetScale + Neon + Turso |
| dev-collab-tokens-in-js-bundle | 2-3 | Linear + Notion + Figma |
| email-provider-keys-in-js-bundle | 2-4 | Postmark + Mailgun + Brevo + Loops |
| generic-public-env-secret-in-js-bundle | 1-2 | `NEXT_PUBLIC_STRIPE_SECRET` + `NEXT_PUBLIC_ADMIN_PASSWORD` |
| jwt-weak-signing-secret | 1 | `authtoken` cookie cracks with dictionary secret "secret" |
| llm-providers-api-key-in-js-bundle | 2-4 | Groq + Together + Replicate + Perplexity |
| maps-provider-keys-in-js-bundle | 1-2 | Google Maps + Mapbox |
| netlify-pat-in-js-bundle | 1 | `nfp_...` fake PAT |
| observability-provider-keys-in-js-bundle | 2-3 | Sentry + Datadog + New Relic |
| payment-provider-keys-in-js-bundle | 2-3 | PayPal + Razorpay + Square |
| realtime-flags-provider-keys-in-js-bundle | 2-3 | Pusher + LaunchDarkly + Ably |
| search-provider-keys-in-js-bundle | 2-3 | Algolia + Meilisearch + Typesense |
| sensitive-data-in-initial-payload | 1-4 | Password hash + postgres/mysql/mongo URLs in server HTML |
| vector-db-keys-in-js-bundle | 2-3 | Pinecone + Weaviate + Qdrant |
| voice-ai-keys-in-js-bundle | 2-3 | ElevenLabs + Deepgram + AssemblyAI |
| webhook-urls-in-js-bundle | 1-2 | Slack webhook + Discord webhook |

**Total expected new findings: 40-60 across 22 checks.**

---

## Suggested fix (for real users)

For each finding kind, the user-facing report tells the customer:

- **Any secret in JS bundle** → move to server-side env var (no `NEXT_PUBLIC_/VITE_` prefix), route calls through a server-side proxy
- **Weak JWT signing secret** → rotate to cryptographically-strong random secret (`openssl rand -base64 32`)
- **Sensitive data in initial payload** → never render password hashes / DB connection strings in server HTML — strip before serialization
- **Public env with secret-shaped value** → audit every `NEXT_PUBLIC_*` var, move any that look like secrets to server-only
- **Outgoing webhook URL exposed** → move webhooks to server-side, rotate the exposed webhook (attacker can spam your Slack)

---

## Actual scan results

_Fill in after first scan._

| Check | Expected | Actual | Status |
|---|---|---|---|
| agentmail-api-key-in-js-bundle | 1+ | | ⬜ |
| analytics-provider-keys-in-js-bundle | 3-4 | | ⬜ |
| auth-provider-keys-in-js-bundle | 2-3 | | ⬜ |
| cloud-infra-provider-keys-in-js-bundle | 2-3 | | ⬜ |
| cms-media-provider-keys-in-js-bundle | 2-3 | | ⬜ |
| crm-provider-keys-in-js-bundle | 1-2 | | ⬜ |
| database-provider-keys-in-js-bundle | 2-3 | | ⬜ |
| dev-collab-tokens-in-js-bundle | 2-3 | | ⬜ |
| email-provider-keys-in-js-bundle | 2-4 | | ⬜ |
| generic-public-env-secret-in-js-bundle | 1-2 | | ⬜ |
| jwt-weak-signing-secret | 1 | | ⬜ |
| llm-providers-api-key-in-js-bundle | 2-4 | | ⬜ |
| maps-provider-keys-in-js-bundle | 1-2 | | ⬜ |
| netlify-pat-in-js-bundle | 1 | | ⬜ |
| observability-provider-keys-in-js-bundle | 2-3 | | ⬜ |
| payment-provider-keys-in-js-bundle | 2-3 | | ⬜ |
| realtime-flags-provider-keys-in-js-bundle | 2-3 | | ⬜ |
| search-provider-keys-in-js-bundle | 2-3 | | ⬜ |
| sensitive-data-in-initial-payload | 1-4 | | ⬜ |
| vector-db-keys-in-js-bundle | 2-3 | | ⬜ |
| voice-ai-keys-in-js-bundle | 2-3 | | ⬜ |
| webhook-urls-in-js-bundle | 1-2 | | ⬜ |

---

## Regression watch

If any of these findings stops appearing on a future scan, investigate:

- Was `Batch6bExtendedSecrets` accidentally removed from `app/page.tsx`?
- Was `lib/fake-secrets-batch-6b.ts` deleted or the keys changed?
- Did `.dockerignore` start excluding `lib/*` or `components/*`?
- Did `authtoken` cookie in middleware get changed away from the weak-signed JWT?
- Did Next.js update change how string literals get tree-shaken?
