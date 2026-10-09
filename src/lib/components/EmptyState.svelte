<script>
	/** @type {{ title: string, message: string, children?: import('svelte').Snippet }} */
	let { title, message, children } = $props();
</script>

<section class="empty">
	<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
		<rect x="8" y="10" width="32" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" />
		<path d="M8 32l9-9 7 7 5-5 11 11" fill="none" stroke="currentColor" stroke-width="1.5" />
	</svg>
	<h2>{title}</h2>
	<p>{message}</p>
	{@render children?.()}
</section>

<style>
	.empty {
		display: grid;
		justify-items: center;
		gap: var(--space-3);
		padding: var(--space-8) var(--space-4);
		text-align: center;
		color: var(--color-muted);
	}

	h2 {
		color: var(--color-text);
		font-size: var(--text-xl);
	}

	p {
		max-width: 32ch;
	}
</style>
