<script>
	import ArtImage from './ArtImage.svelte';
	import FavoriteButton from './FavoriteButton.svelte';
	import { favorites } from '#lib/stores/favorites.svelte.js';

	/** @type {{ artwork: import('#lib/api.js').Artwork, eager?: boolean }} */
	let { artwork, eager = false } = $props();

	const label = $derived(`${artwork.title}, ${artwork.artist ?? 'unknown artist'}`);
</script>

<article class={['card', { saved: favorites.has(artwork.id) }]}>
	<a href="/artwork/{artwork.id}" title={label} style:view-transition-name="art-{artwork.id}">
		<ArtImage src={artwork.image} alt={label} square {eager} />
	</a>

	<div class="favorite">
		<FavoriteButton {artwork} />
	</div>
</article>

<style>
	.card {
		position: relative;
	}

	a {
		display: block;
		border-radius: var(--radius-sm);
		overflow: hidden;
		transition:
			transform 400ms var(--ease-out),
			box-shadow 400ms var(--ease-out);
	}

	a:hover,
	a:focus-visible {
		transform: translateY(-3px);
		box-shadow: var(--shadow-md);
	}

	.favorite {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		opacity: 0;
		transition: opacity var(--duration) var(--ease-out);
	}

	/* Visible on hover, while anything in the card has focus, once saved, and always on touch screens. */
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
