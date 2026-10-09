import { getArtworks } from '#lib/api.js';

/** @type {import('./$types').PageLoad} */
export function load({ fetch, url }) {
	const q = url.searchParams.get('q')?.trim() ?? '';

	// Not awaited: the page shows skeletons straight away and fills in when the Met responds.
	return { q, results: getArtworks(fetch, { q }) };
}
