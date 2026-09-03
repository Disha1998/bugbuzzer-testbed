"use client";

import { FAKE_BATCH_6B, FAKE_INITIAL_PAYLOAD_SECRETS } from "@/lib/fake-secrets-batch-6b";

// Batch 6b - 22 extended-secrets checks. Renders fake keys directly into JSX
// so Turbopack cannot tree-shake them, guaranteeing they land in the bundle.
// Same pattern as Batch 1.
const BATCH_6B_KEYS: { check: string; label: string; value: string }[] = [
  { check: "agentmail", label: "AgentMail (agm_)", value: FAKE_BATCH_6B.agentmail },
  { check: "analytics", label: "Mixpanel secret", value: FAKE_BATCH_6B.mixpanel_secret },
  { check: "analytics", label: "PostHog personal (phx_)", value: FAKE_BATCH_6B.posthog_personal },
  { check: "analytics", label: "Amplitude secret", value: FAKE_BATCH_6B.amplitude_secret },
  { check: "analytics", label: "Segment write key", value: FAKE_BATCH_6B.segment_write },
  { check: "auth", label: "Auth0 M2M client secret", value: FAKE_BATCH_6B.auth0_client_secret },
  { check: "auth", label: "Clerk live (sk_live_)", value: FAKE_BATCH_6B.clerk_live },
  { check: "auth", label: "WorkOS live", value: FAKE_BATCH_6B.workos_live },
  { check: "cloud-infra", label: "Fly.io deploy token (fo1_)", value: FAKE_BATCH_6B.fly_token },
  { check: "cloud-infra", label: "Render API key (rnd_)", value: FAKE_BATCH_6B.render_key },
  { check: "cloud-infra", label: "Railway token (rlwy_)", value: FAKE_BATCH_6B.railway_token },
  { check: "cms-media", label: "Contentful CMA (CFPAT-)", value: FAKE_BATCH_6B.contentful_cma },
  { check: "cms-media", label: "Cloudinary URL", value: FAKE_BATCH_6B.cloudinary_url },
  { check: "cms-media", label: "Sanity token (sk)", value: FAKE_BATCH_6B.sanity_token },
  { check: "crm", label: "HubSpot PAT (pat-)", value: FAKE_BATCH_6B.hubspot_pat },
  { check: "crm", label: "Salesforce session ID", value: FAKE_BATCH_6B.salesforce_session },
  { check: "database", label: "PlanetScale password (pscale_pw_)", value: FAKE_BATCH_6B.planetscale_pw },
  { check: "database", label: "Neon Postgres connection (npg_)", value: FAKE_BATCH_6B.neon_conn },
  { check: "database", label: "Turso token (JWT)", value: FAKE_BATCH_6B.turso_token },
  { check: "dev-collab", label: "Linear API key (lin_api_)", value: FAKE_BATCH_6B.linear_key },
  { check: "dev-collab", label: "Notion secret", value: FAKE_BATCH_6B.notion_secret },
  { check: "dev-collab", label: "Figma token (figd_)", value: FAKE_BATCH_6B.figma_token },
  { check: "email", label: "Postmark server token", value: FAKE_BATCH_6B.postmark_server },
  { check: "email", label: "Mailgun key (key-)", value: FAKE_BATCH_6B.mailgun_key },
  { check: "email", label: "Brevo key (xkeysib-)", value: FAKE_BATCH_6B.brevo_key },
  { check: "email", label: "Loops key", value: FAKE_BATCH_6B.loops_key },
  { check: "generic-public-env", label: "NEXT_PUBLIC_STRIPE_SECRET (leaked env)", value: FAKE_BATCH_6B.next_public_secret },
  { check: "generic-public-env", label: "NEXT_PUBLIC_ADMIN_PASSWORD (leaked env)", value: FAKE_BATCH_6B.next_public_password },
  { check: "llm-providers", label: "Groq (gsk_)", value: FAKE_BATCH_6B.groq_key },
  { check: "llm-providers", label: "Together AI", value: FAKE_BATCH_6B.together_key },
  { check: "llm-providers", label: "Replicate (r8_)", value: FAKE_BATCH_6B.replicate_token },
  { check: "llm-providers", label: "Perplexity (pplx-)", value: FAKE_BATCH_6B.perplexity_key },
  { check: "maps", label: "Google Maps (AIza)", value: FAKE_BATCH_6B.google_maps },
  { check: "maps", label: "Mapbox secret (sk.)", value: FAKE_BATCH_6B.mapbox_secret },
  { check: "netlify", label: "Netlify PAT (nfp_)", value: FAKE_BATCH_6B.netlify_pat },
  { check: "observability", label: "Sentry DSN", value: FAKE_BATCH_6B.sentry_dsn },
  { check: "observability", label: "Datadog API key", value: FAKE_BATCH_6B.datadog_key },
  { check: "observability", label: "New Relic license (NRAK-)", value: FAKE_BATCH_6B.newrelic_license },
  { check: "payment", label: "PayPal client secret (EB)", value: FAKE_BATCH_6B.paypal_secret },
  { check: "payment", label: "Razorpay live (rzp_live_)", value: FAKE_BATCH_6B.razorpay_live },
  { check: "payment", label: "Square access token (EAAA)", value: FAKE_BATCH_6B.square_access },
  { check: "realtime-flags", label: "Pusher secret", value: FAKE_BATCH_6B.pusher_secret },
  { check: "realtime-flags", label: "LaunchDarkly SDK (sdk-)", value: FAKE_BATCH_6B.launchdarkly_sdk },
  { check: "realtime-flags", label: "Ably key", value: FAKE_BATCH_6B.ably_key },
  { check: "search", label: "Algolia admin key", value: FAKE_BATCH_6B.algolia_admin },
  { check: "search", label: "Meilisearch master key", value: FAKE_BATCH_6B.meilisearch_master },
  { check: "search", label: "Typesense admin", value: FAKE_BATCH_6B.typesense_admin },
  { check: "vector-db", label: "Pinecone key", value: FAKE_BATCH_6B.pinecone_key },
  { check: "vector-db", label: "Weaviate key", value: FAKE_BATCH_6B.weaviate_key },
  { check: "vector-db", label: "Qdrant key", value: FAKE_BATCH_6B.qdrant_key },
  { check: "voice-ai", label: "ElevenLabs (sk_)", value: FAKE_BATCH_6B.elevenlabs_key },
  { check: "voice-ai", label: "Deepgram key", value: FAKE_BATCH_6B.deepgram_key },
  { check: "voice-ai", label: "AssemblyAI key", value: FAKE_BATCH_6B.assemblyai_key },
  { check: "webhook", label: "Slack incoming webhook", value: FAKE_BATCH_6B.slack_webhook },
  { check: "webhook", label: "Discord webhook", value: FAKE_BATCH_6B.discord_webhook },
];

export function Batch6bExtendedSecrets() {
  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 6 }}>
      <h3>Batch 6b — Extended Secrets (intentional vulns)</h3>
      <p style={{ color: "#555" }}>
        22 provider/infra API keys planted for BugBuzzer&apos;s extended-secret
        checks. All values are FAKE and rejected by every real provider.
      </p>

      {/* Rendered directly - forces Turbopack to keep the strings in the bundle. */}
      <div style={{ background: "#fafafa", border: "1px solid #eee", padding: 12, borderRadius: 4, fontFamily: "monospace", fontSize: 11, overflowX: "auto" }}>
        {BATCH_6B_KEYS.map((k, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ color: "#666", fontFamily: "sans-serif", fontSize: 12 }}>
              {k.check} — {k.label}
            </div>
            <code style={{ wordBreak: "break-all" }}>{k.value}</code>
          </div>
        ))}
      </div>

      {/* Inline JSON script for extra bundler coverage (same pattern as Batch 1). */}
      <script
        id="testbed-batch-6b-hints"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            BATCH_6B_KEYS.reduce<Record<string, string>>((acc, k) => {
              acc[k.label] = k.value;
              return acc;
            }, {}),
          ),
        }}
      />

      {/* sensitive-data-in-initial-payload: password hashes + DB connection
          strings rendered into server HTML. */}
      <div style={{ marginTop: 16, background: "#fff3cd", padding: 12, borderRadius: 4, fontFamily: "monospace", fontSize: 11 }}>
        <div style={{ fontFamily: "sans-serif", color: "#856404", fontSize: 12, marginBottom: 6 }}>
          sensitive-data-in-initial-payload — hashes + DB URLs in server HTML:
        </div>
        <div>admin_password_hash = <code>{FAKE_INITIAL_PAYLOAD_SECRETS.admin_password_hash}</code></div>
        <div>postgres_url = <code>{FAKE_INITIAL_PAYLOAD_SECRETS.postgres_url}</code></div>
        <div>mysql_url = <code>{FAKE_INITIAL_PAYLOAD_SECRETS.mysql_url}</code></div>
        <div>mongo_url = <code>{FAKE_INITIAL_PAYLOAD_SECRETS.mongo_url}</code></div>
      </div>
    </section>
  );
}
