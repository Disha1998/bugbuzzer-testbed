# Testing guide — how to scan the testbed with BugBuzzer

This guide walks you through running a BugBuzzer scan against the testbed and checking the results.

---

## What you need first

- Access to BugBuzzer beta: https://beta.bugbuzzer.com
- The testbed is deployed and live at: https://testbed.blockchainhq.xyz
- Latest changes are pushed to `main` and the deploy has finished

---

## How we work — push straight to main (from Batch 4 onwards)

**Decision made 2026-09-01:** we work on `main` directly, no per-batch branches. Reason: Vercel preview URLs were gated by Vercel Authentication (bot protection + login required for previews on our plan), so testing on preview URLs was never actually possible. Merging to main was going to happen anyway → we just skip the branch step.

**Normal sequence:**

1. Check you're on main and clean — `git status`
2. Pull latest — `git pull`
3. Make the batch's code changes + doc updates directly on main
4. Update `app/page.tsx` BATCHES array — change `status: "Pending"` → `status: "Live"` and fill in `checks: []`
5. Review the diff — `git diff | cat`
6. Commit + push — Vercel auto-deploys to `testbed.blockchainhq.xyz` in ~1 min (or on Hostinger, rebuild the container manually)
7. Scan `https://testbed.blockchainhq.xyz/` in BugBuzzer
8. If all rows fire → change the status to "Complete" in a follow-up commit + push
9. If some rows don't fire → log them in `docs/testbed-fixes-backlog.md` with Owner + Priority + Fix Steps + Verification, and move on to the next batch anyway

**Old branch-per-batch workflow (2026-08-26 through 2026-09-01):**

Tried for Batch 2 and Batch 3. Preview URLs were gated by Vercel Authentication so we couldn't actually test on them, which defeated the point. Batches were merged to main anyway. Retired 2026-09-01.

---

## OLD workflow (retired) — for reference only

1. **Start from main** — `git checkout main && git pull`
2. **Create batch branch** — `git checkout -b batch-XX-<name>` (e.g. `batch-02-web-hygiene`)
3. **Add the batch's vulnerabilities + batch MD updates on the branch**
4. **Update `app/page.tsx` BATCHES array** — change `status: "Pending"` → `status: "Live"` and fill `checks: []` for this batch (friendly names, same style as Batch 1). MUST land in the same commit as the vulnerability code so the UI never drifts from actual deploy state.
5. **Push the branch** — `git push -u origin batch-XX-<name>`
6. **Grab the Vercel preview URL** — appears in GitHub commit status within ~30 seconds, looks like `https://bugbuzzer-testbed-git-batch-XX-<hash>.vercel.app/`
7. **Scan the preview URL** in BugBuzzer — iterate on the branch until every row fires (0 false alarms, 0 misses)
8. **Open PR to main + merge** once green
9. **Tag the merge commit** — `git tag batch-XX-complete && git push --tags` — makes finding old regressions easier later
10. **One final confirmation scan against `https://testbed.blockchainhq.xyz/`** — verify DNS-based checks still fire on the real domain
11. **Change BATCHES[n].status from "Live" → "Complete" in app/page.tsx** — commit + push. This is the ONLY signal on the live testbed that a batch has passed scan verification, not just been deployed.
12. **Update the batch MD status to ✅ Done + move to next batch branch**

**What each status means for the BATCHES array** (4 states, matches `docs/README.md`):

- **Pending** — batch not deployed yet (gray badge)
- **Live** — deployed, waiting for scan to confirm (yellow badge)
- **Complete** — deployed AND scan has verified every row fires (green badge)
- **Regression** — was Complete, now some rows are failing (red badge)

---

## Every batch MD needs a "Where we are" block at the top

Every `docs/batches/batch-XX-*.md` file MUST start with a 3-line status block right after the h1 title. A reader should know if the batch needs attention in 3 seconds — without reading the whole doc.

**Format:**

```markdown
# Batch X — <title>

## 📋 Where we are — YYYY-MM-DD

**Is this batch done? YES ✅ / NO ❌**
- N out of M checks working (%)
- N open items (or "0 open items" if clean)

If open items > 0, list each with a 1-line fix:
1. **Row X — check-name** — why it's not working, planned fix
2. ...

Last scan: BB-YYYYMMDD-XXXXX (YYYY-MM-DD). N total findings. Link to scan-issue MD.

---
```

Update this block after every scan run against the batch. See [`batch-01`](./batches/batch-01-secrets-in-js-bundle.md) (all rows firing) and [`batch-02`](./batches/batch-02-web-hygiene.md) (2 open items) for live examples.

**Note on preview URL vs production URL:**

Preview URLs are on `*.vercel.app`, not `blockchainhq.xyz`. Any check that reads DNS records for the domain (DMARC, SPF, DKIM, DNSSEC) will scan Vercel's records, not yours. So domain-related findings will differ between preview and production scans. Always do the final confirmation scan on `testbed.blockchainhq.xyz` after merging.

**Batch 1 exception:** Batch 1 was merged directly to main before this workflow was set up. It's the reference for "done via direct-to-main." Every batch from Batch 2 onwards uses the branch flow above.

---

## Running a scan

1. Log into `https://beta.bugbuzzer.com` with your BugBuzzer account
2. Click **New scan** or **Scan a site**
3. Enter the URL: `https://testbed.blockchainhq.xyz`
4. Start the scan
5. Wait for the scan to finish (usually 1-3 minutes)
6. Open the scan report

---

## Checking the results

For each batch you've deployed, open the matching batch MD file in `docs/batches/`.

### Step 1 — Compare findings

For each expected finding listed in the batch MD:

- ✅ **Pass** — BugBuzzer reported the finding
- ❌ **Fail (miss / false negative)** — BugBuzzer did NOT report a finding it should have
- ⚠️ **Fail (false alarm / false positive)** — BugBuzzer reported a finding that shouldn't exist

### Step 2 — Fill in the "Actual scan results" table

Update the batch MD file's results table with:
- What BugBuzzer actually detected
- Pass/fail status
- Any notes on weird behavior (wrong severity, wrong location, etc.)

### Step 3 — Update the scan log

Add a new row to `docs/scan-log.md` with the scan date, scanner version, and pass/fail counts.

### Step 4 — File issues

If any check failed:

- **Miss** — file a bug in the BugBuzzer repo describing what didn't detect
- **False alarm** — file a bug describing what fired incorrectly

Both should include the exact finding from the scan report + the expected behavior.

---

## Investigating a failure

If a check that should have fired didn't:

1. Open the browser and go to `https://testbed.blockchainhq.xyz`
2. Right click → **View Page Source** OR open DevTools → **Sources** tab
3. Find the compiled JavaScript file (usually `_next/static/chunks/...`)
4. Search (Cmd+F / Ctrl+F) for the fake secret string that should have been detected
5. If the string IS in the bundle but BugBuzzer didn't find it → BugBuzzer bug (fix the check)
6. If the string is NOT in the bundle → testbed bug (fix the fake vulnerability so it actually ends up in the bundle)

---

## Regression testing (recommended weekly)

Once you're past Batch 1, every scan should test ALL batches deployed so far, not just the newest. This catches:

- New BugBuzzer code accidentally breaking an old check
- Testbed changes accidentally removing a vulnerability
- Deploy pipeline issues

Automate this in Week 4 with a nightly cron job.
