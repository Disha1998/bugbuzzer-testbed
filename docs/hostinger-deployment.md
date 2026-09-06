# Hostinger deployment — how our testbed is set up

- **Testbed URL:** https://testbed.blockchainhq.xyz
- **VPS:** srv1922025.hstgr.cloud (`76.13.179.65`) — Ubuntu 24.04 LTS
- **Deployed:** 2026-09-02 (moved from Vercel)

---

## Why we moved from Vercel

Vercel's bot protection kept blocking the BugBuzzer scanner (returning HTTP 403). This caused:
- Scanner never saw our fake vulnerabilities → clean-looking reports that were actually wrong
- Scans #7, #8, #9, #11 all blocked
- We couldn't verify Batch 3 for over a week

Hostinger is self-hosted, no bot protection, so the scanner can always reach the site and all checks fire correctly.

---

## How it's set up

**Layout:** Docker container behind an nginx reverse proxy. Same pattern the team uses for their `bugbuzzer-api-beta-*` containers on the same VPS.

- **Container name:** `bugbuzzer-testbed`
- **Container image:** built from the repo's Dockerfile (Node 20 Alpine, 3-stage build)
- **Container port inside Docker:** 3000
- **Host binding:** `127.0.0.1:3200` (localhost only, not directly exposed to internet)
- **Reverse proxy:** nginx site config at `/etc/nginx/sites-available/testbed.blockchainhq.xyz.conf`
- **HTTPS:** Let's Encrypt cert via certbot (auto-renews)
- **Restart policy:** `unless-stopped` (auto-restarts on crash or VPS reboot)
- **Log rotation:** max 30 MB total (10 MB × 3 files)

---

## Common commands cheat sheet

**SSH into the VPS:**
```
ssh root@76.13.179.65
```

**See the testbed logs:**
```
docker logs bugbuzzer-testbed --tail 50 -f
```

**Rebuild + restart the testbed (after pulling new code):**
```
cd /opt/bugbuzzer-testbed
git pull
docker build -t bugbuzzer-testbed:latest .
docker rm -f bugbuzzer-testbed
docker run -d \
  --name bugbuzzer-testbed \
  --restart unless-stopped \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  -p 127.0.0.1:3200:3000 \
  bugbuzzer-testbed:latest
```

**⚠️ IMPORTANT — do NOT use `docker restart` after a rebuild.** `docker restart` just bounces the existing container using the OLD image — it does NOT pick up the freshly-built image. You MUST `docker rm -f` + `docker run` to actually deploy the new build. The tag `bugbuzzer-testbed:latest` only points to the new image; the running container's image is frozen at the time you first ran `docker run`.

**Stop the testbed (for maintenance):**
```
docker stop bugbuzzer-testbed
```

**Start it back up:**
```
docker start bugbuzzer-testbed
```

**Check all containers (ours + team's):**
```
docker ps
```

**Check nginx status:**
```
systemctl status nginx --no-pager
nginx -t                    # test config before reloading
nginx -s reload             # reload after a config change (only if -t passed)
```

**Manually renew the SSL cert (usually auto-renewed by certbot):**
```
certbot renew --dry-run     # test
certbot renew               # for real
```

---

## Rules to keep everyone safe on this shared VPS

**Never touch these — they belong to the beta API team:**
- `/etc/nginx/sites-enabled/api-beta.bugbuzzer.com.conf` — team's nginx config
- Any container whose name starts with `bugbuzzer-api-beta-*`
- Any `/opt/*` directory owned by user `1001` (team deploys)

**When updating our testbed nginx config:**
1. Edit `/etc/nginx/sites-available/testbed.blockchainhq.xyz.conf`
2. **ALWAYS** run `nginx -t` FIRST to check the syntax
3. Only run `nginx -s reload` if the test passes
4. If the test fails, api-beta stays untouched — just fix our config and test again

**When rebuilding our container:**
- `docker build` doesn't affect other containers
- `docker restart bugbuzzer-testbed` only restarts our container
- api-beta's 4 containers keep running the whole time

---

## How everything fits together

```
Internet
   │
   ▼ HTTPS
Vercel / Cloudflare (for beta.bugbuzzer.com) — separate infra
   │
   │  api-beta.bugbuzzer.com  ─────┐
   │                                │
   ▼ HTTPS                          ▼
Hostinger VPS (76.13.179.65)
   │
   └─ nginx (port 80/443)
        ├─ api-beta.bugbuzzer.com.conf → localhost:3101 (team's Docker)
        └─ testbed.blockchainhq.xyz.conf → localhost:3200 (our Docker)
                                              │
                                              └─ Next.js 16.3.1 in container
                                                 (serves testbed with intentional
                                                  vulnerabilities via middleware.ts)
```

---

## What we checked after deployment

Latest scan (2026-09-02, homepage) confirmed:
- 36 findings (up from about 10 on Vercel)
- All Batch 1 secrets fire (7 rows, 26 findings)
- All Batch 3 runtime errors fire (4 out of 5 rows)
- 5 out of 8 Batch 4 file exposures fire
- Bonus: CISA KEV matches on Next.js + Nginx CVEs
- Zero disruption to api-beta or the team's Docker apps

---

## Rollback plan (if we ever need it)

The Vercel deployment still exists (just no DNS points to it anymore). To roll back:
1. BigRock DNS → change the `testbed` A record back to Vercel's IPs
2. Wait ~30 min for DNS propagation
3. Testbed traffic goes back to Vercel

To fully decommission Vercel later:
- Vercel dashboard → project → Settings → Git → Disconnect (stops auto-deploys)
- Or delete the project entirely

---

## Contact info

- **VPS owner:** Disha
- **Nginx config for testbed:** `/etc/nginx/sites-available/testbed.blockchainhq.xyz.conf`
- **Repo on VPS:** `/opt/bugbuzzer-testbed`
- **Container name:** `bugbuzzer-testbed`
- **GitHub repo:** https://github.com/Disha1998/bugbuzzer-testbed (private)
