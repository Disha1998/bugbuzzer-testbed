# Testing Guide — How to Scan This Testbed with BugBuzzer

This guide walks you through running a BugBuzzer scan against the deployed testbed and verifying the results.

---

## Prerequisites

- Access to BugBuzzer beta: https://beta.bugbuzzer.com
- The testbed is deployed and live at: https://testbed.blockchainhq.xyz
- Latest changes are pushed to `main` (or a batch branch for preview) and Vercel has deployed them

---

## Branch-per-batch workflow (from Batch 2 onwards)

Batches after Batch 1 use a branch-per-batch flow so we can test on Vercel preview URLs before touching production. Standard sequence:

1. **Start from main** — `git checkout main && git pull`
2. **Create batch branch** — `git checkout -b batch-XX-<name>` (e.g. `batch-02-web-hygiene`)
3. **Add the batch's vulnerabilities + batch MD updates on the branch**
4. **Update `app/page.tsx` BATCHES array** — flip `status: "Pending"` → `status: "Live"` and fill `checks: []` for this batch (friendly names, same style as Batch 1). MUST land in the same commit as the vulnerability code so UI never drifts from actual deploy state.
5. **Push the branch** — `git push -u origin batch-XX-<name>`
6. **Grab the Vercel preview URL** — appears in GitHub commit status within ~30 seconds, looks like `https://bugbuzzer-testbed-git-batch-XX-<hash>.vercel.app/`
7. **Scan the preview URL** in BugBuzzer beta — iterate on the branch until every row in the batch fires (0 FP, 0 FN)
8. **Open PR to main + merge** once green
9. **Tag the merge commit** — `git tag batch-XX-complete && git push --tags` — makes regression bisecting easier later
10. **One final confirmation scan against `https://testbed.blockchainhq.xyz/`** (production) — verify DNS-based checks still fire on the real domain
11. **Update batch MD status to ✅ Complete + move to next batch branch**

**Note on preview URL vs production URL:**

Preview URLs are on `*.vercel.app`, not `blockchainhq.xyz`. Any check that reads DNS records for the domain (DMARC, SPF, DKIM, DNSSEC) will scan Vercel's records, not yours. So domain-related findings will differ between preview and production scans. Always do the final confirmation scan on `testbed.blockchainhq.xyz` after merging.

**Batch 1 exception:** Batch 1 was merged directly to main before this workflow was established. It's the reference for "done via direct-to-main". Every batch from Batch 2 onwards uses the branch flow above.

---

## Running a scan

1. Log into `https://beta.bugbuzzer.com` with your BugBuzzer account
2. Click **New scan** or **Scan a site**
3. Enter the URL: `https://testbed.blockchainhq.xyz`
4. Start the scan
5. Wait for the scan to complete (typically 1-3 minutes)
6. Open the scan report

---

## Verifying results

For each batch you've deployed, open the corresponding batch MD file in `docs/batches/`.

### Step 1 — Compare findings

For each expected finding listed in the batch MD:

- ✅ **Pass** — BugBuzzer reported the finding
- ❌ **Fail (false negative)** — BugBuzzer did NOT report a finding it should have
- ⚠️ **Fail (false positive)** — BugBuzzer reported a finding that shouldn't exist

### Step 2 — Fill in the "Actual scan results" table

Update the batch MD file's results table with:
- What BugBuzzer actually detected
- Pass/fail status
- Any notes on odd behavior (wrong severity, wrong location, etc.)

### Step 3 — Update the scan log

Add a new row to `docs/scan-log.md` with the scan date, BugBuzzer version, and pass/fail counts.

### Step 4 — File issues

If any check failed:

- **False negative** — file a bug in the BugBuzzer repo describing what didn't detect
- **False positive** — file a bug describing what fired incorrectly

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
