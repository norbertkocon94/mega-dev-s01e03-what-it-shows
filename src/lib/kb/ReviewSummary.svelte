<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import issueLinks from '#lib/data/issue-links.json';
  import { analyze } from '#lib/kb/review-analysis';
  import type { Report, Tenant } from '#lib/kb/causes';
  const tenants = Object.values(import.meta.glob<Tenant>('/src/lib/data/tenants/*.json', { eager: true, import: 'default' }));
  const audit = analyze(reports as Report[], tenants, notes.oneDayMove);
  const links = issueLinks as Record<string, string>;
  const names: Record<string, string> = { parser: 'Shared parser reads month first', hint: 'booking-v3 date hint contradicts tenant locale', unplaced: 'Needs investigation' };
</script>

<section aria-label="Report reconciliation">
  <p><strong>{audit.uniqueReports} unique reports</strong> in #{audit.ticket}, from {audit.exportedRows} export rows.
    The {audit.overlappingRows} repeated rows are pagination overlap, not additional reports.</p>
  <div class="bars" aria-label="Reports per cause">
    {#each audit.groups as group (group.cause)}
      <div class="bar-label"><b>{group.cause}</b><span>{group.count} reports</span></div>
      <div class="track"><div class="fill" style:width={`${100 * group.count / audit.uniqueReports}%`}></div></div>
    {/each}
  </div>
  <div class="table-scroll">
    <table>
      <thead><tr><th>Cause / scope</th><th>Reports</th><th>Tenants</th><th>Received</th><th>Separate ticket</th></tr></thead>
      <tbody>
        {#each audit.groups as group (group.cause)}
          <tr>
            <td><code>{group.cause}</code><br />{names[group.cause]}</td>
            <td>{group.count}</td><td>{group.tenants}</td>
            <td>{group.firstSeen}<br />to {group.lastSeen}</td>
            <td>{#if links[group.cause]}<a href={links[group.cause]}>GitHub issue</a>{:else}Prepared locally; publication pending{/if}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p>Reports received from <b>{audit.firstReceived}</b> through <b>{audit.lastReceived}</b>.
    The busiest merge day was <b>{audit.peakMergeDate}</b>, with <b>{audit.peakMergeCount}</b> merges;
    <b>{audit.receivedBeforePeak}</b> reports had already arrived before that day.</p>
  <p>The merge spike records queue handling, not the beginning of the incident. Compare received dates with merged dates below.</p>
  <h3>Intake labels are not root causes</h3>
  {#each audit.groups as group (group.cause)}
    <p><code>{group.cause}</code>: {Object.entries(group.taggedAs).map(([tag, n]) => `${n} tagged ${tag}`).join('; ')}.
      <strong>{group.tagDisagreements}</strong> intake labels disagree with the tenant-based classification.</p>
  {/each}
  <h3>One-day descriptions need follow-up</h3>
  <p><strong>{audit.oneDayReports.length}</strong> reports flagged in the desk notes describe a one-day move or other timing anomaly.
    All remain included in the parser count under the supplied classifier; none is counted twice.
    Their wording alone does not establish a third root cause.</p>
  <details><summary>Read the flagged reports and preserve their ambiguity</summary>
    {#each audit.oneDayReports as report (report.id)}
      <p><b>{report.id}</b> · {report.tenant} · {report.channel}<br />{report.body}</p>
    {/each}
  </details>
  <details><summary>Evidence identifiers by cause</summary>
    {#each audit.groups as group (group.cause)}
      <p><b>{group.cause}</b>: {group.ids.join(', ')}</p>
    {/each}
  </details>
</section>

<style>
  .bars { margin: 1rem 0; }
  .bar-label { display: flex; justify-content: space-between; gap: 1rem; }
  .track { height: 14px; border-radius: 3px; background: var(--line); margin: 4px 0 12px; overflow: hidden; }
  .fill { background: var(--accent); height: 14px; }
  .table-scroll { overflow-x: auto; }
  details { padding: .75rem; margin: .75rem 0; border: 1px solid var(--line); border-radius: 6px; }
  summary { cursor: pointer; font-weight: 600; }
  details p { overflow-wrap: anywhere; }
</style>
