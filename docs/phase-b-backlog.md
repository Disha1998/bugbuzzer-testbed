# Phase B Backlog — Checks Deferred From Phase A Batches

This is the tracked list of every check that could NOT be tested on the current Vercel/Next.js testbed and needs external infrastructure (VPS, throwaway domain, real cloud account, etc.). Every entry has:

- Which batch it came from
- Why it was deferred
- What resource it needs
- Exact setup steps

**Nothing here is skipped forever.** Phase B is one dedicated session (or a few) where we set up the infrastructure once and knock out multiple deferred rows at the same time.

**Available resources** (locked in 2026-08-25):

- Hostinger VPS KVM Pro (root access, chosen distro)
- 4-5 BigRock domains, not expiring in next 60 days
- WordPress site (existing)
- Supabase (bugbuzzer's project + can create a separate test project)
- Firebase account
- Cloudflare account
- Email with SPF/DKIM/DMARC set up
- Can create AWS / GCP / Azure accounts on demand

---

## Deferred rows

### Row 20 — SSL certificate issues (expiring soon)

**Source batch:** 2 — Web Hygiene
**Deferred reason:** Vercel auto-renews Let's Encrypt certs. Cannot force "expiring soon" state on `testbed.blockchainhq.xyz`.

**Resource needed:** Hostinger VPS + a subdomain of any BigRock domain

**Setup steps:**
1. On Hostinger VPS, install Nginx (or Apache if we're also testing Batch 8 CVEs)
2. On BigRock DNS, add A record: `ssl-expiry-test.<yourdomain>.xyz` → Hostinger VPS IP
3. Issue Let's Encrypt cert via certbot: `certbot --nginx -d ssl-expiry-test.<yourdomain>.xyz`
4. Immediately disable the auto-renew systemd timer: `systemctl disable --now certbot.timer` (or `crontab -r` for cron-based)
5. Wait ~60 days (cert reaches "expiring within 30 days" state)
6. Scan `https://ssl-expiry-test.<yourdomain>.xyz` in BugBuzzer beta
7. Verify `ssl-certificate-issues` fires with "expiring in N days"
8. **After scan:** either re-enable auto-renew OR let the domain quietly expire — either way don't leave a broken cert on a live subdomain long-term.

**Faster alternative:** self-signed cert with 14-day validity. Might exercise a different code path in the check (self-signed vs Let's Encrypt) — worth verifying both cases eventually.

---

### Row 21 — Domain registration expiring soon

**Source batch:** 2 — Web Hygiene
**Deferred reason:** All BigRock domains have >60 days until expiry. Cannot fake WHOIS data.

**Resource needed:** A sacrificial domain that expires in <60 days

**Setup steps (option 1 — buy a $1-2 sacrificial domain):**
1. Buy `bbz-expiry-test.xyz` (or similar) with the shortest possible registration period at BigRock or Namecheap (usually 1 year)
2. Set a calendar reminder for 30 days before expiry (11 months out)
3. Point the domain at the current Vercel testbed
4. Scan → `domain-registration-expiring-soon` should fire

**Setup steps (option 2 — use a domain naturally near expiry):**
1. Check each of your 5 BigRock domains: `whois <domain> | grep -i "expir"`
2. If any is <60 days from renewal AND you plan to let it expire anyway, use it as the test target now
3. Scan → check fires

**Setup steps (option 3 — sacrificial domain, immediate test):**
Some ccTLDs allow month-by-month registration. `.tk`, `.ml`, `.ga` were free once (now largely defunct — verify current status). Buy the shortest possible registration, test, let expire.

---

### Row 50 — Subdomain takeover

**Source batch:** 2 — Web Hygiene
**Deferred reason:** Requires a real dangling CNAME. Doing this on `blockchainhq.xyz` risks a real attacker claiming the subdomain during the test window.

**Resource needed:** One throwaway domain (or a subdomain you don't mind exposing)

**Setup steps (safe version):**
1. Pick one of your 5 BigRock domains that you use LEAST for anything real (or buy a new $1-2 throwaway)
2. Create subdomain `takeover-test.<domain>.xyz`
3. Set its CNAME to a very-random unclaimed AWS S3 bucket: `bbz-takeover-test-<8 random hex chars>.s3.amazonaws.com`
4. Do NOT create that S3 bucket — leave it unclaimed
5. Scan `takeover-test.<domain>.xyz` in BugBuzzer beta immediately
6. Verify `subdomain-takeover` fires
7. **Same day, ideally within minutes of the scan:** claim the bucket yourself (create it in your AWS account with the exact name in the CNAME) so no attacker can grab it
8. After verification: delete the CNAME + delete the bucket

**Alternative provider targets** (test each separately since each has its own fingerprint):
- Heroku: `bbz-takeover-test-<random>.herokuapp.com` — don't create the app
- GitHub Pages: `<random-name>.github.io` — don't create the repo
- Netlify: `bbz-takeover-<random>.netlify.app` — don't create the site

Each has a different "unclaimed" signature the check looks for, so testing all four gives more coverage.

---

## Reserved for later batches (add as we hit them)

As we progress through Batches 3-6b on the current testbed, any additional deferred rows will land here. Placeholders below:

### Batch 7 — WordPress CVEs (7 checks)

**Resource needed:** Existing WordPress site (confirmed you have one) + ability to install vulnerable plugin versions

**Notes:** each CVE row needs a specific plugin version installed. Some can be installed on your existing WP; others might need a fresh throwaway WP install to avoid breaking your real site.

### Batch 8 — Apache CVEs (2 checks)

**Resource needed:** Hostinger VPS with Apache installed (need specific old versions of Apache HTTP Server or Tomcat)

**Notes:** may conflict with any real Apache-hosted sites on the same VPS — use a fresh VPS or a Docker container.

### Batch 9 — Firebase + Supabase (7 checks)

**Resource needed:** Firebase test project + separate Supabase test project (both confirmed available)

**Notes:** each check needs a specific misconfig (public bucket, readable Firestore collection, callable RPC as anon, etc.).

### Batch 10 — AWS S3 (4 checks)

**Resource needed:** AWS account (to be created if not already)

**Notes:** each check needs a specific S3 bucket misconfig (public listing enabled, public write, ACL public read, policy public read).

---

## Priority order for Phase B session

When we get to Phase B, tackle rows in this order to minimize infrastructure setup overhead:

1. **VPS-based rows** (one Hostinger setup covers many): Row 20, Batch 8 rows
2. **Domain-based rows** (need throwaway domain): Row 50, Row 21 (planning)
3. **WordPress rows** (existing WP install): Batch 7
4. **Cloud rows** (need AWS): Batch 10, Row 50 alternative providers
5. **BaaS rows** (Firebase + Supabase test projects): Batch 9
