<script>
	import Menu from './Menu.svelte';
	import NewYorkNow from './NewYorkNow.svelte';
	import logo from '#lib/assets/the-met.png';

	/** @type {{ weather: Promise<{ temperature: number, label: string } | null> }} */
	let { weather } = $props();
</script>

<header>
	<div class="start">
		<Menu />
	</div>

	<a href="/" class="logo">
		<img src={logo} alt="The Met, home" width="52" height="52" />
	</a>

	<div class="end">
		<NewYorkNow {weather} />
	</div>
</header>

<style>
	/* Stays pinned while the page scrolls. The fade keeps the controls legible over artwork,
	   and lets clicks through to the art beneath everywhere except the controls themselves. */
	header {
		position: sticky;
		top: 0;
		z-index: 10;
		background: linear-gradient(to bottom, var(--color-bg) 45%, rgb(239 238 234 / 0));
		pointer-events: none;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-5) var(--gutter);
	}

	header > * {
		pointer-events: auto;
	}

	.start {
		justify-self: start;
	}

	.end {
		justify-self: end;
	}

	.logo {
		display: block;
		border-radius: var(--radius-sm);
	}

	.logo img {
		width: 3.25rem;
		height: auto;
	}
</style>
