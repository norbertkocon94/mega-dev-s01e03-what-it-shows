import { render } from 'svelte/server';
import App from './App.svelte';
const modules = import.meta.glob('/src/routes/kb/**/+page.svx', { eager: true });
export const paths = Object.keys(modules).map((p) => p.replace('/src/routes', '').replace('/+page.svx', ''));
export const renderPage = (path) => render(App, { props: { path } });
