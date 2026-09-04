"use client";

import {
  FIREBASE_TESTBED_CONFIG,
  FIREBASE_TESTBED_COLLECTION,
  FIREBASE_TESTBED_RTDB_NODE,
  SUPABASE_TESTBED_URL,
  SUPABASE_TESTBED_ANON_KEY,
  SUPABASE_TESTBED_TABLE,
  SUPABASE_TESTBED_BUCKET,
  SUPABASE_TESTBED_RPC,
} from "@/lib/phase-b-real-configs";

// Batch 9 — renders REAL Firebase + Supabase configs into the bundle so the
// scanner can discover them and probe the (public-by-design) endpoints.
// Values point to throwaway test projects containing only fake alice data.

export function Batch9PhaseBConfigs() {
  const firebaseInitSnippet = `const firebaseConfig = ${JSON.stringify(FIREBASE_TESTBED_CONFIG, null, 2)};\n// firebase.initializeApp(firebaseConfig);`;

  const supabaseInitSnippet = `const supabaseUrl = ${JSON.stringify(SUPABASE_TESTBED_URL)};\nconst supabaseAnonKey = ${JSON.stringify(SUPABASE_TESTBED_ANON_KEY)};\n// createClient(supabaseUrl, supabaseAnonKey);`;

  return (
    <section
      style={{
        marginTop: 24,
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 6,
      }}
    >
      <h3>Batch 9 — Firebase + Supabase (Phase B real configs)</h3>
      <p style={{ color: "#555" }}>
        Real credentials for throwaway test projects. Firebase has Firestore +
        Realtime Database with test-mode (public) rules. Supabase has a table
        with RLS disabled, a public storage bucket, and an anon-callable RPC.
        Both contain only fake alice@fake-testbed.example data.
      </p>

      {/* Firebase config block - rendered as visible JSON so bundler cannot
          tree-shake, mimicking a real leaked firebase.initializeApp call. */}
      <div
        style={{
          marginTop: 16,
          background: "#fff3cd",
          border: "1px solid #ffe4a1",
          padding: 12,
          borderRadius: 4,
          fontFamily: "monospace",
          fontSize: 11,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            color: "#856404",
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          Firebase config (real testbed project — public rules):
        </div>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {firebaseInitSnippet}
        </pre>
        <div style={{ marginTop: 8, color: "#555", fontFamily: "sans-serif", fontSize: 12 }}>
          Firestore collection: <code>{FIREBASE_TESTBED_COLLECTION}</code>
          <br />
          Realtime Database node: <code>{FIREBASE_TESTBED_RTDB_NODE}</code>
          <br />
          RTDB URL: <code>{FIREBASE_TESTBED_CONFIG.databaseURL}</code>
        </div>
      </div>

      {/* Supabase config block */}
      <div
        style={{
          marginTop: 12,
          background: "#e8f5e9",
          border: "1px solid #c8e6c9",
          padding: 12,
          borderRadius: 4,
          fontFamily: "monospace",
          fontSize: 11,
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            color: "#2e7d32",
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          Supabase config (real testbed project — RLS off / bucket public / RPC anon-callable):
        </div>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {supabaseInitSnippet}
        </pre>
        <div style={{ marginTop: 8, color: "#555", fontFamily: "sans-serif", fontSize: 12 }}>
          Table: <code>{SUPABASE_TESTBED_TABLE}</code>
          <br />
          Bucket: <code>{SUPABASE_TESTBED_BUCKET}</code>
          <br />
          RPC: <code>{SUPABASE_TESTBED_RPC}</code>
        </div>
      </div>

      {/* Inline JSON script for extra bundler coverage. */}
      <script
        id="testbed-batch-9-configs"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            firebase: FIREBASE_TESTBED_CONFIG,
            firebase_collection: FIREBASE_TESTBED_COLLECTION,
            firebase_rtdb_node: FIREBASE_TESTBED_RTDB_NODE,
            supabase_url: SUPABASE_TESTBED_URL,
            supabase_anon_key: SUPABASE_TESTBED_ANON_KEY,
            supabase_table: SUPABASE_TESTBED_TABLE,
            supabase_bucket: SUPABASE_TESTBED_BUCKET,
            supabase_rpc: SUPABASE_TESTBED_RPC,
          }),
        }}
      />

      {/* Plain-JS assignments so scanner regexes matching identifier="..." fire. */}
      <script
        id="testbed-batch-9-globals"
        dangerouslySetInnerHTML={{
          __html: [
            `window.__firebaseConfig = ${JSON.stringify(FIREBASE_TESTBED_CONFIG)};`,
            `window.__supabaseUrl = ${JSON.stringify(SUPABASE_TESTBED_URL)};`,
            `window.__supabaseAnonKey = ${JSON.stringify(SUPABASE_TESTBED_ANON_KEY)};`,
          ].join("\n"),
        }}
      />
    </section>
  );
}
