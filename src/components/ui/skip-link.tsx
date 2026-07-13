/**
 * Skip-to-content link — the first focusable element on every framed surface.
 * Visually hidden until focused (Tab from page load), then it appears top-left
 * so keyboard and screen-reader users can jump past the nav straight to the
 * page's <main id="main-content">. Colors are hard-set (not scope tokens) so it
 * reads identically on the dark marketing canvas and the light portal canvas.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only rounded-lg font-semibold outline-none focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:shadow-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
    >
      Skip to main content
    </a>
  );
}
