<script>
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import { favorites } from '#lib/stores/favorites.svelte.js';

	const collections = [
		{ label: 'Impressionism', q: 'impressionism' },
		{ label: 'Japanese prints', q: 'japanese woodblock' },
		{ label: 'Sculpture', q: 'sculpture' },
		{ label: 'Photography', q: 'photography' }
	];

	let open = $state(false);

	/** @type {HTMLElement} */
	let root;
	/** @type {HTMLButtonElement} */
	let toggle;

	const q = $derived(page.url.searchParams.get('q'));
	const onHome = $derived(page.url.pathname === '/');

	afterNavigate(() => (open = false));

	/** @param {KeyboardEvent} event */
	function onkeydown(event) {
		if (open && event.key === 'Escape') {
			open = false;
			toggle.focus();
		}
	}

	/** @param {PointerEvent} event */
	function onpointerdown(event) {
		if (open && !root.contains(/** @type {Node} */ (event.target))) open = false;
	}
</script>

<svelte:window {onkeydown} {onpointerdown} />

<div class="menu" bind:this={root}>
	<button
		bind:this={toggle}
		type="button"
		class="toggle glass"
		aria-expanded={open}
		aria-controls="site-menu"
		aria-label={open ? 'Close menu' : 'Open menu'}
		onclick={() => (open = !open)}
	>
		<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" class:open>
			<path class="top" d="M5 8h14" />
			<path class="bottom" d="M5 16h14" />
		</svg>
	</button>

	{#if open}
		<nav
			id="site-menu"
			class="panel glass"
			aria-label="Main"
			transition:fly={{ y: -8, duration: prefersReducedMotion.current ? 0 : 220 }}
		>
			<a href="/" aria-current={onHome && !q ? 'page' : undefined}>Top Art</a>
			<a href="/favorites" aria-current={page.url.pathname === '/favorites' ? 'page' : undefined}>
				Favorites
				<span class="count" aria-label="{favorites.count} saved">{favorites.count}</span>
			</a>

			<p class="label">Collections</p>
			{#each collections as collection (collection.q)}
				<a
					href="/?q={encodeURIComponent(collection.q)}"
					aria-current={onHome && q === collection.q ? 'page' : undefined}
				>
					{collection.label}
				</a>
			{/each}
		</nav>
	{/if}
</div>

<style>
	.menu {
		position: relative;
	}

	.toggle {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		border-radius: var(--radius-pill);
		transition: background-color var(--duration) var(--ease-out);
	}

	.toggle:hover {
		background: var(--glass-bg-strong);
	}

	svg path {
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linecap: round;
		transform-origin: center;
		transition: transform var(--duration) var(--ease-out);
	}

	/* The two lines rotate into an ×. */
	svg.open .top {
		transform: translateY(4px) rotate(45deg);
	}

	svg.open .bottom {
		transform: translateY(-4px) rotate(-45deg);
	}

	.panel {
		position: absolute;
		top: calc(100% + var(--space-3));
		left: 0;
		z-index: 20;
		display: grid;
		gap: var(--space-2);
		width: min(17rem, calc(100vw - 2 * var(--gutter)));
		padding: var(--space-3);
		border-radius: var(--radius-lg);
		background: var(--glass-bg-strong);
	}

	/* Glass pill buttons */
	a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-pill);
		background: rgb(255 255 255 / 0.45);
		border: 1px solid rgb(255 255 255 / 0.8);
		box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.7);
		font-size: var(--text-sm);
		font-weight: 500;
		letter-spacing: -0.005em;
		text-decoration: none;
		transition:
			background-color var(--duration) var(--ease-out),
			transform var(--duration) var(--ease-out);
	}

	a:hover {
		background: rgb(255 255 255 / 0.85);
		transform: translateX(2px);
	}

	a[aria-current='page'] {
		background: var(--color-text);
		border-color: var(--color-text);
		color: var(--color-surface);
	}

	.count {
		min-width: 1.5rem;
		padding: 0 var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--color-accent-soft);
		color: var(--color-accent);
		font-size: var(--text-xs);
		font-weight: 600;
		line-height: 1.5rem;
		text-align: center;
	}

	a[aria-current='page'] .count {
		background: rgb(255 255 255 / 0.18);
		color: inherit;
	}

	.label {
		margin: var(--space-2) var(--space-4) 0;
		color: var(--color-muted);
		font-size: var(--text-xs);
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
