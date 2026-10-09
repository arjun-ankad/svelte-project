<script>
	import ArtworkGrid from '#lib/components/ArtworkGrid.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { favorites } from '#lib/stores/favorites.svelte.js';
</script>

<svelte:head>
	<title>Favorites · Art Explorer</title>
</svelte:head>

<div class="intro">
	<h1>Favorites</h1>
	<p>
		{#if favorites.ready}
			{favorites.count} {favorites.count === 1 ? 'work' : 'works'} saved on this device
		{:else}
			Saved on this device
		{/if}
	</p>
</div>

{#if !favorites.ready}
	<ArtworkGrid loading />
{:else if favorites.count === 0}
	<EmptyState title="No favorites yet" message="Tap the heart on any artwork to keep it here.">
		<a class="pill glass" href="/">Browse highlights</a>
	</EmptyState>
{:else}
	<ArtworkGrid artworks={favorites.items} />
{/if}

<style>
	.intro {
		display: grid;
		gap: var(--space-2);
		margin: var(--space-4) 0 var(--space-6);
	}

	h1 {
		font-size: var(--text-2xl);
	}

	.intro p {
		color: var(--color-muted);
	}
</style>
