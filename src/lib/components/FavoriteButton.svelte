<script>
	import { favorites } from '#lib/stores/favorites.svelte.js';

	/** @type {{ artwork: import('#lib/api.js').Artwork, labelled?: boolean }} */
	let { artwork, labelled = false } = $props();

	const saved = $derived(favorites.has(artwork.id));
</script>

<button
	type="button"
	class={['favorite', 'glass', { saved, labelled }]}
	aria-pressed={saved}
	aria-label={labelled ? undefined : `Save ${artwork.title} to favorites`}
	onclick={() => favorites.toggle(artwork)}
>
	<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
		<path
			d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linejoin="round"
		/>
	</svg>
	{#if labelled}
		<span>{saved ? 'Saved to favorites' : 'Save to favorites'}</span>
	{/if}
</button>

<style>
	.favorite {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		border-radius: var(--radius-pill);
		color: var(--color-text);
		transition:
			transform var(--duration) var(--ease-out),
			background-color var(--duration) var(--ease-out),
			color var(--duration) var(--ease-out);
	}

	.favorite:hover {
		background: var(--glass-bg-strong);
	}

	.favorite:active {
		transform: scale(0.92);
	}

	.labelled {
		width: auto;
		padding: 0 var(--space-5) 0 var(--space-4);
		height: 2.75rem;
		font-size: var(--text-sm);
		font-weight: 500;
	}

	path {
		fill: transparent;
		transition: fill var(--duration) var(--ease-out);
	}

	.saved {
		color: var(--color-accent);
	}

	.saved path {
		fill: currentColor;
	}
</style>
