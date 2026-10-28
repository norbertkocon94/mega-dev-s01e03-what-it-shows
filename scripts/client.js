import { hydrate } from 'svelte';
import App from './App.svelte';

hydrate(App, { target: document.getElementById('app'), props: { path: window.__KB_PATH__ } });

// Keep exported pages navigable when opened directly from disk, as well as when served.
document.addEventListener('click', (event) => {
  const link = event.target instanceof Element ? event.target.closest('a') : null;
  if (!link || !link.getAttribute('href')?.startsWith('/kb')) return;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const depth = window.__KB_PATH__.split('/').filter(Boolean).length;
  event.preventDefault();
  location.href = `${'../'.repeat(depth)}${link.getAttribute('href').slice(1)}/index.html`;
});
