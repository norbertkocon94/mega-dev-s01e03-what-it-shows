import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const root = path.resolve(import.meta.dirname, '..');
const audit = JSON.parse(await fs.readFile(path.join(root, 'evidence/report-analysis.json')));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'issue-drafts/manifest.json')));
assert.equal(audit.exportedRows, 427);
assert.equal(audit.uniqueReports, 412);
assert.equal(audit.overlappingRows, 15);
assert.equal(audit.unplacedReports, 0);
assert.deepEqual(audit.groups.map((g) => [g.cause, g.count]), [['parser', 379], ['hint', 33]]);
const ids = audit.groups.flatMap((g) => g.ids);
assert.equal(ids.length, 412);
assert.equal(new Set(ids).size, 412, 'cause groups must be disjoint');
assert.deepEqual(audit.groups.map((g) => g.oneDayMove), [5, 0]);
assert.equal(audit.peakMergeCount, 184);
assert.equal(audit.peakMergeDate, '2026-07-02');
for (const issue of manifest) {
  const text = await fs.readFile(path.join(root, issue.bodyFile), 'utf8');
  assert.ok(text.includes(`**${issue.count} unique reports**`));
  assert.ok(issue.title.includes(`${issue.count} reports`));
}

const htmlPath = path.join(root, 'rendered/kb/decisions/0002-triage-by-cause/index.html');
const html = await fs.readFile(htmlPath, 'utf8');
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (error) => errors.push(String(error)));
virtualConsole.on('error', (...args) => errors.push(args.map(String).join(' ')));
virtualConsole.on('warn', (...args) => errors.push(args.map(String).join(' ')));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://kb.example/kb/decisions/0002-triage-by-cause/', virtualConsole });
await new Promise((resolve) => dom.window.setTimeout(resolve, 60));
const doc = dom.window.document;
assert.equal(doc.querySelectorAll('.kb').length, 1, 'hydration should retain one layout');
const summary = doc.querySelector('section[aria-label="Report reconciliation"]');
assert.ok(summary.textContent.includes('379'));
assert.ok(summary.textContent.includes('33'));
const pageSource = await fs.readFile(path.join(root, 'src/routes/kb/decisions/0002-triage-by-cause/+page.svx'), 'utf8');
const signature = pageSource.match(/^signature: '([^']+)'/m)?.[1];
assert.ok(signature?.startsWith('v1.'), 'page signature must use the proof issued by the course');
assert.equal(doc.querySelector('.stamp b').textContent, deskRef(signature), 'stamp must be generated from frontmatter signature');

const selectors = [...doc.querySelectorAll('.try select')];
assert.equal(selectors.length, 4);
assert.match(doc.querySelector('.verdict').textContent, /different causes/);
selectors[1].value = 'app';
selectors[1].dispatchEvent(new dom.window.Event('change', { bubbles: true }));
await new Promise((resolve) => dom.window.setTimeout(resolve, 30));
assert.match(doc.querySelector('.verdict').textContent, /same cause/, 'changing channel must recompute the cause comparison');
assert.deepEqual(errors, [], 'render and hydration must have no runtime errors or warnings');
dom.window.close();

const indexHtml = await fs.readFile(path.join(root, 'rendered/kb/index.html'), 'utf8');
const indexDom = new JSDOM(indexHtml);
assert.ok(indexDom.window.document.querySelector('a[href="/kb/decisions/0002-triage-by-cause"]'), 'new record must be discoverable from KB index');
indexDom.window.close();
console.log('PASS: exact disjoint counts, issue drafts, rendered page, computed signature, KB index and interactive cause comparison.');
