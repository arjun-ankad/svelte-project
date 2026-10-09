import { error } from '@sveltejs/kit';
import { getArtwork } from '#lib/api.js';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	if (!/^\d+$/.test(params.id)) error(404, 'We couldn’t find that artwork.');

	return { artwork: await getArtwork(fetch, params.id) };
}
