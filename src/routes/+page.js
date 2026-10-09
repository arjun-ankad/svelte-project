import { Feed } from '#lib/feed.svelte.js';

/** @type {import('./$types').PageLoad} */
export function load({ fetch, url }) {
	const q = url.searchParams.get('q')?.trim() ?? '';

	// The feed starts fetching straight away and fills in artwork by artwork.
	return { q, feed: new Feed(fetch, q) };
}
