<script>
  let { path } = $props();
  const pages = import.meta.glob('/src/routes/kb/**/+page.svx', { eager: true });
  const Page = $derived(pages[`/src/routes${path}/+page.svx`]?.default);
</script>

{#if Page}<Page />{:else}<p>Page not found.</p>{/if}
