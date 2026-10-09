const INPUT_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'];

/**
 * Slowly scrolls the page while the visitor is idle. Any wheel, touch, click or key press
 * hands control back immediately; scrolling resumes after `idle` ms without input.
 * Does nothing for visitors who prefer reduced motion.
 *
 * Usage: `<div {@attach autoScroll({ speed: 16 })}>`. Removing the element stops it.
 * @param {{ speed?: number, idle?: number }} [options] speed in px per second, idle in ms
 * @returns {import('svelte/attachments').Attachment}
 */
export function autoScroll({ speed = 16, idle = 3000 } = {}) {
	return () => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let lastInput = performance.now();
		let lastFrame = lastInput;
		let position = window.scrollY;
		let paused = true;
		let frame = requestAnimationFrame(tick);

		function onInput() {
			lastInput = performance.now();
			paused = true;
		}

		/** @param {number} now */
		function tick(now) {
			// Clamped, so returning to a background tab doesn't jump the page.
			const elapsed = Math.min(now - lastFrame, 100);
			lastFrame = now;

			if (paused && now - lastInput > idle) {
				// Pick up from wherever the visitor left the page.
				paused = false;
				position = window.scrollY;
			}

			const bottom = document.documentElement.scrollHeight - window.innerHeight;

			if (!paused && position < bottom) {
				// Track a fractional position: per-frame steps are well under a pixel.
				position = Math.min(bottom, position + (speed * elapsed) / 1000);
				window.scrollTo(0, position);
			}

			frame = requestAnimationFrame(tick);
		}

		for (const type of INPUT_EVENTS) window.addEventListener(type, onInput, { passive: true });

		return () => {
			cancelAnimationFrame(frame);
			for (const type of INPUT_EVENTS) window.removeEventListener(type, onInput);
		};
	};
}
