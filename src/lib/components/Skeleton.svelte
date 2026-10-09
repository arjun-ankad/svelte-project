<script>
	/** @type {{ ratio?: string }} */
	let { ratio = '4 / 5' } = $props();
</script>

<div class="card" aria-hidden="true">
	<div class="block image" style:aspect-ratio={ratio}></div>
	<div class="block line"></div>
	<div class="block line short"></div>
</div>

<style>
	.card {
		break-inside: avoid;
		margin-bottom: var(--gutter);
	}

	.block {
		background: linear-gradient(
			100deg,
			var(--color-placeholder) 40%,
			var(--color-surface) 50%,
			var(--color-placeholder) 60%
		);
		background-size: 300% 100%;
		animation: shimmer 1.4s ease-in-out infinite;
		border-radius: var(--radius-sm);
	}

	.image {
		border-radius: var(--radius-md);
	}

	.line {
		width: 75%;
		height: 0.9rem;
		margin: var(--space-3) var(--space-1) 0;
	}

	.short {
		width: 45%;
		margin-top: var(--space-2);
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
