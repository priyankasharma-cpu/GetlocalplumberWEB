# Editing GetLocalPlumber.com

Run commands from `E:/piyasharmawebwork/GetLocalPlumbers`. React stays in `frontend/`; API and database code stay in `backend/`.

## 1. Header
Edit `frontend/src/components/layout/Header.jsx` for the primary links, dropdown, account action, and tablet menu. `Footer.jsx` and `MobileNav.jsx` in that folder contain the other navigation. `frontend/src/components/Layout.jsx` only re-exports them for existing imports.

## 2. Logo
Edit `frontend/src/components/layout/Brand.jsx`. The existing vector icon and wordmark are retained. Change `--logo-width` in `frontend/src/styles/variables.css`: 195px mobile, 240px larger screens. Proportional icon/text sizing is in `typography.css`; no bitmap is stretched.

## 3. Navbar font
Change `--navbar-font-size` in `frontend/src/styles/variables.css`, currently exactly **15px**. `typography.css` applies it to all primary links. Full navigation appears at 1440px; tablets and smaller laptops use the menu button to avoid crowding.

## 4. Homepage hero text
Edit `frontend/src/components/home/Hero.jsx`. Mobile and desktop headings preserve their respective layout. `frontend/src/pages/Home.jsx` assembles the other sections, with comments identifying services, benefits, process, emergency help, locations, projects, and FAQs.

## 5. Hero image
Replace `frontend/src/images/hero/plumber.webp`. Update alt text in `frontend/src/components/home/Hero.jsx` if the subject changes. Use optimized images you have permission to use.

## 6. Services page
Edit `frontend/src/pages/Services.jsx` for search, Grid/List switching, and detail sections. Shared cards are in `frontend/src/components/services/ServiceCard.jsx`. Grid rules in `frontend/src/styles/typography.css` give two columns below 1024px and four at 1024px and above. List view uses separate `.services-list` styles. View preference remains saved in localStorage.

## 7. Add or edit a service
Edit `frontend/src/data/services.json`. This is the single content source shared by the app, build scripts, and tests. `frontend/src/data/plumbingServices.js` combines those records with images; `services.js` preserves existing imports.

Copy an existing record and assign a unique stable `id` and `slug`. Edit `title`, `category`, `short`, `description`, `benefits`, `related` (valid service IDs), `faqs` (`q`/`a`), `seoTitle`, `seoDescription`, and `cta`. Leave `cost` null without supported pricing. Keep existing IDs/slugs stable because projects and public URLs refer to them. Add three images and rebuild to generate route shells and sitemap. Update manually selected homepage services and service-count wording as needed. Tests currently expect 24 services; intentionally update expectations when expanding the catalog. Review backend service validation before enabling a new service in saved projects.

## 8. Service card images
Replace `frontend/src/images/services/<service-slug>/main.webp`, for example `frontend/src/images/services/drain-cleaning/main.webp`. All 24 existing folders already contain three images. `frontend/src/data/serviceImages.js` centrally maps named `main`, `detail1`, and `detail2` slots using Vite's `import.meta.glob`. Only real files become imported URLs. No JSX changes are needed when retaining filenames. Restart Vite after adding files and rebuild production output.

## 9. Collage images
Replace `detail-1.webp` and `detail-2.webp` in the same folder. `main.webp` is the first collage image. Layout is in `frontend/src/components/services/ServiceCollage.jsx`. `ServiceImage` in `frontend/src/components/UI.jsx` displays a safe illustration when a mapped asset is missing. Update illustrative alt text if using actual company photographs. Image provenance is in `frontend/src/images/generated-assets.json`.

## 10. Colors
Edit `frontend/src/styles/variables.css`: primary navy, secondary blue, accent orange, light blue, background, white, dark text, muted text, and border tokens. Existing navy/blue aliases point to the same tokens. The established theme is retained.

## 11. Typography and spacing
Use `frontend/src/styles/variables.css` for body, supporting/small text, buttons, card titles/descriptions, hero/section headings, logo width, container width, header height, section spacing, and card gaps. `typography.css` applies shared sizing; `global.css` contains only reset and accessibility defaults. Component styles are now colocated; see CSS_EDITING_GUIDE.md for the complete mapping. `frontend/src/styles.css` imports tokens, layout, then typography. Avoid adding conflicting global rules elsewhere.

## 12. Call Now number
Official branding, domain and telephone settings live in `frontend/src/data/siteConfig.js`. The shared `CallButton` uses the official toll-free number in every placement. Environment variables no longer override this identity. Never put backend secrets in public frontend configuration.

## 13. Four-step planner
Edit the `steps` array in `frontend/src/components/Planner.jsx`. It also owns draft recovery, progress, final ticket, and saving. Preserve the four steps and existing answer positions so saved tickets retain their meaning. Project persistence is supplied through `frontend/src/App.jsx`; preserve its account-ready check. Shared modal helpers are `frontend/src/components/Dialog.jsx` and `ConfirmDialog.jsx`.

## 14. Locations
Edit state information in `frontend/src/data/locations.js`. Cities are in `frontend/src/data/cities.json`, with source metadata in `cities-source.json` and an importer at `frontend/scripts/import-cities.py`. `frontend/src/data/cities.js` loads them lazily. Picker, persistent selection, and greeting are in `frontend/src/context/LocationContext.jsx`. Directory and state pages are in `frontend/src/pages/Locations.jsx`. Geographic names do not imply verified provider coverage.

## 15. My Projects
Edit `frontend/src/pages/Projects.jsx` for cards, progress, notes, quotes, history, and guarded deletion. `frontend/src/api.js` owns HTTP/CSRF handling and guest storage. Keep guest updates and authenticated API refreshes coordinated. Account and contact forms are in `frontend/src/pages/Account.jsx` and `Contact.jsx`.

## 16. Animations
Shared card settings are in `frontend/src/animations/animationVariants.js`. Homepage GSAP entrances and cleanup stay in `frontend/src/pages/Home.jsx`. FAQ/modal transitions stay with those components. App MotionConfig and reduced-motion CSS respect accessibility preferences. Clean up new scroll triggers/listeners.

## 17. Run frontend
Run `npm install` once, then `npm run dev -w frontend`. Open Vite's printed Local URL. It selects another port when 5173 is occupied; the current preview uses 5174. Vite proxies API requests to the local backend.

## 18. Run backend
Configure `backend/.env` from `backend/.env.example` with MongoDB URI, session secret, and local app origin. Start MongoDB, then run `npm run dev -w backend`. The root README documents the existing local database preview. Keep credentials out of frontend files and never test against production data.

## 19. Build and verify
Run `npm run build` for output in `frontend/dist/`. Run `npm run lint -w frontend` and `npm test` for build/frontend/backend checks. Run `node frontend/scripts/qa-server.mjs`, then open `http://127.0.0.1:4173/__qa` for browser checks of overflow, images, two/four grid columns, 15px navigation, header overlap, and mobile navigation. Never deploy this QA server.

## Change inventory
Modified: `frontend/src/App.jsx`, `frontend/src/api.js`, `frontend/src/components/Layout.jsx`, `components/UI.jsx`, `components/Planner.jsx`, `pages/Home.jsx`, `pages/Services.jsx`, `pages/Locations.jsx`, `pages/Projects.jsx`, `pages/Account.jsx`, `pages/Contact.jsx`, `data/services.js`, `data/config.js`, `styles.css`, `frontend/tests/responsive.html`, and `frontend/scripts/qa-server.mjs`.

Created under `frontend/src/`: `components/layout/Brand.jsx`, `Header.jsx`, `Footer.jsx`, `MobileNav.jsx`; `components/home/Hero.jsx`; `components/services/ServiceCard.jsx`, `ServiceCollage.jsx`, `CostEstimator.jsx`; `data/plumbingServices.js`, `serviceImages.js`, `siteConfig.js`; `styles/variables.css`, `global.css`, `typography.css`; and `animations/animationVariants.js`. Also created: `frontend/tests/visual-review.html`, `frontend/test-results/typography-layout.json`, and responsive screenshot PNGs under `frontend/test-results/`. This guide is `frontend/EDITING_GUIDE.md`.

Backend source, database models, APIs, authentication, existing routes, and saved project behavior were retained.


## Verification results

- Frontend production build and lint pass; all 11 backend and 8 frontend tests pass.
- Browser harness: 147/147 cases pass across all 11 original requested widths, including the seven widths in this brief. It checks grid columns, 15px navigation, header overlap, images, overflow, and mobile navigation.
- Services screenshots were captured and inspected at 320, 360, 390, 430, 768, 1024, and 1440px. Files are `frontend/test-results/services-<width>.png`. The screenshot includes browser-zoom padding around the review frame; the frame itself uses the requested CSS width.
- Actual browser checks passed for directory filtering, List View, keyboard homepage search, three-image detail collage, city search, all four planner questions, final ticket, and planner close. Closing revealed a pre-existing exit-animation bug; Planner now receives a stable prop snapshot and restores its captured shell safely. A fresh console recheck after closing shows no new errors.
- Authentication, owner-scoped projects, quote changes, and MongoDB integration passed the existing backend integration suite. No real call was placed: the business number remains unconfigured, and assistance fallbacks remain active. Cross-browser and physical-device audits were not performed.

The subsequent CSS architecture refactor is documented in [CSS_EDITING_GUIDE.md](CSS_EDITING_GUIDE.md). That guide supersedes earlier stylesheet ownership descriptions.
