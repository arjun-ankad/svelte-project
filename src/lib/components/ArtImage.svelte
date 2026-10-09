<script>
	/**
	 * `square` crops to a square tile; otherwise the image keeps its natural shape.
	 * @type {{ src: string | null, alt: string, square?: boolean, eager?: boolean }}
	 */
	let { src, alt, square = false, eager = false } = $props();

	let loaded = $state(false);
	let failed = $state(false);

	// Images that finished loading before hydration never fire `onload`.
	/** @param {HTMLImageElement} img */
	function checkComplete(img) {
		if (img.complete && img.naturalWidth > 0) loaded = true;
	}
</script>

<div class={['frame', { square, loaded }]}>
	{#if src && !failed}
		<img
			{src}
			{alt}
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
		background: var(--color-placeholder);
	}

	/* Hold a placeholder shape until a natural-size image arrives. */
	.frame:not(.loaded) {
		aspect-ratio: 4 / 5;
	}

	.frame.square {
		aspect-ratio: 1;
	}

	img {
		width: 100%;
		opacity: 0;
		transform: scale(1.03);
		transition:
			opacity 500ms var(--ease-out),
			transform 700ms var(--ease-out);
	}

	.square img,
	.frame:not(.loaded) img {
		position: absolute;
		inset: 0;
		height: 100%;
		object-fit: cover;
	}

	.loaded img {
		opacity: 1;
		transform: none;
	}

	.missing {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: var(--space-2);
		color: var(--color-muted);
		font-size: var(--text-xs);
		font-weight: 500;
	}
</style>
