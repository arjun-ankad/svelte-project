<script>
	import ArtworkGrid from '#lib/components/ArtworkGrid.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	const feed = $derived(data.feed);

	// Stop a feed's requests once it's replaced (a new search) or the page is left.
	$effect(() => {
		const current = feed;
		return () => current.stop();
	});
</script>

<svelte:head>
	<title>{data.q ? `${data.q} · Art Explorer` : 'Art Explorer'}</title>
</svelte:head>

{#if data.q}
	<div class="intro">
		<h1>“{data.q}”</h1>
		<p>
			{feed.total === null ? 'Searching the collection…' : `${feed.total.toLocaleString('en-US')} matching works`}
		</p>
	</div>
{:else}
	<h1 class="visually-hidden">Highlighted paintings from The Met</h1>
{/if}

{#if feed.artworks.length > 0}
	<!-- The landing page drifts while idle and never ends; searches scroll normally. -->
	<ArtworkGrid
		artworks={feed.artworks}
		drifting={!data.q}
		loadingMore={feed.loading}
		onneedmore={feed.done ? undefined : () => feed.more()}
	/>
{:else if feed.done}
	<EmptyState
		title="Nothing on view"
		message="No open-access images match “{data.q}”. Try an artist, a movement or a place."
	>
		<a class="pill glass" href="/">Back to highlights</a>
	</EmptyState>
{:else}
	<ArtworkGrid loading />
{/if}

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
