// ⚠️ ALL VALUES ARE FAKE — for BugBuzzer scanner testing only.
// Random garbage with correct provider prefixes. No real service will accept these.
//
// Format requirements verified against BugBuzzer's regex patterns in
// packages/check-sdk/src/bundle-secret-extract.ts
//
// IMPORTANT — placeholder filter:
// BugBuzzer's looksLikePlaceholder() at packages/check-sdk/src/bundle-secrets.ts:47
// drops any secret whose lowercased value contains substrings like "fake", "test-key",
// "example", "sample", "placeholder", "dummy", "mock", "your", "changeme", etc.
// This is CORRECT scanner design — real leaked secrets are random production strings,
// not values that literally say "fake". To make our fake keys actually testable, the
// VALUES below must contain NO placeholder words. Only labels and comments may.
//
// Previous version used "FakeTestbed..." values → scan #3 (2026-08-24) showed 6 of 7
// checks dropping our keys as placeholders. Values regenerated 2026-08-24 as pure
// random alnum strings using node:crypto.randomBytes.

export const FAKE_KEYS = {
  // Row 1 — OpenAI / Anthropic
  // regex: /\bsk-proj-[a-zA-Z0-9_-]{40,80}\b/
  openai: "sk-proj-RAbUHPkxrNgKUEdiZo_S8yzLB1O0lZELYSIjec6vHF7E_Sksp1hI9EsP",
  // regex: /\bsk-ant-(?:api\d+-)?[a-zA-Z0-9_-]{40,100}\b/
  anthropic:
    "sk-ant-api03-tPe9_w0it6bSJPGhi4cSqQTDrsHQu4XP8XDIhCUDtvhKQMfEysgnZa3I81lcej4Xb6-OGj7TcPEiuWw8",

  // Row 2 — Stripe
  // regex: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/
  stripe_live: "sk_live_T16KOEne8oPbMIZOgiCYVVoV",

  // Row 4 — AWS
  // regex: /\bAKIA[0-9A-Z]{16}\b/ — exactly 16 uppercase alnum after AKIA
  aws_key_id: "AKIACF4CWM2FJEKKSPQR",

  // Row 6 — GitHub PAT (classic)
  // regex: /\bghp_[A-Za-z0-9]{36}\b/ — exactly 36 alnum after ghp_
  github: "ghp_rVV62BKibqpFysBvXn6LZBvnhb4W6P2MXQ53",

  // Row 7 — Resend
  // regex: /\bre_[A-Za-z0-9]{32,}\b/
  resend: "re_dWhxcy5ikTlUMFiQyzfTNdyc0B6FArqBOf1NPmL4",

  // Row 7 — SendGrid
  // regex: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/
  sendgrid:
    "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",
};

// Row 3 — Supabase service_role JWT
// Check requires BOTH `role: service_role` AND `iss: supabase` in decoded payload.
// Payload here decodes to: { "role":"service_role", "iss":"supabase", "ref":"nvxkucnvfp" }
// Signature part is pure random — previous "FakeTestbedSignatureABC" triggered placeholder
// filter on the WHOLE JWT string, not just the payload.
export const FAKE_SUPABASE_SERVICE_ROLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJyZWYiOiJudnhrdWNudmZwIn0." +
  "aLC-bjhc-_UuANqjaR3_LznsiE1PAwfTCcN1Yz3pWvm";

// Row 5 — Hardcoded JWT signing secret
// check requires: variable name matches JWT_SECRET_NAME_PATTERN (jwt_secret, nextauth_secret,
// signing_key, hmac_key, etc), value ≥24 chars, Shannon entropy ≥4.0.
// These 64-char high-entropy random strings ALREADY passed scan #3 — do not change unless
// broken by a scanner update.
export const jwt_secret =
  "kQ7pNv3wR9bZmY6xL2fJhU4nT8aC1sE5dV0yG7iOxRj2Zk1qYbXpMlHc4nBaVfLu";
export const nextauth_secret =
  "H8xB4mQvR7pKzYnJ3wCfN5tU1dLaOe9iSg2XvZjM6qGb0hWyRpTkNcVuAlKfXmDb";
