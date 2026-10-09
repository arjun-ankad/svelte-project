<div class="spinner" role="status">
	<span class="visually-hidden">Loading more artworks…</span>
</div>

<style>
	.spinner {
		width: 1.75rem;
		height: 1.75rem;
		margin: var(--space-5) auto;
		border: 2px solid var(--color-line);
		border-top-color: var(--color-text);
		border-radius: 50%;
		animation: spin 800ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Keep a slow, visible cue even when other motion is reduced. */
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation-duration: 2s !important;
		}
	}
</style>
