// ⚠️ ALL VALUES ARE FAKE — for BugBuzzer scanner testing only.
// Real prefix format so scanners fire. Rest is random garbage.
// No real service will accept these keys.
//
// Format requirements verified against BugBuzzer's regex patterns in
// packages/check-sdk/src/bundle-secret-extract.ts (2026-08-22).

export const FAKE_KEYS = {
  // Row 1 — OpenAI / Anthropic
  // regex: /\bsk-proj-[a-zA-Z0-9_-]{40,80}\b/ — 40-80 chars after prefix
  openai: "sk-proj-FakeTestbedOpenAI1234567890abcdefghijKLMNOPQRSTUV",
  // regex: /\bsk-ant-(?:api\d+-)?[a-zA-Z0-9_-]{40,100}\b/ — 40-100 chars
  anthropic:
    "sk-ant-api03-FakeTestbedAnthropic1234567890abcdefghij1234567890abcdefghij1234567890",

  // Row 2 — Stripe
  // regex: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/ — 16+ chars after prefix
  stripe_live: "sk_live_FakeTestbedStripeLive1234567890abcdef",

  // Row 4 — AWS
  // regex: /\bAKIA[0-9A-Z]{16}\b/ — exactly 16 chars after AKIA
  aws_key_id: "AKIAFAKETESTBED12345",

  // Row 6 — GitHub PAT (classic)
  // regex: /\bghp_[A-Za-z0-9]{36}\b/ — EXACTLY 36 chars after ghp_
  // Value below is exactly 36 alphanumeric chars (verified with .length).
  github: "ghp_FakeTestbedGitHubToken12345678901234",

  // Row 7 — Resend
  // regex: /\bre_[A-Za-z0-9]{32,}\b/ — 32+ alphanumeric chars after re_
  resend: "re_FakeTestbedResend1234567890abcdefghijkl",

  // Row 7 — SendGrid
  // regex: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/
  sendgrid: "SG.FakeTestbed1234567890.FakeTestbedSendGridPart2abcdefghij1234",
};

// Row 3 — Supabase service_role JWT
// The supabase-service-role-key-in-js-bundle check decodes the JWT payload and
// requires BOTH `role: service_role` AND `iss: supabase`. Previous fake JWT had
// iss=fake-testbed which was filtered out. Fixed to iss=supabase.
//
// Payload decodes to: { "role":"service_role", "iss":"supabase", "ref":"fake-testbed" }
export const FAKE_SUPABASE_SERVICE_ROLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJyZWYiOiJmYWtlLXRlc3RiZWQifQ." +
  "FakeTestbedSignatureABC1234567890xyz";

// Row 5 — Hardcoded JWT signing secret
// The hardcoded-jwt-secret-in-js-bundle check requires a VARIABLE ASSIGNMENT
// where the variable name matches one of these names:
//   jwt_secret, jwt_signing_key, jwt_private_key, jwt_passphrase,
//   signing_key, hmac_key, nextauth_secret, session_secret
// The value must be 24+ chars with Shannon entropy >= 4.0.
// Storing it as a named export with a matching identifier ensures it ends up
// in the bundle as `jwt_secret: "..."` (which the regex catches).
export const jwt_secret =
  "kQ7pNv3wR9bZmY6xL2fJhU4nT8aC1sE5dV0yG7iOxRj2Zk1qYbXpMlHc4nBaVfLu";
export const nextauth_secret =
  "H8xB4mQvR7pKzYnJ3wCfN5tU1dLaOe9iSg2XvZjM6qGb0hWyRpTkNcVuAlKfXmDb";
