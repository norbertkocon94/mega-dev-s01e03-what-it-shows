import fs from 'node:fs/promises';
import path from 'node:path';
import { analyze } from '../src/lib/kb/review-analysis.ts';

const root = path.resolve(import.meta.dirname, '..');
const data = path.join(root, 'src/lib/data');
const reports = JSON.parse(await fs.readFile(path.join(data, 'reports-4471.json')));
const notes = JSON.parse(await fs.readFile(path.join(data, 'desk-notes.json')));
const tenants = await Promise.all((await fs.readdir(path.join(data, 'tenants'))).map(async (f) => JSON.parse(await fs.readFile(path.join(data, 'tenants', f)))));
const audit = analyze(reports, tenants, notes.oneDayMove);
const update = JSON.parse(await fs.readFile(path.join(data, 'desk-update.json')));
await fs.mkdir(path.join(root, 'evidence'), { recursive: true });
await fs.mkdir(path.join(root, 'issue-drafts'), { recursive: true });
await fs.writeFile(path.join(root, 'evidence/report-analysis.json'), JSON.stringify(audit, null, 2) + '\n');

const definitions = {
  parser: {
    title: 'Shared date parser swaps day and month for day-first tenants',
    mechanism: 'The shared parser always reads month first, while the affected tenant locale is day first. App/email paths and the relevant booking-v2 form path therefore swap month and day. Tenant locale and channel establish the cause; browserLocale and intakeTag do not.',
    checks: '- Reproduce 07/04/2026 as 7 April for an en-GB tenant; do not produce 4 July.\n- Cover app and email, booking-v2 forms, and app/email from booking-v3 tenants.\n- Cover unambiguous days above 12, invalid dates and month-first tenants.\n- Keep the booking-v3 misleading-hint fix separate and reconcile report IDs after any reclassification.',
  },
  hint: {
    title: 'booking-v3 shows MM/DD/YYYY to day-first tenants',
    mechanism: 'The booking-v3 form prints MM/DD/YYYY, prompting month-first entry, but interprets the value in the tenant’s day-first order. The affected form-channel tenants are alder.physio, copper.studio and pale.harbour. Their app/email reports have the separate parser cause. Fixing only the shared parser does not repair this misleading form hint.',
    checks: '- Align the displayed hint, date-entry interpretation and stored date with each tenant locale.\n- Cover the form channel for alder.physio, copper.studio and pale.harbour.\n- Check ambiguous and unambiguous dates, booking-v2 controls and month-first tenants.\n- Ensure this UI fix does not claim to resolve the independent app/email parser failure.',
  },
};
const manifest = [];
for (const group of audit.groups) {
  const definition = definitions[group.cause];
  if (!definition) throw new Error(`Unclassified group: ${group.cause}; investigate before filing`);
  const title = `#4471 ${group.cause} — ${definition.title} (${group.count} reports)`;
  const examples = group.examples.map((r) => `- **${r.id}** (${r.tenant}, ${r.channel}, ${r.receivedAt.slice(0, 10)}): ${r.body}`).join('\n');
  const anomaly = group.oneDayMove ? `\n## Timing anomalies retained for investigation\n\n${group.oneDayMove} desk-flagged reports remain within this count under the supplied classifier: ${audit.oneDayReports.map((r) => r.id).join(', ')}. Their bodies describe one-day or timing anomalies. Do not invent a third cause or double-count them; collect exact inputs, timestamps and timezones before reclassifying.\n` : '';
  const body = `## Scope\n\n**${group.count} unique reports** from merged ticket **#4471** in the 2026-10-04 export. ${group.tenants} affected tenants; reports received ${group.firstSeen} through ${group.lastSeen}. This count comes from deduplicated report IDs, not subject lines or intake labels.\n\n## Mechanism\n\n${definition.mechanism}\n\n## Evidence\n\n${examples}\n\nIntake tags: ${Object.entries(group.taggedAs).map(([k,v]) => `${k}: ${v}`).join('; ')}. ${group.tagDisagreements} labels disagree with the tenant-based classification.\n\nSources in this repository: src/lib/kb/causes.ts, src/lib/kb/locales.ts, src/lib/data/tenants/, src/lib/data/reports-4471.json. The complete disjoint report-ID set is in evidence/report-analysis.json under groups.${group.cause} (the group whose cause field matches).\n${anomaly}\n## Acceptance checks\n\n${definition.checks}\n\n## Reproduce and refresh\n\nRun npm ci, npm run analyze, npm run build, npm test. The export has ${audit.exportedRows} rows but ${audit.uniqueReports} unique reports; ${audit.overlappingRows} overlapping rows must not inflate the count. Use tenant locale, form and channel, not meta.intakeTag. Counts are an export snapshot; refresh data and reconcile both issues before later triage.\n\nThe signed KB page is src/routes/kb/decisions/0002-triage-by-cause/+page.svx; its rendered counterpart is rendered/kb/decisions/0002-triage-by-cause/index.html. Original decision 0001 remains unchanged. This ticket requests a fix; no production fix is claimed.\n`;
  const file = `issue-drafts/${group.cause}.md`;
  const identification = `Source ticket: #4471\nCause: ${group.cause}\nReports: ${group.count}\n\n`;
  const outcome = update.outcomes[group.cause];
  const resolution = `## Subsequent desk update\n\nSource: ${update.source}, read ${update.observedOn}. The desk reports #4471 closed on ${update.reportedClosedOn}.\n\nOutcome for this cause: **${outcome.status}** — ${outcome.summary}.\nGitHub closure reason: **${outcome.closeReason}**. This is the desk's engineering outcome; this analysis did not implement the fix. Historical counts remain those of the export.\n\n`;
  await fs.writeFile(path.join(root, file), identification + resolution + body);
  manifest.push({ cause: group.cause, title, count: group.count, bodyFile: file });
}
await fs.writeFile(path.join(root, 'issue-drafts/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ rows: audit.exportedRows, unique: audit.uniqueReports, overlap: audit.overlappingRows, groups: audit.groups.map(({ cause, count, tagDisagreements }) => ({ cause, count, tagDisagreements })), peakMergeDate: audit.peakMergeDate, peakMergeCount: audit.peakMergeCount }, null, 2));
