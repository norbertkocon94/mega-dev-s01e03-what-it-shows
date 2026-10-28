# S01E03 — what it shows

This repository contains the supplied support KB export plus a proposed correction to its
subject-only triage policy. The course data describes a fictional support desk.

## Deliverables

- Signed source: [0002-triage-by-cause/+page.svx](src/routes/kb/decisions/0002-triage-by-cause/+page.svx).
- Rendered page: [open the HTML file](rendered/kb/decisions/0002-triage-by-cause/index.html).
- Complete rendered KB: [index](rendered/kb/index.html).
- Two GitHub issue drafts: [parser](issue-drafts/parser.md), [hint](issue-drafts/hint.md).
- [Titles and counts](issue-drafts/manifest.json) and [complete report-ID partition](evidence/report-analysis.json).
- Publication links, once created: [issue-links.json](src/lib/data/issue-links.json).

Download the repository and open the rendered HTML directly in a browser. Each HTML file embeds
its CSS, data and JavaScript; no server is required. The duplicate-report explorer is interactive.
GitHub's source view of an HTML file is not its rendered view.

## Reproduce

Use Node.js 22.18+ (native TypeScript stripping) or Node.js 24+ and npm:

```sh
npm ci
npm run analyze
npm run build
npm test
```

`analyze` uses the export's classifier and tenant configuration, deduplicates by report ID,
and generates evidence plus issue drafts. `build` compiles actual SVX and Svelte components,
renders them on the server and embeds a client bundle for interactivity. No prose-only mock
stands in for the compiled page. `test` checks the report partition, matching issue counts,
computed signature, discovery through the KB index and a live change in the cause explorer.

## Findings and limits

The supplied export has 427 rows representing 412 unique reports: 379 parser reports and
33 booking-v3 hint reports. These are disjoint groups. Intake labels disagree with the tenant-based
classification for 38 reports. Five timing-anomaly reports remain within the parser group pending
investigation; they are not double-counted as a third cause.

The report export ends on 4 October 2026. The review was prepared on 28 October; it is not a claim
to have downloaded newer ticket data. Refresh the source exports and tenant configuration,
rerun all commands, then reconcile both GitHub issues before later operational use.

The original source files, including accepted decision 0001, are retained unchanged. The new
decision is proposed, signed by the authoring agent, and does not claim a production fix or
approval from the support team. Compiled snapshots of old pages retain their historical claims.

Only the `support-kb/` directory is intended for the challenge's public repository. It does not
include the user's local daily notes, other project history, authentication data or the surrounding workspace.
