<script>
	import ArtImage from './ArtImage.svelte';
	import FavoriteButton from './FavoriteButton.svelte';
	import { favorites } from '#lib/stores/favorites.svelte.js';

	/** @type {{ artwork: import('#lib/api.js').Artwork, eager?: boolean }} */
	let { artwork, eager = false } = $props();

	const artist = $derived(artwork.artist_title ?? 'Unknown artist');
</script>

<article class={['card', { saved: favorites.has(artwork.id) }]}>
	<a href="/artwork/{artwork.id}">
		<div class="image" style:view-transition-name="art-{artwork.id}">
			<ArtImage
				imageId={artwork.image_id}
				thumbnail={artwork.thumbnail}
				alt="{artwork.title} by {artist}"
				{eager}
			/>
		</div>
		<div class="caption">
			<h2>{artwork.title}</h2>
			<p>{artist}{artwork.date_display ? `, ${artwork.date_display}` : ''}</p>
		</div>
	</a>

	<div class="favorite">
		<FavoriteButton {artwork} />
	</div>
</article>

<style>
	.card {
		position: relative;
		break-inside: avoid;
		margin-bottom: var(--gutter);
	}

	a {
		display: block;
		text-decoration: none;
		border-radius: var(--radius-md);
	}

	.image {
		border-radius: var(--radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		transition:
			transform 400ms var(--ease-out),
			box-shadow 400ms var(--ease-out);
	}

	a:hover .image,
	a:focus-visible .image {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.caption {
		padding: var(--space-3) var(--space-1) 0;
	}

	h2 {
		font-size: var(--text-base);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	p {
		margin-top: var(--space-1);
		color: var(--color-muted);
		font-size: var(--text-sm);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.favorite {
		position: absolute;
		top: var(--space-3);
		right: var(--space-3);
		opacity: 0;
		transition: opacity var(--duration) var(--ease-out);
	}

	/* Always visible on touch screens, when saved, or when anything in the card has focus. */
	.card:hover .favorite,
	.card:focus-within .favorite,
	.card.saved .favorite {
		opacity: 1;
	}

	@media (hover: none) {
		.favorite {
			opacity: 1;
		}
	}
</style>
