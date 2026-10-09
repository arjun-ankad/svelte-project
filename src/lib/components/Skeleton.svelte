<div class="tile" aria-hidden="true"></div>

<style>
	.tile {
		aspect-ratio: 1;
		border-radius: var(--radius-sm);
		background: linear-gradient(
			100deg,
			var(--color-placeholder) 40%,
			var(--color-surface) 50%,
			var(--color-placeholder) 60%
		);
		background-size: 300% 100%;
		animation: shimmer 1.4s ease-in-out infinite;
	}

	@keyframes shimmer {
		from {
			background-position: 100% 0;
		}
		to {
			background-position: 0 0;
		}
	}
</style>
