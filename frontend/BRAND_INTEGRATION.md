# Official branding and telephone integration

Edit the official site name, domain, formatted phone and raw phone in `frontend/src/data/siteConfig.js`. This single public configuration is used by React telephone actions and the SEO generator. `frontend/src/data/config.js` and `frontend/src/data/phone.js` preserve existing imports. Environment variables no longer override the official identity.

The shared `frontend/src/components/ui/CallButton.jsx` supports `variant`, `compact`, `prominent` and `onAction`. Variants used: header, hero, service-card, service-list, service-detail, footer, mobile-nav, planner and dashboard. Use `onAction` only for UI actions such as closing a modal; a telephone link does not confirm a completed call.

Edit call presentation in `frontend/src/components/ui/CallButton.css`; ringing/ripple keyframes are in `frontend/src/animations/phoneRing.css`. Reduced-motion users receive static icons. Narrow service cards use Call now text with the full official number in their accessible name and destination.

Both grid and list use `frontend/src/components/services/ServiceCard.jsx`, with independent Learn more and telephone anchors. Their layouts remain in ServiceCard.css and ServiceList.css. Services retain four columns from 1024px and two below that breakpoint.

Brand text appears in layout/Brand.jsx and Footer.jsx, homepage copy, services.json, SEO.jsx, index.html, public/robots.txt and scripts/seo.mjs. Build regenerates all public canonical URLs, sitemap and robots output. No existing legal pages or outbound email templates were present to update.

Technical package names, database names, storage keys and the workspace directory keep their existing identifiers for compatibility. Historical files in frontend/test-results/css-refactor retain earlier branding because they are baseline comparison evidence, not live website content.

Verification evidence: frontend/test-results/official-brand-responsive.json records all 147 browser layout/link cases. Tests check the official configuration and built SEO output. Browser screenshot capture is unavailable, so fresh visual screenshots could not be supplied. No telephone call was placed. Production DNS, hosting, and toll-free routing are external to this local code update.
