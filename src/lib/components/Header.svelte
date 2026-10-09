<script>
	import Menu from './Menu.svelte';
	import ChicagoNow from './ChicagoNow.svelte';

	/** @type {{ weather: Promise<{ temperature: number, label: string } | null> }} */
	let { weather } = $props();
</script>

<header>
	<div class="start">
		<Menu />
	</div>

	<a href="/" class="logo" aria-label="Art Explorer, home">
		<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
			<rect x="3" y="3" width="26" height="26" rx="7" fill="var(--color-text)" />
			<path d="M10 23V14a6 6 0 0 1 12 0v9" fill="none" stroke="var(--color-bg)" stroke-width="2" />
			<circle cx="16" cy="14" r="2" fill="var(--color-accent)" />
		</svg>
		<span class="wordmark">Art Explorer</span>
	</a>

	<div class="end">
		<ChicagoNow {weather} />
	</div>
</header>

<style>
	header {
		position: relative;
		z-index: 10;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5) var(--gutter);
	}

	.end {
		justify-self: end;
	}

	.logo {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		text-decoration: none;
		border-radius: var(--radius-sm);
	}

	.wordmark {
		font-family: var(--font-serif);
		font-size: var(--text-lg);
		font-weight: 500;
		letter-spacing: -0.02em;
	}

	@media (max-width: 34rem) {
		.wordmark {
			display: none;
		}
	}
</style>
