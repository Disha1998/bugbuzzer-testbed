# Safety Notes — DO NOT ABUSE THIS TESTBED

This project deliberately contains security vulnerabilities. It exists only to test the BugBuzzer scanner. Follow these rules to keep it safe.

---

## Rules

### 1. All secrets and credentials MUST be fake

Every API key, JWT, database password, and token in this project uses the correct **format** (real prefix like `sk-`, `AKIA`, `ghp_`) but the rest is random garbage.

**Never:**
- Paste a real OpenAI / Stripe / GitHub / AWS key into the testbed
- Use real customer data, emails, or PII
- Connect the testbed to a real Firebase / Supabase / AWS account
- Deploy this app inside a real product environment

**Always:**
- Use the format `[real-prefix]-Fake[Testbed]RandomString...`
- Add a clear comment above every fake secret: `// FAKE — for scanner testing only`

### 2. Keep the GitHub repo private

The repo contains a menu of vulnerabilities. If public, script kiddies could:

- Study the vulnerabilities to attack real sites
- Fork and deploy a copy, then use it to phish

**Repo must always be private.** Do not accept collaborators outside the BugBuzzer team.

### 3. Warn everyone who lands on the site

The testbed's homepage must always display:

- Red banner: "⚠️ INTENTIONALLY VULNERABLE TESTBED"
- Clear text: "All secrets are fake. Do not use in production."
- `<meta name="robots" content="noindex,nofollow">` in HTML head
- `public/robots.txt` disallowing all crawlers

### 4. Do NOT deploy real infrastructure vulnerabilities without isolation

Some batches (WordPress, Apache CVEs, cloud storage) require deploying real vulnerable software. When we get to those (Phase B):

- Use throwaway VPS instances that can be destroyed after testing
- Set hard AWS billing alerts at $5, $10, $25
- Use fresh cloud accounts (not tied to any production account)
- Rotate infrastructure weekly to avoid attracting botnet attacks

### 5. Log everything

Every scan, every vulnerability added, every fix — logged in the docs. Never silently deploy an untracked vulnerability.

---

## What happens if someone abuses this

If someone finds the testbed and tries to attack it:

- No real damage possible (fake secrets, no real data)
- But the attacker's IP + traffic may still show up in Vercel logs
- If abuse spikes → temporarily switch Vercel access to IP-allowlisted (only BugBuzzer scanner IP allowed)

---

## Reporting a safety issue

If you find:

- A real secret accidentally committed
- The warning banner missing
- The repo becoming public
- Unexpected traffic patterns

Fix it immediately, then log in `docs/scan-log.md` under Notes.

---

## Weekly safety checklist

Every Monday, verify:

- [ ] Repo is still private on GitHub
- [ ] Warning banner still shows on homepage
- [ ] `robots.txt` still disallowing crawlers
- [ ] No real secrets in `lib/fake-secrets.ts` or elsewhere
- [ ] Vercel deployment logs show no unexpected geographic traffic
