import { getArtworks } from '#lib/api.js';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	try {
		return { q, error: null, ...(await getArtworks(fetch, { q, page })) };
	} catch {
		// Returned rather than thrown, so the page can show an inline retry.
		return {
			q,
			error: 'The museum’s collection is unreachable right now.',
			artworks: [],
			page,
			totalPages: 0,
			total: 0
		};
	}
}
