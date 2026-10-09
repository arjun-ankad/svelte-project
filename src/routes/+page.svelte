<script>
	import { navigating, page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import ArtworkGrid from '#lib/components/ArtworkGrid.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import ErrorState from '#lib/components/ErrorState.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	// Show skeletons while a new search or page loads, but not on the initial visit.
	const loading = $derived(page.url.pathname === '/' && navigating.to?.url.pathname === '/');

	/** @param {number} n */
	function pageHref(n) {
		const params = new URLSearchParams();
		if (data.q) params.set('q', data.q);
		if (n > 1) params.set('page', String(n));
		return params.size ? `/?${params}` : '/';
	}
</script>

<svelte:head>
	<title>{data.q ? `${data.q} · Art Explorer` : 'Art Explorer'}</title>
</svelte:head>

<div class="intro">
	<h1>{data.q ? `“${data.q}”` : 'Top Art'}</h1>
	<p>
		{#if data.q}
			{data.total.toLocaleString('en-US')} works in the collection
		{:else}
			Highlights from the Art Institute of Chicago
		{/if}
	</p>
</div>

{#if data.error}
	<ErrorState message={data.error} onretry={invalidateAll} />
{:else if !loading && data.artworks.length === 0}
	<EmptyState title="Nothing on view" message="No artworks match “{data.q}”. Try an artist, a movement or a place.">
		<a class="pill glass" href="/">Back to Top Art</a>
	</EmptyState>
{:else}
	<ArtworkGrid artworks={data.artworks} {loading} />

	{#if !loading && data.totalPages > 1}
		<nav class="pagination" aria-label="Pagination">
			{#if data.page > 1}
				<a class="pill glass" href={pageHref(data.page - 1)} rel="prev">← Previous</a>
			{:else}
				<span class="pill glass" aria-disabled="true">← Previous</span>
			{/if}

			<span class="status">Page {data.page} of {data.totalPages}</span>

			{#if data.page < data.totalPages}
				<a class="pill glass" href={pageHref(data.page + 1)} rel="next">Next →</a>
			{:else}
				<span class="pill glass" aria-disabled="true">Next →</span>
			{/if}
		</nav>
	{/if}
{/if}

<SearchBar />

<style>
	.intro {
		display: grid;
		gap: var(--space-2);
		margin: var(--space-4) 0 var(--space-6);
	}

	h1 {
		font-size: var(--text-2xl);
	}

	.intro p {
		color: var(--color-muted);
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		margin-top: var(--space-6);
	}

	.status {
		color: var(--color-muted);
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
	}

	.pill[aria-disabled='true'] {
		opacity: 0.4;
	}

	@media (max-width: 30rem) {
		.pagination {
			gap: var(--space-2);
		}

		.pill {
			padding: var(--space-3) var(--space-4);
		}
	}
</style>
