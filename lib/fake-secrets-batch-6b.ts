// Batch 6b - fake keys for 22 extended-secrets checks. All values are FAKE.
// Format-realistic so BugBuzzer's regex + entropy heuristics fire, but no real
// service will accept them (verified by BugBuzzer's liveness probes).
// Grouped by check category. Each key includes a provider hint in the label.

export const FAKE_BATCH_6B = {
  // agentmail-api-key-in-js-bundle
  agentmail: "agm_live_9xK4pQvR7mNbY3zW8LtHcF2sJdU5aTe6iOxE1qYnPmL0hVfB",

  // analytics-provider-keys-in-js-bundle
  mixpanel_secret: "mxp_sec_A7c3bDeF9gH1iJkLmN2oPqRsTuVwXyZ4a5B6c7D8e9F0g1H2",
  posthog_personal: "phx_9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5x",
  amplitude_secret: "amp_sk_5G8hJ2kL9mN3pQ4rS7tU1vW0xY6zA8bC5dE2fH9iK3jM6nP",
  segment_write: "sgWrite_H3jK7mN2pQ8rS4tU9vW6xY1zA5bC0dE8fG3hJ4kL7mN0p",

  // auth-provider-keys-in-js-bundle
  auth0_client_secret: "M2M_a7B3c9D1e5F8g0H2i4J6k7L9m0N3o5P8q1R4s6T2u8V0w3X5",
  clerk_live: "sk_live_5nB7cD9eF1gH3iJ4kL6mN8oP0qR2sT4uV6wX8yZ0aB2cD4eF6",
  workos_live: "sk_live_workos_HXn3pQ7rS9tU2vW5xY8zA1bC4dE7fG0hJ3kL6mN9oP2q",

  // cloud-infra-provider-keys-in-js-bundle
  fly_token: "fo1_v3_AbC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2zA3bC4dE5fG6",
  render_key: "rnd_9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5x8",
  railway_token: "rlwy_LiveKey_5G8hJ2kL9mN3pQ4rS7tU1vW0xY6zA8bC5dE2fH9iK",

  // cms-media-provider-keys-in-js-bundle
  contentful_cma: "CFPAT-9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5",
  cloudinary_url: "cloudinary://712345678987654:aBcDeFgHiJkLmNoPqRsTuVwXyZ0@fake-testbed-cloud",
  sanity_token: "skFakeTestbed9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5xH3jK",

  // crm-provider-keys-in-js-bundle
  hubspot_pat: "pat-na1-a1b2c3d4-e5f6-7890-1234-567890abcdef",
  salesforce_session: "00D5j000000AbCdE!AQoAQKfake_testbed_session_id_9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6",

  // database-provider-keys-in-js-bundle
  planetscale_pw: "pscale_pw_9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5xH3jK7mN2pQ8rS",
  neon_conn: "postgres://neondb_owner:npg_5G8hJ2kL9mN3pQ4@ep-fake-testbed-a1b2c3d4.us-east-2.aws.neon.tech/neondb?sslmode=require",
  turso_token: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiJmYWtlLXRlc3RiZWQtdHVyc28iLCJpYXQiOjE3MzU2ODk2MDB9.fake_turso_signature_9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6",

  // dev-collab-tokens-in-js-bundle
  linear_key: "lin_api_9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5x",
  notion_secret: "secret_A7c3bDeF9gH1iJkLmN2oPqRsTuVwXyZ4a5B6c7D8e9F0g1H2i",
  figma_token: "figd_9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5x",

  // email-provider-keys-in-js-bundle
  postmark_server: "12345678-9abc-def0-1234-567890abcdef",
  mailgun_key: "key-9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5x",
  brevo_key: "xkeysib-a7c3bDeF9gH1iJkLmN2oPqRsTuVwXyZ4-9K2mN4bV7cX3zQ8p",
  loops_key: "5G8hJ2kL9mN3pQ4rS7tU1vW0xY6zA8bC5dE2fH9iK3jM6nP4qR8t",

  // generic-public-env-secret-in-js-bundle
  next_public_secret: "sk_live_leaked_via_NEXT_PUBLIC_9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE",
  next_public_password: "AdminP@ss_leaked_via_NEXT_PUBLIC_5G8hJ2kL9mN3pQ4rS7tU1vW",

  // llm-providers-api-key-in-js-bundle
  groq_key: "gsk_9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5xH3jK7mN2pQ8rS",
  together_key: "9k2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5xH3jK7mN2pQ8rS4tU9vW6xY1zA5bC0dE",
  replicate_token: "r8_A7c3bDeF9gH1iJkLmN2oPqRsTuVwXyZ4a5B6c7D8e9F",
  perplexity_key: "pplx-9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5x",

  // maps-provider-keys-in-js-bundle
  google_maps: "AIzaSyFake9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI",
  mapbox_secret: "sk.eyJ1IjoiZmFrZS10ZXN0YmVkIiwiYSI6ImNsczlrMm00YjV6Y3EifQ.9K2mN4bV7cX3zQ8pL5jH6d",

  // netlify-pat-in-js-bundle
  netlify_pat: "nfp_9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5x",

  // observability-provider-keys-in-js-bundle
  sentry_dsn: "https://a7c3bDeF9gH1iJkLmN2oPqRsTuVwXyZ4@o123456.ingest.sentry.io/1234567",
  datadog_key: "5G8hJ2kL9mN3pQ4rS7tU1vW0xY6zA8bC",
  newrelic_license: "NRAK-9K2MN4BV7CX3ZQ8PL5JH6D",

  // payment-provider-keys-in-js-bundle
  paypal_secret: "EBHXn3pQ7rS9tU2vW5xY8zA1bC4dE7fG0hJ3kL6mN9oP2qR5sT8u",
  razorpay_live: "rzp_live_9K2mN4bV7cX3zQ8pL5jH6dF1sT0",
  square_access: "EAAAlFake9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6nM3vC5xH3jK7mN2pQ8rS",

  // realtime-flags-provider-keys-in-js-bundle
  pusher_secret: "9K2mN4bV7cX3zQ8pL5jH",
  launchdarkly_sdk: "sdk-a1b2c3d4-e5f6-7890-1234-567890abcdef",
  ably_key: "abc123.def456:9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB6",

  // search-provider-keys-in-js-bundle
  algolia_admin: "9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI",
  meilisearch_master: "MASTER_5G8hJ2kL9mN3pQ4rS7tU1vW0xY6zA8bC5dE2fH9iK3jM6nP",
  typesense_admin: "9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB",

  // vector-db-keys-in-js-bundle
  pinecone_key: "abcd1234-5678-9012-3456-7890abcdef01",
  weaviate_key: "9K2mN4bV7cX3zQ8pL5jH6dF1sT0aE9uI2oY7rW4gB",
  qdrant_key: "5G8hJ2kL9mN3pQ4rS7tU1vW0xY6zA8bC5dE2fH9iK3jM6nP",

  // voice-ai-keys-in-js-bundle
  elevenlabs_key: "sk_9k2mn4bv7cx3zq8pl5jh6df1st0ae9ui2oy7rw4gb6nm3vc5xh3jk7mn2pq8rs4tu9vw6",
  deepgram_key: "9k2mn4bv7cx3zq8pl5jh6df1st0ae9ui2oy7rw4gb",
  assemblyai_key: "5g8hj2kl9mn3pq4rs7tu1vw0xy6za8bc5de2fh9ik3jm6np4",

  // webhook-urls-in-js-bundle
  slack_webhook: "https://hooks.slack.com/services/T00000000/B00000000/AbCdEfGhIjKlMnOpQrStUvWx",
  discord_webhook: "https://discord.com/api/webhooks/123456789012345678/AbCdEfGhIjKlMnOpQrStUvWxYz0123456789AbCdEfGhIjKlMnOpQrStUvWxYz0123456",
} as const;

// sensitive-data-in-initial-payload: password hashes and DB connection strings
// rendered into server HTML.
export const FAKE_INITIAL_PAYLOAD_SECRETS = {
  admin_password_hash: "$2b$10$fakeTestbedHashfakeTestbedHashfakeTestbedHashfake",
  postgres_url: "postgres://admin:Sup3rS3cret@internal-db.fake-testbed.example:5432/production",
  mysql_url: "mysql://root:R00tP@ss@internal-mysql.fake-testbed.example:3306/prod_db",
  mongo_url: "mongodb+srv://admin:M0ng0S3cret@cluster0.fake.mongodb.net/prod?retryWrites=true",
};
