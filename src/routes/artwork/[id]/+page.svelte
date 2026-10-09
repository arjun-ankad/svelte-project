<script>
	import { afterNavigate } from '$app/navigation';
	import ArtImage from '#lib/components/ArtImage.svelte';
	import FavoriteButton from '#lib/components/FavoriteButton.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	const artwork = $derived(data.artwork);
	const artist = $derived(artwork.artist_title ?? 'Unknown artist');

	const details = $derived(
		[
			['Artist', artwork.artist_display],
			['Date', artwork.date_display],
			['Medium', artwork.medium_display],
			['Dimensions', artwork.dimensions],
			['Origin', artwork.place_of_origin],
			['Credit', artwork.credit_line]
		].filter(([, value]) => value)
	);

	// Return to the exact list the visitor came from, including their search and page.
	let back = $state({ href: '/', label: 'Top Art' });

	afterNavigate(({ from }) => {
		if (from?.route.id === '/') back = { href: from.url.pathname + from.url.search, label: 'the collection' };
		if (from?.route.id === '/favorites') back = { href: '/favorites', label: 'favorites' };
	});
</script>

<svelte:head>
	<title>{artwork.title} · Art Explorer</title>
</svelte:head>

<div class="page">
	<a class="back" href={back.href}>
		<span aria-hidden="true">←</span> Back to {back.label}
	</a>

	<article class="detail">
		<figure style:view-transition-name="art-{artwork.id}">
			<ArtImage
				imageId={artwork.image_id}
				thumbnail={artwork.thumbnail}
				alt="{artwork.title} by {artist}"
				width={843}
				eager
			/>
		</figure>

		<div class="info">
			<header>
				<p class="eyebrow">{artist}</p>
				<h1>{artwork.title}</h1>
				{#if artwork.date_display}
					<p class="date">{artwork.date_display}</p>
				{/if}
			</header>

			<FavoriteButton {artwork} labelled />

			{#if artwork.description.length}
				<div class="description">
					{#each artwork.description as paragraph, i (i)}
						<p>{paragraph}</p>
					{/each}
				</div>
			{/if}

			<dl>
				{#each details as [term, value] (term)}
					<div>
						<dt>{term}</dt>
						<dd>{value}</dd>
					</div>
				{/each}
			</dl>

			<a class="source" href="https://www.artic.edu/artworks/{artwork.id}" target="_blank" rel="noreferrer">
				View on artic.edu <span aria-hidden="true">↗</span>
			</a>
		</div>
	</article>
</div>

<style>
	.page {
		max-width: 80rem;
		margin: 0 auto;
	}

	.back {
		display: inline-flex;
		gap: var(--space-2);
		margin: var(--space-2) 0 var(--space-5);
		color: var(--color-muted);
		font-size: var(--text-sm);
		font-weight: 500;
		text-decoration: none;
		transition: color var(--duration) var(--ease-out);
	}

	.back:hover {
		color: var(--color-text);
	}

	.detail {
		display: grid;
		gap: var(--space-6);
	}

	figure {
		margin: 0;
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-md);
	}

	.info {
		display: grid;
		align-content: start;
		justify-items: start;
		gap: var(--space-5);
	}

	header {
		display: grid;
		gap: var(--space-2);
	}

	.eyebrow {
		color: var(--color-accent);
		font-size: var(--text-sm);
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	h1 {
		font-size: clamp(1.75rem, 1.3rem + 1.4vw, 2.5rem);
		text-wrap: balance;
	}

	.date {
		color: var(--color-muted);
		font-size: var(--text-lg);
		font-family: var(--font-serif);
	}

	.description {
		display: grid;
		gap: var(--space-3);
		max-width: 62ch;
		line-height: 1.7;
	}

	dl {
		display: grid;
		width: 100%;
		margin: 0;
		border-top: 1px solid var(--color-line);
	}

	dl div {
		display: grid;
		grid-template-columns: 7rem 1fr;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--color-line);
		font-size: var(--text-sm);
	}

	dt {
		color: var(--color-muted);
	}

	dd {
		margin: 0;
		white-space: pre-line;
	}

	.source {
		color: var(--color-accent);
		font-size: var(--text-sm);
		font-weight: 500;
		text-underline-offset: 0.2em;
	}

	@media (min-width: 60rem) {
		.detail {
			grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
			gap: var(--space-8);
			align-items: start;
		}

		figure {
			position: sticky;
			top: var(--space-5);
		}
	}
</style>
