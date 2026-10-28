Source ticket: #4471
Cause: parser
Reports: 379

## Scope

**379 unique reports** from merged ticket **#4471** in the 2026-10-04 export. 11 affected tenants; reports received 2026-04-01 through 2026-10-04. This count comes from deduplicated report IDs, not subject lines or intake labels.

## Mechanism

The shared parser always reads month first, while the affected tenant locale is day first. App/email paths and the relevant booking-v2 form path therefore swap month and day. Tenant locale and channel establish the cause; browserLocale and intakeTag do not.

## Evidence

- **R-41200** (harbour.dental, app, 2026-04-01): Our 7 April reminder went out on 4 July. Is this a joke. It is not April Fools where we are.
- **R-41201** (harbour.dental, app, 2026-04-01): Sorry. 4 July went out on 7 April. I have been up since five.
- **R-41202** (kettle.books, email, 2026-04-02): Invite says Tuesday 12 May. Calendar says Monday 11 May. My client turned up on the Monday. We had coffee.

Intake tags: parser: 356; hint: 23. 23 labels disagree with the tenant-based classification.

Sources in this repository: src/lib/kb/causes.ts, src/lib/kb/locales.ts, src/lib/data/tenants/, src/lib/data/reports-4471.json. The complete disjoint report-ID set is in evidence/report-analysis.json under groups.parser (the group whose cause field matches).

## Timing anomalies retained for investigation

5 desk-flagged reports remain within this count under the supplied classifier: R-41202, R-41209, R-41236, R-41344, R-41620. Their bodies describe one-day or timing anomalies. Do not invent a third cause or double-count them; collect exact inputs, timestamps and timezones before reclassifying.

## Acceptance checks

- Reproduce 07/04/2026 as 7 April for an en-GB tenant; do not produce 4 July.
- Cover app and email, booking-v2 forms, and app/email from booking-v3 tenants.
- Cover unambiguous days above 12, invalid dates and month-first tenants.
- Keep the booking-v3 misleading-hint fix separate and reconcile report IDs after any reclassification.

## Reproduce and refresh

Run npm ci, npm run analyze, npm run build, npm test. The export has 427 rows but 412 unique reports; 15 overlapping rows must not inflate the count. Use tenant locale, form and channel, not meta.intakeTag. Counts are an export snapshot; refresh data and reconcile both issues before later triage.

The signed KB page is src/routes/kb/decisions/0002-triage-by-cause/+page.svx; its rendered counterpart is rendered/kb/decisions/0002-triage-by-cause/index.html. Original decision 0001 remains unchanged. This ticket requests a fix; no production fix is claimed.
