<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import Header from '#lib/components/Header.svelte';
	import { favorites } from '#lib/stores/favorites.svelte.js';

	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();

	onMount(() => favorites.restore());

	// Cross-fade between routes, and morph the artwork image from card to detail page.
	// Skipped within the same route, so typing a search never triggers a transition.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (navigation.from?.route.id === navigation.to?.route.id) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<a class="skip-link" href="#main">Skip to content</a>

<Header weather={data.weather} />

<main id="main">
	{@render children()}
</main>

<footer>
	An unofficial project. Collection data and images courtesy of
	<a href="https://metmuseum.github.io/" target="_blank" rel="noreferrer">The Met Open Access</a>.
</footer>

<style>
	main {
		padding: 0 var(--gutter);
	}

	footer {
		padding: var(--space-7) var(--gutter) calc(var(--space-8) + 3.5rem);
		color: var(--color-muted);
		font-size: var(--text-xs);
		text-align: center;
	}

	.skip-link {
		position: absolute;
		top: var(--space-2);
		left: 50%;
		z-index: 50;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-pill);
		background: var(--color-text);
		color: var(--color-surface);
		text-decoration: none;
		transform: translate(-50%, -200%);
	}

	.skip-link:focus {
		transform: translate(-50%, 0);
	}
</style>
