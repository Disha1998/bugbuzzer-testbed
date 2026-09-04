// Batch 9 — REAL Firebase + Supabase configs for Phase B checks.
//
// Unlike other fake-secrets files, these credentials point to REAL throwaway
// test projects (bugbuzzer-testbed-fb + bugbuzzer-testbed-sb) intentionally
// configured with public rules / RLS disabled. BugBuzzer's Phase B checks
// discover these in the bundle, then probe the real endpoints to confirm
// they respond without auth.
//
// Safe because:
// - Both projects contain only fake `alice@fake-testbed.example` data
// - Zero real users or PII
// - Rules explicitly set to public for testing
// - Free-tier / Spark plan (no billing exposure)

export const FIREBASE_TESTBED_CONFIG = {
  apiKey: "AIzaSyDGGkYqQX4EoyjQA1jiBLC_0rI5ii1P_gE",
  authDomain: "bugbuzzer-testbed-fb.firebaseapp.com",
  projectId: "bugbuzzer-testbed-fb",
  storageBucket: "bugbuzzer-testbed-fb.firebasestorage.app",
  messagingSenderId: "646292366342",
  appId: "1:646292366342:web:1fcb474d0ef22393454f87",
  measurementId: "G-GLNLB62Q0Y",
  databaseURL: "https://bugbuzzer-testbed-fb-default-rtdb.firebaseio.com",
} as const;

// Firestore collection we created with test-mode rules (public read/write).
export const FIREBASE_TESTBED_COLLECTION = "User";

// Realtime Database node with fake alice data.
export const FIREBASE_TESTBED_RTDB_NODE = "users";

export const SUPABASE_TESTBED_URL = "https://ehlhsssovymzsjuthdbn.supabase.co";

export const SUPABASE_TESTBED_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobGhzc3NvdnltenNqdXRoZGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NjU4NDMsImV4cCI6MjEwNDA0MTg0M30.4PadkyLnnlmDgMZWKhnZfAv51SCKdDXahViAQj-tos8";

// Table with Row-Level-Security DISABLED (BugBuzzer probes /rest/v1/{table}?select=*).
export const SUPABASE_TESTBED_TABLE = "users_public";

// Public storage bucket (BugBuzzer probes /storage/v1/bucket/{bucket}).
export const SUPABASE_TESTBED_BUCKET = "public-uploads";

// SECURITY = INVOKER function callable by anon role (BugBuzzer probes /rest/v1/rpc/{fn}).
export const SUPABASE_TESTBED_RPC = "get_public_data";
