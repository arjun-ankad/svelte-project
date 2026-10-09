<script>
	import ArtworkCard from './ArtworkCard.svelte';
	import Skeleton from './Skeleton.svelte';
	import Spinner from './Spinner.svelte';
	import { drift } from '#lib/attachments/drift.js';
	import { nearViewport } from '#lib/attachments/nearViewport.js';

	/**
	 * @type {{
	 *   artworks?: import('#lib/api.js').Artwork[],
	 *   loading?: boolean,
	 *   drifting?: boolean,
	 *   loadingMore?: boolean,
	 *   onneedmore?: () => void
	 * }}
	 */
	let { artworks = [], loading = false, drifting = false, loadingMore = false, onneedmore } = $props();

	// The app renders in the browser only, so the window is available for the first layout.
	let width = $state(window.innerWidth);

	const columnCount = $derived(
		width >= 1600 ? 6 : width >= 1216 ? 5 : width >= 896 ? 4 : width >= 576 ? 3 : 2
	);

	// Relative speeds per column when drifting; every column moves at 1× otherwise.
	const DRIFT_SPEEDS = [1, 1.2, 1.07, 1.28, 1.13, 1.24];
	const speeds = $derived(DRIFT_SPEEDS.slice(0, columnCount).map((speed) => (drifting ? speed : 1)));

	const columns = $derived(distribute(artworks, speeds));

	/**
	 * Deals artworks into columns in order. Each goes to the column that is shortest relative
	 * to its speed, so faster columns get proportionally more (plain left-to-right at equal speeds).
	 * Earlier placements never change as more artworks arrive, so loaded tiles stay put.
	 * @param {import('#lib/api.js').Artwork[]} artworks
	 * @param {number[]} speeds
	 */
	function distribute(artworks, speeds) {
		/** @type {{ artwork: import('#lib/api.js').Artwork, index: number }[][]} */
		const columns = speeds.map(() => []);

		artworks.forEach((artwork, index) => {
			let target = 0;
			for (let c = 1; c < columns.length; c++) {
				if ((columns[c].length + 1) / speeds[c] < (columns[target].length + 1) / speeds[target]) target = c;
			}
			columns[target].push({ artwork, index });
		});

		return columns;
	}

	// Mixed shapes so the loading placeholder already looks like the finished grid.
	const ratios = ['4 / 5', '1 / 1', '3 / 4', '5 / 4', '2 / 3', '4 / 3'];
</script>

<div
	class={['grid', { drifting }]}
	bind:clientWidth={width}
	aria-busy={loading}
	{@attach drifting && !loading && drift({ speeds })}
>
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
				<!-- Keyed by position: the list only grows, and an endless feed can repeat artworks. -->
				{#each items as { artwork, index } (index)}
					<ArtworkCard {artwork} eager={index < 12} />
				{/each}

				{#if onneedmore}
					<!-- Asks for more as this column's end nears; shows a spinner if it's reached first. -->
					<div class="end" {@attach nearViewport(onneedmore, [artworks.length, loadingMore])}>
						{#if loadingMore}
							<Spinner />
						{/if}
					</div>
				{/if}
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

	.drifting .column {
		will-change: transform;
	}

	.end {
		min-height: 1px;
	}
</style>
