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
		display: block;
		border-radius: var(--radius-sm);
	}

	.logo img {
		width: 3.25rem;
		height: auto;
	}
</style>
