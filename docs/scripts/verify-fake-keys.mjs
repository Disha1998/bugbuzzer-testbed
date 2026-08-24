#!/usr/bin/env node
// Verifies our testbed fake keys against BugBuzzer's ACTUAL detection logic.
// Simulates BOTH the regex AND the looksLikePlaceholder filter — because scan #3
// (2026-08-24) proved regex-only verification misses the placeholder-drop layer.
//
// Prereq: /tmp/all-content.txt = concatenated HTML + all fetched JS chunks from
// https://testbed.blockchainhq.xyz/. See docs/how-to-verify-manually.md Method 2.

import { readFileSync } from "fs";

const content = readFileSync("/tmp/all-content.txt", "utf8");
console.log(`Scanning ${content.length} bytes of testbed HTML+JS...\n`);

// ---------------------------------------------------------------------------
// Copied verbatim from packages/check-sdk/src/bundle-secrets.ts:47
// ---------------------------------------------------------------------------
const PLACEHOLDER_WORDS = [
  "your", "example", "sample", "placeholder", "replace", "changeme", "change_me",
  "change-me", "dummy", "test-key", "test_key", "test_secret", "secret_here",
  "todo", "fixme", "insert", "fill_in", "fill-in", "put_your", "put-your",
  "fake", "mock", "default", "my-api-key", "my_api_key", "enter_your",
  "enter-your", "add_your", "add-your", "replace_me", "replace-me", "xxxx",
];

function looksLikePlaceholder(value) {
  const v = value.trim().toLowerCase();
  if (PLACEHOLDER_WORDS.some(w => v.includes(w))) return true;
  if (/^(.)\1+$/.test(v)) return true;
  if (/^(?:0123456789|1234567890|abcdefghij)/.test(v)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Regex patterns from packages/check-sdk/src/bundle-secret-extract.ts
// ---------------------------------------------------------------------------
const PATTERNS = [
  { row: 1, check: "openai_project_key", regex: /\bsk-proj-[a-zA-Z0-9_-]{40,80}\b/g },
  { row: 1, check: "anthropic_api_key", regex: /\bsk-ant-(?:api\d+-)?[a-zA-Z0-9_-]{40,100}\b/g },
  { row: 2, check: "stripe_secret_key", regex: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/g },
  { row: 3, check: "jwt_generic_shape", regex: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g },
  { row: 4, check: "aws_access_key_id", regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { row: 6, check: "github_pat_classic", regex: /\bghp_[A-Za-z0-9]{36}\b/g },
  { row: 7, check: "sendgrid_api_key", regex: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/g },
  { row: 7, check: "resend_api_key", regex: /\bre_[A-Za-z0-9]{32,}\b/g },
];

console.log("| Row | Check | Regex hits | After placeholder filter | Would BugBuzzer fire? |");
console.log("|---|---|---|---|---|");

let totalFire = 0;
let totalDroppedByFilter = 0;
for (const p of PATTERNS) {
  const matches = [...content.matchAll(p.regex)].map(m => m[0]);
  const uniq = [...new Set(matches)];
  const survivors = uniq.filter(v => !looksLikePlaceholder(v));
  const dropped = uniq.length - survivors.length;
  const wouldFire = survivors.length > 0 ? "✅ YES" : (uniq.length > 0 ? "❌ dropped by placeholder filter" : "— no candidates");
  console.log(`| ${p.row} | ${p.check} | ${uniq.length} unique | ${survivors.length} survived | ${wouldFire} |`);
  if (survivors.length > 0) totalFire += survivors.length;
  if (dropped > 0) totalDroppedByFilter += dropped;
}

console.log(`\nTotals: ${totalFire} would fire, ${totalDroppedByFilter} would be dropped by placeholder filter.`);

// ---------------------------------------------------------------------------
// Row 5 — hardcoded JWT secret check (assignment regex + name filter + entropy + placeholder)
// From packages/check-catalog/src/checks/bundle-static/hardcoded-jwt-secret-in-js-bundle.ts
// ---------------------------------------------------------------------------
const ASSIGN = /\b([A-Za-z_$][A-Za-z0-9_$]*)\b\s*[:=]\s*["'`]([^"'`\n]{16,512})["'`]/g;
const NAME = /\b(?:jwt[-_]?secret|jwt[-_]?signing[-_]?key|jwt[-_]?private[-_]?key|jwt[-_]?passphrase|signing[-_]?key|hmac[-_]?key|nextauth[-_]?secret|session[-_]?secret)\b/i;
const MIN_ENTROPY = 4.0;
const MIN_LEN = 24;

function shannon(str) {
  const counts = {};
  for (const c of str) counts[c] = (counts[c] || 0) + 1;
  let h = 0;
  for (const c in counts) {
    const p = counts[c] / str.length;
    h -= p * Math.log2(p);
  }
  return h;
}

console.log("\n=== Row 5 — hardcoded-jwt-secret-in-js-bundle full simulation ===");
const jwtSecretsSeen = new Set();
for (const m of content.matchAll(ASSIGN)) {
  const [, name, value] = m;
  if (!NAME.test(name)) continue;
  if (value.length < MIN_LEN) continue;
  if (looksLikePlaceholder(value)) continue;
  const key = `${name}=${value}`;
  if (jwtSecretsSeen.has(key)) continue;
  jwtSecretsSeen.add(key);
  const ent = shannon(value);
  const fires = ent >= MIN_ENTROPY;
  console.log(`  ${fires ? "✅ WOULD FIRE" : "❌ entropy too low"}  name=${name}  len=${value.length}  entropy=${ent.toFixed(2)}`);
}
if (jwtSecretsSeen.size === 0) console.log("  ❌ no candidates survive filters");

console.log("\nNext step: if any row shows ❌ 'dropped by placeholder filter', check lib/fake-secrets.ts");
console.log("Values must not contain: fake, test-key, example, sample, placeholder, dummy, mock, your, changeme");
