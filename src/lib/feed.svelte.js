import { PAGE_SIZE, getFeedArtwork, getFeedIds } from './api.js';

/** @typedef {import('./api.js').Artwork} Artwork */

// Objects fetched at once. When the Met is slow this keeps tiles arriving steadily; when it is
// fast it stays under its burst limit (blocking starts around 50 requests a second).
const CONCURRENCY = 10;

/**
 * An endless list of artworks for a search, or for the landing wall when `q` is empty.
 *
 * The Met's search returns only ids, and each artwork is a separate (sometimes very slow) request.
 * So artworks are added one by one as they arrive, ten requests at a time: a slow or failing
 * request only holds up its own slot, never the page. Failures retry quietly with backoff.
 */
export class Feed {
	/** @type {Artwork[]} */
	artworks = $state([]);

	/** Number of matching works, once known. */
	total = $state(/** @type {number | null} */ (null));

	/** True while fetching more. */
	loading = $state(false);

	/** True once every match has been shown. The landing wall never finishes. */
	done = $state(false);

	#fetch;
	#q;
	#cursor = 0;
	#stopped = false;

	/**
	 * @param {typeof fetch} fetch
	 * @param {string} q
	 */
	constructor(fetch, q) {
		this.#fetch = fetch;
		this.#q = q;
		this.more();
	}

	/** Adds roughly another page of artworks, unless already doing so. */
	async more() {
		if (this.loading || this.done || this.#stopped) return;
		this.loading = true;

		const target = this.artworks.length + PAGE_SIZE;

		while (!this.#stopped && !this.done && this.artworks.length < target) {
			const page = await this.#retry(() => getFeedIds(this.#fetch, this.#q, this.#cursor));
			if (!page) break;

			this.total = page.total;
			await this.#fill(page.ids);
			this.#cursor += page.ids.length;

			if (this.#cursor >= page.length) {
				// Searches end; the landing wall starts over (everything is cached by then).
				if (this.#q || page.length === 0) this.done = true;
				else this.#cursor = 0;
			}
		}

		this.loading = false;
	}

	/** Stops all fetching, e.g. when the page is left. */
	stop() {
		this.#stopped = true;
	}

	/**
	 * Fetches the given ids with a small pool of workers, adding each artwork as it arrives.
	 * @param {(number | null)[]} ids `null` entries are positions to skip
	 */
	async #fill(ids) {
		const queue = ids.filter((id) => id !== null);

		const worker = async () => {
			while (queue.length > 0 && !this.#stopped) {
				const id = /** @type {number} */ (queue.shift());
				const artwork = await this.#retry(() =>
					getFeedArtwork(this.#fetch, id, { paintingsOnly: !this.#q })
				);
				if (artwork && !this.#stopped) this.artworks.push(artwork);
			}
		};

		await Promise.all(Array.from({ length: CONCURRENCY }, worker));
	}

	/**
	 * Calls `fn` until it succeeds, waiting longer after each failure (1s, 2s, 4s … up to 15s).
	 * Resolves to `undefined` if the feed is stopped first.
	 * @template T
	 * @param {() => Promise<T>} fn
	 * @returns {Promise<T | undefined>}
	 */
	async #retry(fn) {
		for (let delay = 1000; !this.#stopped; delay = Math.min(delay * 2, 15_000)) {
			try {
				return await fn();
			} catch {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}
}
