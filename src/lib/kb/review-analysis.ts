import { groupByCause, uniqueById, readAs, type Report, type Tenant } from './causes.ts';

export function analyze(reports: Report[], tenants: Tenant[], oneDayMove: string[]) {
  const byHandle = new Map(tenants.map((t) => [t.handle, t]));
  const unique = uniqueById(reports);
  const merged = unique.filter((r) => r.mergedInto === 4471);
  const groups = groupByCause(merged, (r) => byHandle.get(r.tenant));
  const mergeDays = new Map<string, number>();
  for (const r of merged) {
    if (r.mergedAt) {
      const date = r.mergedAt.slice(0, 10);
      mergeDays.set(date, (mergeDays.get(date) ?? 0) + 1);
    }
  }
  const peak = [...mergeDays.entries()].sort((a, b) => b[1] - a[1])[0];
  const receivedDays = merged.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    ticket: 4471,
    exportedRows: reports.length,
    uniqueReports: merged.length,
    overlappingRows: reports.length - unique.length,
    unplacedReports: groups.find((g) => g.cause === 'unplaced')?.reports.length ?? 0,
    firstReceived: receivedDays[0],
    lastReceived: receivedDays.at(-1),
    peakMergeDate: peak?.[0],
    peakMergeCount: peak?.[1] ?? 0,
    receivedBeforePeak: merged.filter((r) => r.receivedAt.slice(0, 10) < peak?.[0]).length,
    groups: groups.map((g) => ({
      cause: g.cause,
      count: g.reports.length,
      tenants: g.tenants,
      firstSeen: g.firstSeen,
      lastSeen: g.lastSeen,
      taggedAs: g.taggedAs,
      tagDisagreements: g.reports.filter((r) => r.meta.intakeTag !== g.cause).length,
      oneDayMove: readAs(g, oneDayMove),
      ids: g.reports.map((r) => r.id),
      examples: g.reports.slice(0, 3),
    })),
    oneDayReports: merged.filter((r) => oneDayMove.includes(r.id)),
  };
}
