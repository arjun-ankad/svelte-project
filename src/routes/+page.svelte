<script>
	import { invalidateAll } from '$app/navigation';
	import ArtworkFeed from '#lib/components/ArtworkFeed.svelte';
	import ArtworkGrid from '#lib/components/ArtworkGrid.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import ErrorState from '#lib/components/ErrorState.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.q ? `${data.q} · Art Explorer` : 'Art Explorer'}</title>
</svelte:head>

{#if data.q}
	<div class="intro">
		<h1>“{data.q}”</h1>
		<p>
			{#await data.results}
				Searching the collection…
			{:then results}
				{results.total.toLocaleString('en-US')} matching works
			{:catch}
				&nbsp;
			{/await}
		</p>
	</div>
{:else}
	<h1 class="visually-hidden">Highlighted paintings from The Met</h1>
{/if}

<section class="results">
	{#await data.results}
		<ArtworkGrid loading />
	{:then results}
		{#if results.artworks.length === 0}
			<EmptyState
				title="Nothing on view"
				message="No open-access images match “{data.q}”. Try an artist, a movement or a place."
			>
				<a class="pill glass" href="/">Back to highlights</a>
			</EmptyState>
		{:else}
			<!-- The landing page drifts while idle and never ends; searches scroll normally. -->
			<ArtworkFeed q={data.q} initial={results} landing={!data.q} />
		{/if}
	{:catch}
		<ErrorState message="The Met’s collection is unreachable right now." onretry={invalidateAll} />
	{/await}
</section>

<SearchBar />

<style>
	.intro {
		display: grid;
		gap: var(--space-2);
		margin: var(--space-2) 0 var(--space-6);
	}

	h1 {
		font-size: var(--text-2xl);
	}

	.intro p {
		color: var(--color-muted);
	}
</style>
