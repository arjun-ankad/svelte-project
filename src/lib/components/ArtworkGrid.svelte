<script>
	import ArtworkCard from './ArtworkCard.svelte';
	import Skeleton from './Skeleton.svelte';

	/** @type {{ artworks?: import('#lib/api.js').Artwork[], loading?: boolean }} */
	let { artworks = [], loading = false } = $props();

	// Mixed ratios so the loading placeholder already reads as masonry.
	const ratios = ['4 / 5', '1 / 1', '3 / 4', '5 / 4', '2 / 3', '4 / 3'];
</script>

<div class="grid" aria-busy={loading}>
	{#if loading}
		<span class="visually-hidden" role="status">Loading artworks…</span>
		{#each { length: 15 }, i}
			<Skeleton ratio={ratios[i % ratios.length]} />
		{/each}
	{:else}
		{#each artworks as artwork, i (artwork.id)}
			<ArtworkCard {artwork} eager={i < 8} />
		{/each}
	{/if}
</div>

<style>
	.grid {
		columns: 1;
		column-gap: var(--gutter);
	}

	@media (min-width: 30rem) {
		.grid {
			columns: 2;
		}
	}

	@media (min-width: 52rem) {
		.grid {
			columns: 3;
		}
	}

	@media (min-width: 72rem) {
		.grid {
			columns: 4;
		}
	}

	@media (min-width: 96rem) {
		.grid {
			columns: 5;
		}
	}
</style>
