import { getChicagoWeather } from '#lib/api.js';

/** @type {import('./$types').LayoutLoad} */
export function load({ fetch }) {
	// Not awaited: the page renders immediately and the header shows the weather once it arrives.
	return { weather: getChicagoWeather(fetch) };
}
