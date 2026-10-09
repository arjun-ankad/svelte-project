<script>
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import { favorites } from '#lib/stores/favorites.svelte.js';

	const collections = [
		{ label: 'Impressionism', q: 'impressionism' },
		{ label: 'Egyptian art', q: 'egyptian' },
		{ label: 'Arms & armor', q: 'armor' },
		{ label: 'Japanese prints', q: 'japanese print' }
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
		/* Rotate each line around its own centre, so both meet exactly in the middle. */
		transform-box: fill-box;
		transform-origin: center;
		transition: transform var(--duration) var(--ease-out);
	}

	/* The lines sit 4 units above and below centre; move each to the centre, then rotate into an ×. */
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
		gap: 2px;
		width: min(20rem, calc(100vw - 2 * var(--gutter)));
		padding: var(--space-4);
		border-radius: var(--radius-md);
		background: var(--glass-bg-strong);
	}

	/* Plain text links; a soft dark rounded highlight appears on hover. */
	a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-sm);
		font-size: var(--text-base);
		font-weight: 500;
		letter-spacing: -0.01em;
		text-decoration: none;
		transition: background-color var(--duration) var(--ease-out);
	}

	a:hover,
	a:focus-visible {
		background: rgb(28 27 25 / 0.07);
	}

	a[aria-current='page'] {
		background: rgb(28 27 25 / 0.04);
		font-weight: 600;
	}

	.count {
		color: var(--color-muted);
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
	}

	.label {
		margin: var(--space-4) var(--space-4) var(--space-1);
		color: var(--color-muted);
		font-size: var(--text-xs);
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
