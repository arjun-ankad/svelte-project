/** @typedef {import('#lib/api.js').Artwork} Artwork */

const STORAGE_KEY = 'art-explorer:met-favorites';

class Favorites {
	/** @type {Artwork[]} */
	items = $state([]);

	count = $derived(this.items.length);

	/** False until `restore()` has read localStorage, so pages can avoid flashing an empty state. */
	ready = $state(false);

	/** @param {number} id */
	has(id) {
		return this.items.some((item) => item.id === id);
	}

	/**
	 * Stores just enough to render a card, so the favorites page needs no API calls.
	 * @param {Artwork} artwork
	 */
	toggle({ id, title, artist, date, image }) {
		if (this.has(id)) {
			this.items = this.items.filter((item) => item.id !== id);
		} else {
			this.items = [{ id, title, artist, date, image }, ...this.items];
		}

		this.#save();
	}

	/** Call once in the browser after hydration, so server and client render the same markup. */
	restore() {
		try {
			this.items = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
		} catch {
			this.items = [];
		}
		this.ready = true;
	}

	#save() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
		} catch {
			// Storage can be unavailable (private mode, quota); favorites still work for this visit.
		}
	}
}

export const favorites = new Favorites();
