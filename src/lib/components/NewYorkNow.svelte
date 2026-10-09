<script>
	/** @type {{ weather: Promise<{ temperature: number, label: string } | null> }} */
	let { weather } = $props();

	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/New_York',
		hour: 'numeric',
		minute: '2-digit'
	});

	let now = $state(new Date());
	const time = $derived(formatter.format(now));

	// A ticking clock is a genuine side effect: it starts on mount and must be cleaned up.
	$effect(() => {
		const id = setInterval(() => (now = new Date()), 15_000);
		return () => clearInterval(id);
	});
</script>

<div class="now glass">
	<span class="city">New York</span>
	<time datetime={now.toISOString()}>{time}</time>
	{#await weather then current}
		{#if current}
			<span class="weather">
				<span class="dot" aria-hidden="true"></span>
				{current.temperature}°F <span class="label">{current.label}</span>
			</span>
		{/if}
	{/await}
</div>

<style>
	.now {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		height: 2.75rem;
		padding: 0 var(--space-4);
		border-radius: var(--radius-pill);
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.city {
		color: var(--color-muted);
	}

	time {
		font-weight: 500;
	}

	.weather {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-live);
		box-shadow: 0 0 6px var(--color-live);
	}

	.label {
		color: var(--color-muted);
	}

	@media (max-width: 40rem) {
		.city,
		.label {
			display: none;
		}
	}

	@media (max-width: 24rem) {
		.weather {
			display: none;
		}
	}
</style>
