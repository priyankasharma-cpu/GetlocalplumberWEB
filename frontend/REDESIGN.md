# Navy / blue / orange redesign

The existing React routes, Express API, database models, secure sessions, guest storage, account synchronization, and project workflows were retained. No backend source changes were required.

## Reference interpretation

All 14 supplied screenshots were reviewed. The mobile header, greeting/location row, rounded hero/search/CTA hierarchy, and five-item bottom navigation follow the first reference. The palette, professional photography, outlined icons, light-blue feature sections, orange actions, and desktop hierarchy follow FlowRight. The service directory, state directory, project progress cards, pill-style planner answers, and call ticket use the remaining references as layout guidance. Competitor telephone numbers, testimonials, pricing, provider coverage, and license claims were not copied.

## Main changes

- Mobile-first design tokens: navy `#082B4C`, blue `#0077B6`, orange `#F96A13`, light blue `#EAF4FA`, white, dark text.
- Compact mobile header with account icon, local-time greeting, persistent city selector, rounded navy hero, accessible service autocomplete, large orange configured-phone / assistance action, and separate plumber photograph.
- Fixed five-item mobile navigation with active routes, safe-area padding, and a prominent orange center call action. No duplicate floating call button remains.
- Desktop sticky navigation, services mega-menu, location selector, account access, and orange CTA. Tablet navigation adapts independently.
- Homepage services, benefits, process, emergency, geographic discovery, project planning, FAQs, and multi-column footer.
- All 24 service detail routes retain a real three-image collage, cost preparation controls, related services, call planner, and FAQs.
- Reference-style project cards and progress bars, full-width call action, quote dialog, quick decision action, notes, history, and accessible deletion confirmation.
- Service grid/list preference persistence, improved list thumbnails, dynamic state/city information, and consistent form/account/planner styling.
- Motion and GSAP animation respect reduced-motion preferences. City data loads only when requested.

## City data

The selector searches 32,071 geographic place records from the [U.S. Census Bureau Gazetteer](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html). Source metadata is in `src/data/cities-source.json`; the reproducible importer is `scripts/import-cities.py`. These are geographic names, never a claim that a plumber serves that place. Selection updates relevant headings, location links, and call plans, and persists in localStorage.

## Imagery

The existing hero was preserved. Six additional stock-style plumbing scenes were generated with the built-in imagegen tool, optimized to WebP, and mapped to the 24 existing service folders. All 72 expected service image files now exist. The photographs are illustrative, not actual company employees or documented completed projects. Vite deduplicates identical content in the production build.

The generation prompt briefs covered (exact prompts are in `src/images/generated-assets.json`):

1. A navy-sleeved plumber using a drain auger at a residential kitchen sink.
2. A plumber inspecting a tank water heater and copper connections in a tidy utility room.
3. A toilet and a plumber replacing its supply valve in a modern residential bathroom.
4. A chrome faucet and a plumber checking its connection above a ceramic sink.
5. A plumber working on copper/PVC connections inside an open kitchen cabinet.
6. A plumber using inspection-camera equipment and a tablet near residential basement pipes.

Every prompt specified photorealistic editorial lighting, American residential context, horizontal framing, navy/light-blue styling, and no text, logos, graphics, or watermarks. Replacement paths remain `src/images/services/<slug>/main.webp`, `detail-1.webp`, and `detail-2.webp`.

## Checks

- `npm run lint -w frontend`
- `npm test` (production build plus backend and frontend tests)
- `node frontend/scripts/qa-server.mjs`, then open `http://127.0.0.1:4173/__qa` for 147 layout checks: nine page/view combinations at all 11 requested widths, plus every service detail page at 390px and 1440px. The harness verifies rendering, horizontal overflow, image loading, and mobile navigation visibility/item count.
- In-browser interaction checks cover city selection and persistence, keyboard service search, the four unchanged planner questions, draft recovery, saved projects, quotes, and account forms.

The final requested screenshot captures and visual sign-off must be recorded separately. The in-app browser screenshot API failed during this run, including after making the preview visible and trying both viewport and full-page captures. DOM/layout verification is not being presented as successful screenshot-based visual review.

## Configuration

Official branding, domain and telephone settings live in `frontend/src/data/siteConfig.js`. The shared `CallButton` uses the official toll-free number in every placement. Environment variables no longer override this identity. Never put backend secrets in public frontend configuration.

Production hosting, verified market prices, actual company reviews, dispatch, and email delivery remain outside this frontend redesign.

## Recorded results

Production build and ESLint pass. All 11 backend tests and 8 frontend tests pass. The browser harness passed 147/147 layout cases; results are saved in `test-results/redesign-layout.json`. Actual local browser checks passed for city search/selection/clear/persistence, keyboard service search, all four planner steps, saved projects, quote creation/editing, decision status, registration/login/logout, and grid/list persistence. Existing guest projects were preserved. These checks do not replace the pending screenshot-based visual review.

CSS organization was subsequently refactored without a redesign. See CSS_EDITING_GUIDE.md for current ownership and verification.
