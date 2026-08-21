// ⚠️ ALL VALUES ARE FAKE — for BugBuzzer scanner testing only.
// Real prefix format so scanners fire. Rest is random garbage.
// No real service will accept these keys.

export const FAKE_KEYS = {
    // Row 1 — OpenAI / Anthropic
    openai: "sk-proj-FakeTestbedOpenAI1234567890abcdefghijKLMNOPQRSTUV",
    anthropic:
      "sk-ant-api03-FakeTestbedAnthropic1234567890abcdefghij1234567890abcdefghij1234567890",
  
    // Row 2 — Stripe
    stripe_live: "sk_live_FakeTestbedStripeLive1234567890abcdef",
  
    // Row 4 — AWS
    aws_key_id: "AKIAFAKETESTBED12345",
  
    // Row 5 — JWT secret
    jwt_secret: "supersecret-fake-testbed-jwt-signing-key-abcdef1234567890XYZ",
  
    // Row 6 — GitHub
    github: "ghp_FakeTestbedGitHubTokenAbc1234567890xyz1234567890",
  
    // Row 7 — Resend + SendGrid
    resend: "re_FakeTestbedResend1234567890abcdefghijklmnop",
    sendgrid: "SG.FakeTestbed1234567890.FakeTestbedSendGridPart2abcdefghij1234",
  };
  
  // Row 3 — Supabase service_role JWT
  // Structurally valid JWT — payload decodes to { "role": "service_role", "iss": "fake-testbed" }
  // BugBuzzer decodes JWTs and checks the role claim.
  export const FAKE_SUPABASE_SERVICE_ROLE_JWT =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoiZmFrZS10ZXN0YmVkIn0." +
    "FakeTestbedSignatureABC1234567890xyz";
  