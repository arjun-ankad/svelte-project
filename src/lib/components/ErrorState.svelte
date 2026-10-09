<script>
	/** @type {{ title?: string, message: string, onretry?: () => void }} */
	let { title = 'Something went wrong', message, onretry } = $props();
</script>

<section class="error" role="alert">
	<h2>{title}</h2>
	<p>{message}</p>
	{#if onretry}
		<button type="button" class="pill glass" onclick={onretry}>Try again</button>
	{/if}
</section>

<style>
	.error {
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
		max-width: 36ch;
	}

	button {
		margin-top: var(--space-3);
	}
</style>
