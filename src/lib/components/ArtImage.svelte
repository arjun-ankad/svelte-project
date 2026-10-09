<script>
	import { imageUrl } from '#lib/api.js';

	/**
	 * @type {{
	 *   imageId: string | null,
	 *   alt: string,
	 *   thumbnail?: import('#lib/api.js').Thumbnail,
	 *   width?: number,
	 *   eager?: boolean
	 * }}
	 */
	let { imageId, alt, thumbnail = null, width = 400, eager = false } = $props();

	let loaded = $state(false);
	let failed = $state(false);

	const ratio = $derived(
		thumbnail?.width && thumbnail?.height ? `${thumbnail.width} / ${thumbnail.height}` : '4 / 5'
	);

	// Images that finished loading before hydration never fire `onload`.
	/** @param {HTMLImageElement} img */
	function checkComplete(img) {
		if (img.complete && img.naturalWidth > 0) loaded = true;
	}
</script>

<div
	class="frame"
	style:aspect-ratio={ratio}
	style:background-image={thumbnail?.lqip ? `url(${thumbnail.lqip})` : undefined}
>
	{#if imageId && !failed}
		<img
			src={imageUrl(imageId, width)}
			{alt}
			class:loaded
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			onload={() => (loaded = true)}
			onerror={() => (failed = true)}
			{@attach checkComplete}
		/>
	{:else}
		<div class="missing" role="img" aria-label={alt}>
			<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
				<path
					d="M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linejoin="round"
				/>
			</svg>
			<span>Image unavailable</span>
		</div>
	{/if}
</div>

<style>
	.frame {
		position: relative;
		overflow: hidden;
		background-color: var(--color-placeholder);
		background-size: cover;
		background-position: center;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		filter: blur(8px);
		transform: scale(1.02);
		transition:
			opacity 500ms var(--ease-out),
			filter 600ms var(--ease-out),
			transform 600ms var(--ease-out);
	}

	img.loaded {
		opacity: 1;
		filter: none;
		transform: none;
	}

	/* The blurred LQIP (if any) stays visible behind this label. */
	.missing {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: var(--space-2);
		background: rgb(239 238 234 / 0.35);
		color: var(--color-text);
		font-size: var(--text-xs);
		font-weight: 500;
	}
</style>
