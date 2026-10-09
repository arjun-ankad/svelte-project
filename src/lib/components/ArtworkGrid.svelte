<script>
	import ArtworkCard from './ArtworkCard.svelte';
	import Skeleton from './Skeleton.svelte';

	/** @type {{ artworks?: import('#lib/api.js').Artwork[], loading?: boolean }} */
	let { artworks = [], loading = false } = $props();
</script>

<div class="grid" aria-busy={loading}>
	{#if loading}
		<span class="visually-hidden" role="status">Loading artworks…</span>
		{#each { length: 24 }}
			<Skeleton />
		{/each}
	{:else}
		{#each artworks as artwork, i (artwork.id)}
			<ArtworkCard {artwork} eager={i < 12} />
		{/each}
	{/if}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-2);
	}

	@media (min-width: 36rem) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 56rem) {
		.grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (min-width: 76rem) {
		.grid {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	@media (min-width: 100rem) {
		.grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}
</style>
