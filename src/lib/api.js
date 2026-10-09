import { error } from '@sveltejs/kit';

const API = 'https://collectionapi.metmuseum.org/public/collection';

export const PAGE_SIZE = 24;

// "Top Art": highlighted works from the European Paintings department.
const TOP_ART_DEPARTMENT = '11';

// Keep each page to at most 2 × 25 requests, 6 at a time, well inside the API's burst limit.
const MAX_BATCHES = 2;
const CONCURRENCY = 6;

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
 * Top Art by default, or full-text search when `q` is given.
 *
 * The Met's search returns only ids, and many matching works have no open-access image.
 * So this walks the results in batches, fetching each batch's objects in parallel, until it has
 * a full page of works with images (or runs out). `next` is the offset to continue from.
 * @param {typeof fetch} fetch
 * @param {{ q?: string, start?: number }} options
 * @returns {Promise<{ artworks: Artwork[], next: number | null, total: number }>}
 */
export async function getArtworks(fetch, { q = '', start = 0 } = {}) {
	/** @type {Artwork[]} */
	const artworks = [];
	let offset = start;
	let total = 0;

	for (let batch = 0; batch < MAX_BATCHES && artworks.length < PAGE_SIZE; batch++) {
		const params = new URLSearchParams({
			q: q || '*',
			hasImages: 'true',
			offset: String(offset),
			limit: String(PAGE_SIZE)
		});

		if (!q) {
			params.set('isHighlight', 'true');
			params.set('departmentId', TOP_ART_DEPARTMENT);
		}

		const result = await cachedRequest(fetch, `${API}/v1.1/search?${params}`);
		const ids = result.objectIDs ?? [];
		total = result.total;

		const objects = await mapWithLimit(ids, CONCURRENCY, (/** @type {number} */ id) => getObject(fetch, id));

		for (const object of objects) {
			offset += 1;
			if (object?.primaryImageSmall) artworks.push(toArtwork(object));
			if (artworks.length === PAGE_SIZE) break;
		}

		if (ids.length < PAGE_SIZE) break;
	}

	return { artworks, next: offset < total ? offset : null, total };
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
 * A single object, or `null` if it's missing or the request fails,
 * so one bad object leaves a gap instead of failing the whole page.
 * @param {typeof fetch} fetch
 * @param {number} id
 */
function getObject(fetch, id) {
	return cachedRequest(fetch, `${API}/v1/objects/${id}`).catch(() => null);
}

/**
 * Like `Promise.all(items.map(fn))`, but with at most `limit` calls in flight,
 * to keep request bursts gentle.
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T) => Promise<R>} fn
 * @returns {Promise<R[]>}
 */
async function mapWithLimit(items, limit, fn) {
	/** @type {R[]} */
	const results = [];
	let next = 0;

	async function worker() {
		while (next < items.length) {
			const index = next++;
			results[index] = await fn(items[index]);
		}
	}

	await Promise.all(Array.from({ length: limit }, worker));
	return results;
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
