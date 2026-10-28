import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const plugins = () => [svelte({ extensions: ['.svelte', '.svx'], preprocess: [mdsvex({
  extensions: ['.svx'], layout: { runbook: path.join(root, 'src/lib/layouts/runbook.svelte') },
})] })];
const shared = { root, configFile: false, logLevel: 'warn', resolve: { alias: { '#lib': path.join(root, 'src/lib') } } };

await build({ ...shared, plugins: plugins(), build: {
  ssr: 'scripts/ssr.js', outDir: '.build/server', emptyOutDir: true,
  rollupOptions: { output: { entryFileNames: 'ssr.js' } },
} });
await build({ ...shared, plugins: plugins(), build: {
  outDir: '.build/client', emptyOutDir: true,
  lib: { entry: path.join(root, 'scripts/client.js'), name: 'SupportKB', formats: ['iife'], fileName: () => 'client.js' },
} });

const { paths, renderPage } = await import(pathToFileURL(path.join(root, '.build/server/ssr.js')));
const js = await fs.readFile(path.join(root, '.build/client/client.js'), 'utf8');
const cssFiles = (await fs.readdir(path.join(root, '.build/client'))).filter((f) => f.endsWith('.css'));
const css = (await Promise.all(cssFiles.map((f) => fs.readFile(path.join(root, '.build/client', f), 'utf8')))).join('\n');
for (const route of paths) {
  const result = renderPage(route);
  const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${result.head}<style>${css}</style></head><body><div id="app">${result.body}</div><script>window.__KB_PATH__=${JSON.stringify(route)};</script><script>${js.replaceAll('</script', '<\\/script')}</script></body></html>\n`;
  const directory = path.join(root, 'rendered', route);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'index.html'), html);
  console.log(`Rendered ${route}`);
}
await fs.writeFile(path.join(root, 'rendered/manifest.json'), JSON.stringify({ renderedAt: new Date().toISOString(), routes: paths }, null, 2) + '\n');
