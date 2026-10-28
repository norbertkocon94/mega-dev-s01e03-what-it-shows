Source ticket: #4471
Cause: hint
Reports: 33

## Subsequent desk update

Source: https://hq.mega.dev/challenges/what-it-shows, read 2026-10-28. The desk reports #4471 closed on 2026-10-05.

Outcome for this cause: **won't fix** — booking-v3 form retired.
GitHub closure reason: **not planned**. This is the desk's engineering outcome; this analysis did not implement the fix. Historical counts remain those of the export.

## Scope

**33 unique reports** from merged ticket **#4471** in the 2026-10-04 export. 3 affected tenants; reports received 2026-04-17 through 2026-09-22. This count comes from deduplicated report IDs, not subject lines or intake labels.

## Mechanism

The booking-v3 form prints MM/DD/YYYY, prompting month-first entry, but interprets the value in the tenant’s day-first order. The affected form-channel tenants are alder.physio, copper.studio and pale.harbour. Their app/email reports have the separate parser cause. Fixing only the shared parser does not repair this misleading form hint.

## Evidence

- **R-41230** (copper.studio, form, 2026-04-17): My client came on 1 June instead of 6 January. We sorted it out.
- **R-41241** (alder.physio, form, 2026-04-21): We had two people show up on 8 June. They were booked for 6 August.
- **R-41251** (pale.harbour, form, 2026-04-25): Wednesday 7 January showed as Wednesday 1 July. I moved it myself.

Intake tags: parser: 15; hint: 18. 15 labels disagree with the tenant-based classification.

Sources in this repository: src/lib/kb/causes.ts, src/lib/kb/locales.ts, src/lib/data/tenants/, src/lib/data/reports-4471.json. The complete disjoint report-ID set is in evidence/report-analysis.json under groups.hint (the group whose cause field matches).

## Acceptance checks

- Align the displayed hint, date-entry interpretation and stored date with each tenant locale.
- Cover the form channel for alder.physio, copper.studio and pale.harbour.
- Check ambiguous and unambiguous dates, booking-v2 controls and month-first tenants.
- Ensure this UI fix does not claim to resolve the independent app/email parser failure.

## Reproduce and refresh

Run npm ci, npm run analyze, npm run build, npm test. The export has 427 rows but 412 unique reports; 15 overlapping rows must not inflate the count. Use tenant locale, form and channel, not meta.intakeTag. Counts are an export snapshot; refresh data and reconcile both issues before later triage.

The signed KB page is src/routes/kb/decisions/0002-triage-by-cause/+page.svx; its rendered counterpart is rendered/kb/decisions/0002-triage-by-cause/index.html. Original decision 0001 remains unchanged. This ticket requests a fix; no production fix is claimed.
