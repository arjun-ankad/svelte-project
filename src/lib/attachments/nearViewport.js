/**
 * Calls `callback` when the element comes within about a screen and a half of the viewport.
 *
 * `version` isn't used directly: passing something that changes after each load (like a list's
 * length) re-creates the observer, which reports straight away if the element is still near.
 * Otherwise a load that doesn't push the element out of range would never trigger another.
 * @param {() => void} callback
 * @param {unknown} [version]
 * @returns {import('svelte/attachments').Attachment}
 */
export function nearViewport(callback, version) {
	return (node) => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) callback();
			},
			{ rootMargin: '0px 0px 150% 0px' }
		);

		observer.observe(node);
		return () => observer.disconnect();
	};
}
