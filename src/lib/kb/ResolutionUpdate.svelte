<script>
  import update from '#lib/data/desk-update.json';
</script>

<section aria-label="Engineering resolution update">
  <p>The <a href={update.source}>course support desk</a> subsequently reported #{update.ticket}
    closed on <b>{update.reportedClosedOn}</b>. This update was read on {update.observedOn}, after the initial issue submission.</p>
  <table>
    <thead><tr><th>Cause</th><th>Desk outcome</th><th>Evidence</th><th>GitHub closure reason</th></tr></thead>
    <tbody>{#each Object.entries(update.outcomes) as [cause, outcome]}
      <tr><td>{cause}</td><td>{outcome.status}</td><td>{outcome.summary}</td><td>{outcome.closeReason}</td></tr>
    {/each}</tbody>
  </table>
  <p>The form was retired, not repaired. Its closure must not be recorded as a completed fix.
    The historical report counts remain valid for the supplied export. No engineering code was changed by this analysis.</p>
</section>
