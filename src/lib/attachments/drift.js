const INPUT_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'];

/**
 * Makes a grid's columns move at different speeds, and slowly scrolls the page while the
 * visitor is idle. Any wheel, touch, click or key press hands control back immediately;
 * drifting resumes after `idle` ms without input. Disabled for reduced-motion users.
 *
 * Each column `c` appears scrolled by `position × speeds[c]`. The window itself is scrolled
 * in whole pixels (browsers round it), and the leftover fraction is applied as a GPU transform,
 * so slow drifting stays perfectly smooth instead of stepping a pixel at a time.
 *
 * Usage: `<div {@attach drift({ speeds: [1, 1.2, 1.1] })}>` where the children are the columns.
 * @param {{ speeds: number[], speed?: number, idle?: number }} options
 *   `speed` in px per second, `idle` in ms
 * @returns {import('svelte/attachments').Attachment<HTMLElement>}
 */
export function drift({ speeds, speed = 18, idle = 3000 }) {
	return (grid) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const columns = /** @type {HTMLCollectionOf<HTMLElement>} */ (grid.children);
		let position = window.scrollY;
		let lastInput = performance.now();
		let lastFrame = lastInput;
		let drifting = false;
		let frame = requestAnimationFrame(tick);

		function onInput() {
			lastInput = performance.now();
			drifting = false;
		}

		/** @param {number} now */
		function tick(now) {
			// Clamped, so returning to a background tab doesn't jump the page.
			const elapsed = Math.min(now - lastFrame, 100);
			lastFrame = now;

			if (!drifting && now - lastInput > idle) drifting = true;

			if (drifting) {
				// Resync if the browser moved the page itself (e.g. scroll anchoring as images load).
				if (Math.abs(position - window.scrollY) >= 1) position = window.scrollY;

				const bottom = document.documentElement.scrollHeight - window.innerHeight;
				position = Math.min(position + (speed * elapsed) / 1000, bottom);
				if (Math.floor(position) !== Math.floor(window.scrollY)) window.scrollTo(0, Math.floor(position));
			} else {
				position = window.scrollY;
			}

			// Each column is offset from the page by how much further it has travelled.
			for (let i = 0; i < columns.length; i++) {
				const offset = position * (speeds[i] ?? 1) - window.scrollY;
				columns[i].style.transform = `translate3d(0, ${-offset}px, 0)`;
			}

			frame = requestAnimationFrame(tick);
		}

		for (const type of INPUT_EVENTS) window.addEventListener(type, onInput, { passive: true });

		return () => {
			cancelAnimationFrame(frame);
			for (const type of INPUT_EVENTS) window.removeEventListener(type, onInput);
			for (const column of columns) column.style.transform = '';
		};
	};
}
