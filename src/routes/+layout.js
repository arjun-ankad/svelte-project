import { getNewYorkWeather } from '#lib/api.js';

// Render in the browser only. The Met's API rate-limits and blocks shared server IPs,
// so every request should come from the visitor's own browser (the API allows CORS).
export const ssr = false;

/** @type {import('./$types').LayoutLoad} */
export function load({ fetch }) {
	// Not awaited: the page renders immediately and the header shows the weather once it arrives.
	return { weather: getNewYorkWeather(fetch) };
}
