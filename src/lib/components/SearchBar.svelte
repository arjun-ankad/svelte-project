<script>
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import { goto, afterNavigate } from '$app/navigation';

	const DEBOUNCE_MS = 350;

	const initial = page.url.searchParams.get('q') ?? '';

	let query = $state(initial);
	let open = $state(initial !== '');

	/** @type {HTMLInputElement} */
	let input;
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let timer;

	// Keep the input in sync when the URL changes from elsewhere (menu links, back button).
	// Our own `goto` calls are skipped, so a slow response never overwrites newer typing.
	afterNavigate(({ type, to }) => {
		if (type === 'goto' || !to) return;
		query = to.url.searchParams.get('q') ?? '';
		if (query) open = true;
	});

	/** @param {string} value */
	async function search(value) {
		clearTimeout(timer);
		const q = value.trim();
		if (q === (page.url.searchParams.get('q') ?? '')) return;

		// Refining an existing search replaces the history entry; starting one adds an entry.
		await goto(q ? `/?q=${encodeURIComponent(q)}` : '/', {
			replace: page.url.searchParams.has('q'),
			reset: false
		});
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function oninput() {
		clearTimeout(timer);
		timer = setTimeout(() => search(query), DEBOUNCE_MS);
	}

	/** @param {SubmitEvent} event */
	function onsubmit(event) {
		event.preventDefault();
		search(query);
	}

	async function expand() {
		open = true;
		await tick();
		input.focus();
	}

	function close() {
		open = false;
		query = '';
		search('');
	}
</script>

<form
	role="search"
	action="/"
	method="GET"
	class={['search', 'glass', { open }]}
	{onsubmit}
>
	<label for="search-input" class="visually-hidden">Search the collection</label>
	<input
		bind:this={input}
		bind:value={query}
		{oninput}
		onkeydown={(event) => event.key === 'Escape' && close()}
		id="search-input"
		name="q"
		type="search"
		placeholder="Search artists, styles, places…"
		autocomplete="off"
		enterkeyhint="search"
		inert={!open}
	/>

	<button
		type="button"
		class="toggle"
		aria-expanded={open}
		aria-controls="search-input"
		aria-label={open ? 'Clear and close search' : 'Open search'}
		onclick={open ? close : expand}
	>
		<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
			<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
		</svg>
	</button>
</form>

<style>
	.search {
		position: fixed;
		bottom: max(var(--space-5), env(safe-area-inset-bottom));
		left: 50%;
		z-index: 15;
		display: flex;
		align-items: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: var(--radius-pill);
		background: var(--glass-bg-strong);
		transform: translateX(-50%);
		overflow: hidden;
		transition: width 420ms var(--ease-out);
	}

	.search.open {
		width: min(36rem, calc(100vw - 2 * var(--gutter)));
	}

	input {
		flex: 1;
		width: 0;
		min-width: 0;
		height: 100%;
		padding: 0;
		border: 0;
		background: transparent;
		font-size: var(--text-base);
		opacity: 0;
		transition: opacity var(--duration) var(--ease-out);
	}

	.open input {
		padding-left: var(--space-5);
		opacity: 1;
		transition-delay: 120ms;
	}

	input::placeholder {
		color: var(--color-muted);
	}

	input:focus-visible {
		outline: none;
	}

	input::-webkit-search-cancel-button {
		appearance: none;
	}

	.search:focus-within {
		box-shadow:
			var(--shadow-glass),
			0 0 0 2px var(--color-accent-soft),
			0 0 0 1px var(--color-accent);
	}

	.toggle {
		display: grid;
		flex: none;
		place-items: center;
		width: calc(3.5rem - 2px);
		height: calc(3.5rem - 2px);
		padding: 0;
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--color-text);
	}

	.toggle:focus-visible {
		outline: none;
	}

	svg {
		transition: transform 420ms var(--ease-out);
	}

	/* The + turns into an × once the bar is open. */
	.open svg {
		transform: rotate(45deg);
	}
</style>
