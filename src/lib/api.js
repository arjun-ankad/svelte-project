import { error } from '@sveltejs/kit';

const API = 'https://api.artic.edu/api/v1';
const IIIF = 'https://www.artic.edu/iiif/2';

export const PAGE_SIZE = 24;

// The search API refuses offsets past 10,000 results.
const MAX_PAGE = Math.floor(10_000 / PAGE_SIZE);

const LIST_FIELDS = 'id,title,artist_title,date_display,image_id,thumbnail';
const DETAIL_FIELDS =
	'id,title,artist_title,artist_display,date_display,medium_display,dimensions,place_of_origin,credit_line,description,image_id,thumbnail';

/**
 * @typedef {{ lqip?: string, width?: number, height?: number } | null} Thumbnail
 *
 * @typedef {{
 *   id: number,
 *   title: string,
 *   artist_title: string | null,
 *   date_display: string | null,
 *   image_id: string | null,
 *   thumbnail: Thumbnail
 * }} Artwork
 *
 * @typedef {{
 *   id: number,
 *   title: string,
 *   artist_title: string | null,
 *   artist_display: string | null,
 *   date_display: string | null,
 *   medium_display: string | null,
 *   dimensions: string | null,
 *   place_of_origin: string | null,
 *   credit_line: string | null,
 *   description: string[],
 *   image_id: string | null,
 *   thumbnail: Thumbnail
 * }} ArtworkDetail
 */

/**
 * IIIF image URL at a given pixel width.
 * @param {string} imageId
 * @param {number} [width]
 */
export function imageUrl(imageId, width = 843) {
	return `${IIIF}/${imageId}/full/${width},/0/default.jpg`;
}

/**
 * Highlighted ("boosted") works by default, or full-text search when `q` is given.
 * @param {typeof fetch} fetch
 * @param {{ q?: string, page?: number }} options
 * @returns {Promise<{ artworks: Artwork[], page: number, totalPages: number, total: number }>}
 */
export async function getArtworks(fetch, { q = '', page = 1 } = {}) {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(PAGE_SIZE),
		fields: LIST_FIELDS
	});

	if (q) {
		// `q` alone ranks well but never excludes anything; the match query filters out non-matches.
		params.set('q', q);
		params.set('query[multi_match][query]', q);
	} else {
		params.set('query[term][is_boosted]', 'true');
	}

	const json = await request(fetch, `${API}/artworks/search?${params}`);

	return {
		artworks: json.data.filter((/** @type {Artwork} */ artwork) => artwork.image_id),
		page: json.pagination.current_page,
		totalPages: Math.min(json.pagination.total_pages, MAX_PAGE),
		total: json.pagination.total
	};
}

/**
 * @param {typeof fetch} fetch
 * @param {string} id
 * @returns {Promise<ArtworkDetail>}
 */
export async function getArtwork(fetch, id) {
	const res = await fetch(`${API}/artworks/${id}?fields=${DETAIL_FIELDS}`);

	if (res.status === 404) error(404, 'We couldn’t find that artwork.');
	if (!res.ok) error(502, 'The museum’s collection is unreachable right now.');

	const { data } = await res.json();
	return { ...data, description: toParagraphs(data.description) };
}

/**
 * Current conditions in Chicago from Open-Meteo. Resolves to `null` on failure,
 * since the weather is decoration and should never break the page.
 * @param {typeof fetch} fetch
 * @returns {Promise<{ temperature: number, label: string } | null>}
 */
export async function getChicagoWeather(fetch) {
	const params = new URLSearchParams({
		latitude: '41.88',
		longitude: '-87.63',
		current: 'temperature_2m,weather_code',
		temperature_unit: 'fahrenheit',
		timezone: 'America/Chicago'
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
	if (!res.ok) throw new Error(`Request failed (${res.status})`);
	return res.json();
}

/**
 * Turns the API's HTML description into plain-text paragraphs,
 * so it can be rendered without `{@html}`.
 * @param {string | null} html
 */
function toParagraphs(html) {
	if (!html) return [];

	return html
		.split(/<\/p>|<br\s*\/?>/i)
		.map((chunk) =>
			chunk
				.replace(/<[^>]*>/g, '')
				.replace(/&nbsp;/g, ' ')
				.replace(/&amp;/g, '&')
				.replace(/&quot;/g, '"')
				.replace(/&#0?39;|&apos;/g, "'")
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.trim()
		)
		.filter(Boolean);
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
