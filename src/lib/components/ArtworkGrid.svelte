<script>
	import ArtworkCard from './ArtworkCard.svelte';
	import Skeleton from './Skeleton.svelte';

	/** @type {{ artworks?: import('#lib/api.js').Artwork[], loading?: boolean }} */
	let { artworks = [], loading = false } = $props();

	// The app renders in the browser only, so the window is available for the first layout.
	let width = $state(window.innerWidth);

	const columnCount = $derived(
		width >= 1600 ? 6 : width >= 1216 ? 5 : width >= 896 ? 4 : width >= 576 ? 3 : 2
	);

	// Deal artworks into columns left to right. Unlike CSS columns, an image finishing
	// loading only moves the tiles below it, never shuffling tiles between columns.
	const columns = $derived(
		Array.from({ length: columnCount }, (_, column) =>
			artworks
				.map((artwork, index) => ({ artwork, index }))
				.filter(({ index }) => index % columnCount === column)
		)
	);

	// Mixed shapes so the loading placeholder already looks like the finished grid.
	const ratios = ['4 / 5', '1 / 1', '3 / 4', '5 / 4', '2 / 3', '4 / 3'];
</script>

<div class="grid" bind:clientWidth={width} aria-busy={loading}>
	{#if loading}
		<span class="visually-hidden" role="status">Loading artworks…</span>
		{#each { length: columnCount }, column}
			<div class="column">
				{#each { length: 4 }, row}
					<Skeleton ratio={ratios[(column + row * 2) % ratios.length]} />
				{/each}
			</div>
		{/each}
	{:else}
		{#each columns as items, column (column)}
			<div class="column">
				{#each items as { artwork, index } (artwork.id)}
					<ArtworkCard {artwork} eager={index < 12} />
				{/each}
			</div>
		{/each}
	{/if}
</div>

<style>
	.grid {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
	}

	.column {
		display: grid;
		flex: 1;
		min-width: 0;
		gap: var(--space-2);
	}
</style>
