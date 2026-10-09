<script>
	import { getArtworks } from '#lib/api.js';
	import ArtworkGrid from './ArtworkGrid.svelte';

	/**
	 * The first page comes from the route's `load`; later pages are appended here.
	 * @type {{
	 *   q: string,
	 *   initial: { artworks: import('#lib/api.js').Artwork[], next: number | null }
	 * }}
	 */
	let { q, initial } = $props();

	// Writable deriveds: they start from `initial` and reset if it changes, but can be added to.
	let artworks = $derived(initial.artworks);
	let next = $derived(initial.next);

	let loadingMore = $state(false);
	let failed = $state(false);

	async function loadMore() {
		if (next === null) return;

		loadingMore = true;
		failed = false;

		try {
			const more = await getArtworks(fetch, { q, start: next });
			const seen = new Set(artworks.map((artwork) => artwork.id));

			artworks = [...artworks, ...more.artworks.filter((artwork) => !seen.has(artwork.id))];
			next = more.next;
		} catch {
			failed = true;
		} finally {
			loadingMore = false;
		}
	}
</script>

<ArtworkGrid {artworks} />

{#if next !== null}
	<div class="more">
		<button type="button" class="pill glass" onclick={loadMore} disabled={loadingMore}>
			{loadingMore ? 'Loading…' : failed ? 'Couldn’t load more. Try again' : 'Load more'}
		</button>
	</div>
{/if}

<style>
	.more {
		display: flex;
		justify-content: center;
		margin-top: var(--space-6);
	}

	button:disabled {
		cursor: progress;
		opacity: 0.6;
	}
</style>
