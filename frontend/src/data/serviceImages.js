// ==========================================
// SERVICE IMAGE CONFIGURATION
// Replace files in images/services/<slug>/; keep these three filenames.
// Vite resolves only files that actually exist, so missing files use ServiceImage's fallback.
// ==========================================
const assets = import.meta.glob("../images/services/**/*.webp", {
  eager: true, query: "?url", import: "default",
});
export const serviceImages = Object.fromEntries(
  [...new Set(Object.keys(assets).map(path => path.split("/").at(-2)))].map(slug => [slug, {
    main: assets[`../images/services/${slug}/main.webp`],
    detail1: assets[`../images/services/${slug}/detail-1.webp`],
    detail2: assets[`../images/services/${slug}/detail-2.webp`],
  }]),
);
export function imagesForService(slug) {
  const images = serviceImages[slug] || {};
  return [images.main, images.detail1, images.detail2];
}
