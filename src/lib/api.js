import { error } from '@sveltejs/kit';

const API = 'https://collectionapi.metmuseum.org/public/collection';

export const PAGE_SIZE = 24;

/**
 * @typedef {{
 *   id: number,
 *   title: string,
 *   artist: string | null,
 *   date: string | null,
 *   image: string
 * }} Artwork
 *
 * @typedef {Artwork & {
 *   artistBio: string | null,
 *   medium: string | null,
 *   dimensions: string | null,
 *   origin: string | null,
 *   department: string | null,
 *   credit: string | null,
 *   url: string
 * }} ArtworkDetail
 */

/**
 * One list artwork, or `null` if it has no open-access image (or, with `paintingsOnly`,
 * isn't a painting). Throws if the request fails, so the caller can retry.
 * @param {typeof fetch} fetch
 * @param {number} id
 * @param {{ paintingsOnly?: boolean }} [options]
 * @returns {Promise<Artwork | null>}
 */
export async function getFeedArtwork(fetch, id, { paintingsOnly = false } = {}) {
	const object = await getObject(fetch, id);

	if (!object?.primaryImageSmall) return null;
	if (paintingsOnly && !isPainting(object)) return null;
	return toArtwork(object);
}

/**
 * One page of the ordered ids behind a feed, starting at `offset`: a shuffled wall of highlighted
 * paintings for the landing page, or search results with the Met's most notable matches first
 * (highlighted paintings, then other highlights, then everything else). `length` is the size of the
 * whole ordered list; `total` is the number of matching works. Featured works reappear in the
 * general results, so there they come back as `null`: skipped, but still counted as a position.
 * @param {typeof fetch} fetch
 * @param {string} q
 * @param {number} offset
 * @returns {Promise<{ ids: (number | null)[], length: number, total: number }>}
 */
export async function getFeedIds(fetch, q, offset) {
	if (!q) {
		const ids = await getLandingIds(fetch);
		return { ids: ids.slice(offset, offset + PAGE_SIZE), length: ids.length, total: ids.length };
	}

	const featured = await getFeaturedIds(fetch, q);
	const rest = await search(fetch, { q, offset: String(Math.max(0, offset - featured.length)) });
	const length = featured.length + rest.total;

	if (offset < featured.length) {
		return { ids: featured.slice(offset, offset + PAGE_SIZE), length, total: rest.total };
	}

	const seen = new Set(featured);
	const ids = (rest.objectIDs ?? []).map((/** @type {number} */ id) => (seen.has(id) ? null : id));
	return { ids, length, total: rest.total };
}

/** @type {Promise<number[]> | undefined} */
let landingIds;

/**
 * Every highlighted painting in the museum (about 420, in one request), shuffled once per
 * page load: each visit opens on a different selection, while navigating within a visit
 * keeps the same order so the back button returns to the same wall.
 * @param {typeof fetch} fetch
 */
function getLandingIds(fetch) {
	landingIds ??= search(fetch, { q: '*', isHighlight: 'true', medium: 'Paintings', limit: '500' }).then(
		(result) => shuffle(result.objectIDs ?? []),
		(err) => {
			landingIds = undefined; // let the next attempt retry
			throw err;
		}
	);

	return landingIds;
}

/**
 * The `medium=Paintings` filter also matches painted objects (a harpsichord, a screen),
 * so the landing wall double-checks the Met's own classification.
 * @param {any} object
 */
function isPainting(object) {
	return /painting/i.test(object.classification ?? '');
}

/**
 * A shuffled copy of `items` (Fisher–Yates).
 * @template T
 * @param {T[]} items
 */
function shuffle(items) {
	const shuffled = [...items];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled;
}

/**
 * The Met has no popularity data, but curators flag its best-known works as highlights.
 * Returns the highlights matching `q`, paintings first. Each list fits in one request.
 * @param {typeof fetch} fetch
 * @param {string} q
 * @returns {Promise<number[]>}
 */
async function getFeaturedIds(fetch, q) {
	const [paintings, highlights] = await Promise.all([
		search(fetch, { q, isHighlight: 'true', medium: 'Paintings', limit: '500' }),
		search(fetch, { q, isHighlight: 'true', limit: '500' })
	]);

	return [...new Set([...(paintings.objectIDs ?? []), ...(highlights.objectIDs ?? [])])];
}

/**
 * A cached search for works with images. Pages are `PAGE_SIZE` long unless `limit` is given.
 * @param {typeof fetch} fetch
 * @param {Record<string, string>} filters
 */
function search(fetch, filters) {
	const params = new URLSearchParams({ hasImages: 'true', limit: String(PAGE_SIZE), ...filters });
	return cachedRequest(fetch, `${API}/v1.1/search?${params}`);
}

/**
 * @param {typeof fetch} fetch
 * @param {string} id
 * @returns {Promise<ArtworkDetail>}
 */
export async function getArtwork(fetch, id) {
	let object;

	try {
		object = await cachedRequest(fetch, `${API}/v1/objects/${id}`);
	} catch (err) {
		if (/** @type {{ status?: number }} */ (err).status === 404) error(404, 'We couldn’t find that artwork.');
		error(502, 'The Met’s collection is unreachable right now.');
	}

	return {
		...toArtwork(object),
		image: object.primaryImageSmall,
		artistBio: object.artistDisplayBio || null,
		medium: object.medium || null,
		dimensions: object.dimensions || null,
		origin: [object.culture, object.country].filter(Boolean).join(', ') || null,
		department: object.department || null,
		credit: object.creditLine || null,
		url: object.objectURL
	};
}

/**
 * Current conditions at the museum from Open-Meteo. Resolves to `null` on failure,
 * since the weather is decoration and should never break the page.
 * @param {typeof fetch} fetch
 * @returns {Promise<{ temperature: number, label: string } | null>}
 */
export async function getNewYorkWeather(fetch) {
	const params = new URLSearchParams({
		latitude: '40.78',
		longitude: '-73.96',
		current: 'temperature_2m,weather_code',
		temperature_unit: 'fahrenheit',
		timezone: 'America/New_York'
	});

	try {
		const { current } = await request(fetch, `https://api.open-meteo.com/v1/forecast?${params}`);
		return {
			temperature: Math.round(current.temperature_2m),
			label: describeWeather(current.weather_code)
		};
	} catch {
		return null;
	}
}

/**
 * @param {typeof fetch} fetch
 * @param {string} url
 */
async function request(fetch, url) {
	const res = await fetch(url);
	if (!res.ok) throw Object.assign(new Error(`Request failed (${res.status})`), { status: res.status });
	return res.json();
}

/**
 * Met responses by URL. The API blocks bursts of more than ~70 requests, so nothing is
 * fetched twice: going back to a list or opening a detail page from the grid is free.
 * Failed requests are dropped from the cache so they can be retried.
 */
const cache = new Map();

/**
 * @param {typeof fetch} fetch
 * @param {string} url
 * @returns {Promise<any>}
 */
function cachedRequest(fetch, url) {
	if (!cache.has(url)) {
		cache.set(
			url,
			request(fetch, url).catch((err) => {
				cache.delete(url);
				throw err;
			})
		);
	}

	return cache.get(url);
}

/**
 * A single object, or `null` if it no longer exists. Other failures are thrown.
 * @param {typeof fetch} fetch
 * @param {number} id
 */
function getObject(fetch, id) {
	return cachedRequest(fetch, `${API}/v1/objects/${id}`).catch((err) => {
		if (err.status === 404) return null;
		throw err;
	});
}

/**
 * Normalizes a Met object into the shape the components use.
 * Grid tiles use the lighter `mobile-large` rendition of the image.
 * @param {any} object
 * @returns {Artwork}
 */
function toArtwork(object) {
	return {
		id: object.objectID,
		title: object.title || 'Untitled',
		artist: object.artistDisplayName || null,
		date: object.objectDate || null,
		image: object.primaryImageSmall.replace('/web-large/', '/mobile-large/')
	};
}

/**
 * Collapses WMO weather codes into a short label.
 * @param {number} code
 */
function describeWeather(code) {
	if (code === 0) return 'Clear';
	if (code <= 2) return 'Partly cloudy';
	if (code === 3) return 'Overcast';
	if (code <= 48) return 'Fog';
	if (code <= 67 || (code >= 80 && code <= 82)) return 'Rain';
	if (code <= 77 || code === 85 || code === 86) return 'Snow';
	return 'Storms';
}
