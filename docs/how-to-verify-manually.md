# How to check the testbed by hand — prove it's set up right yourself

You don't have to trust anything Claude says. Every claim below can be checked by hand in under 10 minutes using just a browser and a terminal.

The question this doc answers: **"Are the fake keys really in the deployed bundle, and would BugBuzzer's real patterns catch them?"**

---

## Method 1 — Browser DevTools (2 minutes, no terminal)

**Goal:** confirm every fake key is really in the JavaScript that ships to a visitor's browser.

1. Open `https://testbed.blockchainhq.xyz/` in Chrome or Firefox
2. Press **F12** (or right-click → Inspect)
3. Go to the **Sources** tab
4. Press **Cmd+F** (Mac) or **Ctrl+F** (Windows) to open the "Search all files" box
5. Search for each of these strings one at a time:

| Row | Search for this exact string | What you should see |
|---|---|---|
| 1 | `sk-proj-FakeTestbedOpenAI` | Found in a `.js` file under `_next/static/immutable/chunks/` |
| 1 | `sk-ant-api03-FakeTestbedAnthropic` | Found in a `.js` file |
| 2 | `sk_live_FakeTestbedStripeLive` | Found in a `.js` file |
| 3 | `eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2Ui` | Found in a `.js` file (this is the base64-encoded JWT payload) |
| 4 | `AKIAFAKETESTBED12345` | Found in a `.js` file |
| 5 | `jwt_secret = "kQ7pNv` | Found in the HTML source or a `.js` file |
| 5 | `nextauth_secret = "H8xB4mQvR7pKzYnJ` | Found in the HTML source or a `.js` file |
| 6 | `ghp_FakeTestbedGitHubToken12345678901234` | Found in a `.js` file |
| 7 | `re_FakeTestbedResend` | Found in a `.js` file |
| 7 | `SG.FakeTestbed1234567890.FakeTestbedSendGridPart2` | Found in a `.js` file |

If all 10 searches return results, **every fake key is definitely in the bundle**. That's exactly what a real scanner would see.

---

## Method 2 — Command line (5 minutes)

**Goal:** grep for the fake keys the same way BugBuzzer's collector would.

Copy-paste these commands into your terminal:

```bash
# Download the HTML
curl -sSL -o /tmp/testbed.html https://testbed.blockchainhq.xyz/

# Get all JS chunk URLs from the HTML
JS_URLS=$(grep -oE 'src="[^"]*\.js[^"]*"' /tmp/testbed.html | sed 's/src="//; s/"$//' | sort -u)

# Download every JS chunk
i=1
for url in $JS_URLS; do
  curl -sSL -o "/tmp/testbed-chunk-${i}.js" "https://testbed.blockchainhq.xyz${url}"
  i=$((i+1))
done

# Put everything into one file
cat /tmp/testbed.html /tmp/testbed-chunk-*.js > /tmp/testbed-all.txt

# See total size (should be about 587 KB)
wc -c /tmp/testbed-all.txt
```

Now grep for each fake-key prefix:

```bash
grep -oE 'sk-proj-[A-Za-z0-9_-]+' /tmp/testbed-all.txt | sort -u        # Row 1 OpenAI
grep -oE 'sk-ant-api03-[A-Za-z0-9_-]+' /tmp/testbed-all.txt | sort -u   # Row 1 Anthropic
grep -oE 'sk_live_[A-Za-z0-9]+' /tmp/testbed-all.txt | sort -u          # Row 2 Stripe
grep -oE 'AKIA[A-Z0-9]{16}' /tmp/testbed-all.txt | sort -u              # Row 4 AWS
grep -oE 'ghp_[A-Za-z0-9]{36}' /tmp/testbed-all.txt | sort -u           # Row 6 GitHub
grep -oE 're_[A-Za-z0-9]{32,}' /tmp/testbed-all.txt | sort -u           # Row 7 Resend
grep -oE 'SG\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+' /tmp/testbed-all.txt | sort -u  # Row 7 SendGrid
grep -oE '(jwt_secret|nextauth_secret)\s*=\s*"[^"]+"' /tmp/testbed-all.txt  # Row 5 JWT secret
grep -oE 'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+' /tmp/testbed-all.txt | sort -u  # Row 3 JWT shape
```

Each command should print at least one line. If it does, **the fake key is in the bundle in a format BugBuzzer's regex will catch**.

---

## Method 3 — Run BugBuzzer's full detection logic yourself (10 minutes)

**Goal:** run BugBuzzer's actual regex patterns AND its placeholder filter AND (for row 5) its entropy check, all by hand.

**Why this matters:** regex-only verification is NOT enough. Scan #3 (2026-08-24) proved that our first fake keys all passed the regex but were dropped by BugBuzzer's "looks like a placeholder" filter because the values had the word "Fake" in them. The v2 script simulates both layers.

The regex patterns live in the main repo at:

```
/Users/dishasathavara/Documents/DishaCC/bugbuzzer/packages/check-sdk/src/bundle-secret-extract.ts
```

To run them against the deployed testbed content:

```bash
# You already have /tmp/testbed-all.txt from Method 2
# Copy the verification script into a file (or use /tmp/verify-fake-keys.mjs)
node /tmp/verify-fake-keys.mjs
```

Expected output (once new placeholder-safe values are deployed):

```
| Row | Check | Regex hits | After placeholder filter | Would fire? |
|---|---|---|---|---|
| 1 | openai_project_key       | 1 unique | 1 survived | ✅ YES |
| 1 | anthropic_api_key        | 1 unique | 1 survived | ✅ YES |
| 2 | stripe_secret_key        | 1 unique | 1 survived | ✅ YES |
| 3 | jwt_generic_shape        | 1 unique | 1 survived | ✅ YES |
| 4 | aws_access_key_id        | 1 unique | 1 survived | ✅ YES |
| 6 | github_pat_classic       | 1 unique | 1 survived | ✅ YES |
| 7 | sendgrid_api_key         | 1 unique | 1 survived | ✅ YES |
| 7 | resend_api_key           | 1 unique | 1 survived | ✅ YES |
Totals: 8 would fire, 0 would be dropped by placeholder filter.

=== Row 5 — hardcoded-jwt-secret-in-js-bundle full simulation ===
  ✅ WOULD FIRE  name=jwt_secret       len=64  entropy=5.50
  ✅ WOULD FIRE  name=nextauth_secret  len=64  entropy=5.72
```

If your run shows the same, **BugBuzzer's full detection pipeline would fire on every fake key**. If any row shows "dropped by placeholder filter," the value in `lib/fake-secrets.ts` has a placeholder word in it (fake / test-key / example / etc.) — regenerate that value.

---

## Method 4 — Decode the Supabase JWT yourself (1 minute)

**Goal:** confirm the fake JWT has both `role: service_role` AND `iss: supabase` in its payload — the two things the Supabase check requires.

```bash
# Get the JWT from the deployed content
JWT=$(grep -oE 'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+' /tmp/testbed-all.txt | head -1)
echo "JWT: $JWT"

# Decode the payload (middle part)
PAYLOAD=$(echo "$JWT" | cut -d. -f2)
echo "$PAYLOAD" | tr '_-' '/+' | base64 -d 2>/dev/null
```

Expected output:

```
{"role":"service_role","iss":"supabase","ref":"fake-testbed"
```

Both `role=service_role` and `iss=supabase` are there. That's what the `supabase-service-role-key-in-js-bundle` check needs in order to fire.

---

## Method 5 — Online regex tester (browser only, 3 minutes)

If you don't want to touch a terminal at all:

1. Go to `https://regex101.com/`
2. Choose **JavaScript** flavor on the left
3. In the "Regular Expression" box, paste one of BugBuzzer's regex patterns:
   - `\bsk-proj-[a-zA-Z0-9_-]{40,80}\b` for OpenAI project keys
   - `\bghp_[A-Za-z0-9]{36}\b` for GitHub PATs
   - `\bAKIA[0-9A-Z]{16}\b` for AWS keys
   - `\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b` for Stripe
4. In the "Test string" box below, paste the fake key that should match:
   - `sk-proj-FakeTestbedOpenAI1234567890abcdefghijKLMNOPQRSTUV`
   - `ghp_FakeTestbedGitHubToken12345678901234`
   - `AKIAFAKETESTBED12345`
   - `sk_live_FakeTestbedStripeLive1234567890abcdef`
5. The site should highlight the match in the test string on the right

If the site highlights the match, the fake key format is correct.

---

## What to do if any method fails

- **Method 1 (DevTools) shows a key is MISSING** → the last testbed deploy didn't include that key. Push a new commit to the testbed repo and wait for the deploy.
- **Method 2 (grep) returns nothing** → the key is not in the deployed bundle. Same fix as above.
- **Method 3 (regex) shows 0 matches for a check** → the fake key format is wrong for that check's regex. Compare the key in `lib/fake-secrets.ts` against the regex in `bundle-secret-extract.ts` and fix the fake key.
- **Method 4 shows different JWT payload** → deploy didn't pick up the latest fake-secrets.ts. Re-push.
- **Method 5 doesn't highlight** → the regex or test string got pasted with a typo. Try again.

---

## Why this matters

Local regex verification is **weaker** proof than a full end-to-end BugBuzzer scan because:

- It doesn't test BugBuzzer's bundle-fetching (network, timeouts, redirects, SRI, CSP)
- It doesn't test BugBuzzer's HTML parser or `<script>` tag discovery
- It doesn't test BugBuzzer's headless browser for JS runtime checks
- It doesn't test the check's severity assignment, dedup, or evidence-packaging code
- It doesn't exercise the API pipeline that ships findings to the frontend

Local regex verification is **stronger** proof than "trust me" because:

- It uses BugBuzzer's actual regex code (not a rewrite)
- It runs against the actual deployed bundle (not a local fixture)
- It gives you a reproducible pass/fail result you can re-run any time
- It separates "is the testbed correct?" from "is the scanner working?"

Both types of test are useful. Use local verification to prove the testbed is scanner-ready **before** each real BugBuzzer scan. That way you know any real scan failure is a real scanner bug, not a testbed setup mistake.
