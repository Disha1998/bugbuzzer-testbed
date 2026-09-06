# Phase B backlog — checks we paused from Phase A

This is the list of every check we couldn't test on the current Next.js testbed. Each one needs extra setup (a VPS, a throwaway domain, a real cloud account, etc.). Each entry has:

- Which batch it came from
- Why we paused it
- What we need to set up
- Exact setup steps

**Nothing here is skipped forever.** Phase B is one focused session (or a few) where we set up the extra infrastructure once and knock out multiple paused rows at the same time.

**What we have available** (locked in 2026-08-25):

- Hostinger VPS KVM Pro (root access, our choice of Linux)
- 4-5 BigRock domains, none expiring in the next 60 days
- Existing WordPress site
- Supabase (BugBuzzer's project + can create a separate test project)
- Firebase account
- Cloudflare account
- Email with SPF/DKIM/DMARC set up
- Can create AWS / GCP / Azure accounts on demand

---

## Paused checks

### Row 20 — SSL certificate expiring soon

**Comes from:** Batch 2 — Web hygiene
**Why paused:** Vercel auto-renews Let's Encrypt certs. We can't force an "expiring soon" state on `testbed.blockchainhq.xyz`.

**What we need:** Hostinger VPS + a subdomain of any BigRock domain

**Setup steps:**
1. On the Hostinger VPS, install Nginx (or Apache if we're also testing Batch 8 CVEs)
2. On BigRock DNS, add A record: `ssl-expiry-test.<yourdomain>.xyz` → Hostinger VPS IP
3. Get a Let's Encrypt cert via certbot: `certbot --nginx -d ssl-expiry-test.<yourdomain>.xyz`
4. Right away, turn off the auto-renew: `systemctl disable --now certbot.timer` (or `crontab -r` for cron)
5. Wait ~60 days (cert will reach "expiring within 30 days" state)
6. Scan `https://ssl-expiry-test.<yourdomain>.xyz` in BugBuzzer
7. Confirm `ssl-certificate-issues` fires with "expiring in N days"
8. **After the scan:** either turn auto-renew back on OR let the domain quietly expire. Don't leave a broken cert on a live subdomain long-term.

**Faster option:** self-signed cert with 14-day validity. Might exercise a different code path in the check (self-signed vs Let's Encrypt) — worth testing both cases eventually.

---

### Row 21 — Domain registration expiring soon

**Comes from:** Batch 2 — Web hygiene
**Why paused:** All BigRock domains have >60 days until expiry. Can't fake WHOIS data.

**What we need:** A throwaway domain that expires in <60 days

**Setup option 1 — buy a $1-2 sacrificial domain:**
1. Buy `bbz-expiry-test.xyz` (or similar) with the shortest possible registration at BigRock or Namecheap (usually 1 year)
2. Set a calendar reminder for 30 days before expiry (11 months out)
3. Point the domain at the current Vercel testbed
4. Scan → `domain-registration-expiring-soon` should fire

**Setup option 2 — use a domain naturally close to expiry:**
1. Check each of your 5 BigRock domains: `whois <domain> | grep -i "expir"`
2. If any is less than 60 days from renewal AND you plan to let it expire anyway, use it as the test target now
3. Scan → check fires

**Setup option 3 — sacrificial domain, immediate test:**
Some country-code TLDs allow month-by-month registration. `.tk`, `.ml`, `.ga` were free once (mostly defunct now — verify current status). Buy the shortest possible registration, test, let expire.

---

### Row 50 — Subdomain takeover

**Comes from:** Batch 2 — Web hygiene
**Why paused:** Needs a real dangling CNAME record. Doing this on `blockchainhq.xyz` risks a real attacker claiming the subdomain during the test window.

**What we need:** One throwaway domain (or a subdomain you don't mind exposing)

**Safe setup steps:**
1. Pick one of your 5 BigRock domains that you use LEAST for anything real (or buy a new $1-2 throwaway)
2. Create subdomain `takeover-test.<domain>.xyz`
3. Set its CNAME to a very-random unclaimed AWS S3 bucket: `bbz-takeover-test-<8 random hex chars>.s3.amazonaws.com`
4. Do NOT create that S3 bucket — leave it unclaimed
5. Scan `takeover-test.<domain>.xyz` in BugBuzzer right away
6. Confirm `subdomain-takeover` fires
7. **Same day, ideally within minutes of the scan:** claim the bucket yourself (create it in your AWS account with the exact name in the CNAME) so no real attacker can grab it
8. After verification: delete the CNAME + delete the bucket

**Alternative providers to test** (each has its own fingerprint, so testing all gives more coverage):
- Heroku: `bbz-takeover-test-<random>.herokuapp.com` — don't create the app
- GitHub Pages: `<random-name>.github.io` — don't create the repo
- Netlify: `bbz-takeover-<random>.netlify.app` — don't create the site

Each has a different "unclaimed" signature the check looks for.

---

## Reserved for later batches (add as we hit them)

As we work through Batches 3-6b on the current testbed, any extra paused rows land here.

### Batch 7 — WordPress CVEs (7 checks)

**What we need:** Existing WordPress site (confirmed you have one) + ability to install old vulnerable plugin versions

**Notes:** each CVE row needs a specific plugin version installed. Some can be installed on your existing WordPress; others might need a fresh throwaway WordPress install to avoid breaking your real site.

### Batch 8 — Apache CVEs (2 checks)

**What we need:** Hostinger VPS with Apache installed (needs specific old versions of Apache HTTP Server or Tomcat)

**Notes:** may conflict with any real Apache-hosted sites on the same VPS — use a fresh VPS or a Docker container.

### Batch 9 — Firebase + Supabase (7 checks) — mostly done as of 2026-09-04

**What we need:** Firebase test project + separate Supabase test project (both created, see [batch-09](./batches/batch-09-firebase-supabase.md))

**Status:** 2 Firebase checks working. 3 Supabase checks stuck on a scanner bug (Fix P in the fixes backlog). 1 Firebase Storage paused (needs credit card).

### Batch 10 — AWS S3 (4 checks)

**What we need:** AWS account (need to create one if you don't have it)

**Notes:** each check needs a specific S3 bucket misconfig (public listing on, public write, public read ACL, public read policy).

---

## Priority order for the Phase B session

When we get to Phase B, tackle rows in this order to minimize how much setup you have to do:

1. **VPS-based rows** (one Hostinger setup covers many): Row 20, Batch 8 rows
2. **Domain-based rows** (need throwaway domain): Row 50, Row 21 (planning)
3. **WordPress rows** (existing WP install): Batch 7
4. **Cloud rows** (need AWS): Batch 10, Row 50 alternative providers
5. **BaaS rows** (Firebase + Supabase test projects): Batch 9 (mostly done)
