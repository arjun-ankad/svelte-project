<script>
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import ErrorState from '#lib/components/ErrorState.svelte';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Not found' : 'Error'} · Art Explorer</title>
</svelte:head>

{#if page.status === 404}
	<EmptyState title="Not on view" message={page.error?.message ?? 'This page doesn’t exist.'}>
		<a class="pill glass" href="/">Back to highlights</a>
	</EmptyState>
{:else}
	<ErrorState message={page.error?.message ?? 'Something went wrong.'} onretry={invalidateAll} />
{/if}
