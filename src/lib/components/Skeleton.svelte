<script>
	/** @type {{ ratio?: string }} */
	let { ratio = '4 / 5' } = $props();
</script>

<div class="tile" style:aspect-ratio={ratio} aria-hidden="true"></div>

<style>
	.tile {
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
