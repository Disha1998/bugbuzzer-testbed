# Safety rules — DO NOT ABUSE THIS TESTBED

This project has security problems in it on purpose. It only exists so we can test the BugBuzzer scanner. Follow these rules to keep it safe.

---

## The rules

### 1. Every secret and credential MUST be fake

Every API key, JWT, database password, and token in this project uses the correct **format** (real prefix like `sk-`, `AKIA`, `ghp_`) but the rest is random garbage.

**Never:**
- Paste a real OpenAI / Stripe / GitHub / AWS key into the testbed
- Use real customer data, emails, or PII
- Connect the testbed to a real Firebase / Supabase / AWS account (except our safe throwaway test projects)
- Deploy this app inside a real product environment

**Always:**
- Use the format `[real-prefix]-Fake[Testbed]RandomString...`
- Add a clear comment above every fake secret: `// FAKE — for scanner testing only`

### 2. Keep the GitHub repo private

The repo has a menu of vulnerabilities in it. If it goes public, script kiddies could:

- Study the vulnerabilities to attack real sites
- Fork and deploy a copy, then use it for phishing

**Repo must always stay private.** Do not accept collaborators outside the BugBuzzer team.

### 3. Warn everyone who lands on the site

The testbed's homepage must always show:

- Red banner: "⚠️ INTENTIONALLY VULNERABLE TESTBED"
- Clear text: "All secrets are fake. Do not use in production."
- `<meta name="robots" content="noindex,nofollow">` in the HTML head
- `public/robots.txt` blocking all crawlers

### 4. Do NOT deploy real infrastructure vulnerabilities without isolation

Some batches (WordPress, Apache CVEs, cloud storage) need real vulnerable software. When we get to those (Phase B):

- Use throwaway VPS instances you can destroy after testing
- Set hard AWS billing alerts at $5, $10, $25
- Use fresh cloud accounts (not tied to any production account)
- Rotate infrastructure weekly to avoid attracting botnet attacks

### 5. Log everything

Every scan, every vulnerability added, every fix — logged in the docs. Never silently deploy an untracked vulnerability.

---

## What happens if someone abuses this

If someone finds the testbed and tries to attack it:

- No real damage is possible (fake secrets, no real data)
- But the attacker's IP + traffic may still show up in our logs
- If abuse spikes → temporarily switch to IP-allowlisted (only BugBuzzer scanner IP allowed)

---

## Reporting a safety issue

If you find:

- A real secret accidentally committed
- The warning banner missing
- The repo becoming public
- Unexpected traffic patterns

Fix it right away, then log it in `docs/scan-log.md` under Notes.

---

## Weekly safety check

Every Monday, verify:

- [ ] Repo is still private on GitHub
- [ ] Warning banner still shows on the homepage
- [ ] `robots.txt` still blocks crawlers
- [ ] No real secrets in `lib/fake-secrets.ts` or anywhere else
- [ ] Deployment logs show no unusual geographic traffic
