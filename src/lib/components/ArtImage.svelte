<script>
	/**
	 * Shows the complete image at its natural shape, fading in once loaded.
	 * @type {{ src: string | null, alt: string, eager?: boolean }}
	 */
	let { src, alt, eager = false } = $props();

	let loaded = $state(false);
	let failed = $state(false);

	// Images that finished loading before the component mounted never fire `onload`.
	/** @param {HTMLImageElement} img */
	function checkComplete(img) {
		if (img.complete && img.naturalWidth > 0) loaded = true;
	}
</script>

<div class={['frame', { loaded }]}>
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

	/* Hold a placeholder shape until the image arrives and sets its own height. */
	.frame:not(.loaded) {
		aspect-ratio: 4 / 5;
	}

	img {
		width: 100%;
		height: auto;
		opacity: 0;
		transform: scale(1.03);
		transition:
			opacity 500ms var(--ease-out),
			transform 700ms var(--ease-out);
	}

	.frame:not(.loaded) img {
		position: absolute;
		inset: 0;
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
