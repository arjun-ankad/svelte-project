<script>
	import { onDestroy } from 'svelte';
	import { getArtworks } from '#lib/api.js';
	import ArtworkGrid from './ArtworkGrid.svelte';

	/**
	 * An infinite list: the first page comes from the route's `load`, and more is fetched
	 * as the visitor nears the end. On the landing page it drifts and never ends.
	 * @type {{
	 *   q: string,
	 *   initial: { artworks: import('#lib/api.js').Artwork[], next: number | null },
	 *   landing?: boolean
	 * }}
	 */
	let { q, initial, landing = false } = $props();

	// Writable deriveds: they start from `initial` and reset if it changes, but can be added to.
	let artworks = $derived(initial.artworks);
	let next = $derived(initial.next ?? (landing ? 0 : null));

	let loading = $state(false);
	let destroyed = false;
	onDestroy(() => (destroyed = true));

	/** @param {number} ms */
	const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	async function loadMore() {
		if (loading || next === null) return;
		loading = true;

		// Keep going until something new arrives. Failures retry quietly in the background,
		// backing off up to 15s, while the spinner stays up.
		let delay = 1000;

		while (!destroyed && next !== null) {
			try {
				const more = await getArtworks(fetch, { q, start: next });
				if (destroyed) return;

				artworks = [...artworks, ...more.artworks];
				// The landing page never ends: after the last highlight it starts over.
				next = more.next ?? (landing ? 0 : null);
				delay = 1000;

				if (more.artworks.length > 0) break;
			} catch {
				await wait(delay);
				delay = Math.min(delay * 2, 15_000);
			}
		}

		loading = false;
	}
</script>

<ArtworkGrid
	{artworks}
	drifting={landing}
	loadingMore={loading}
	onneedmore={next === null ? undefined : loadMore}
/>
