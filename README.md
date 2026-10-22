# GetLocalPlumber.com

A React/Vite frontend and Express/MongoDB backend for plumbing information, call planning, and homeowner project management.

## Run locally

Requires Node.js 22.12+ (Node 24 was used for verification), npm, and MongoDB.

```powershell
npm install
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Set `MONGODB_URI` to your local or hosted MongoDB connection. Generate a session secret locally with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and put the result in `backend/.env` as `SESSION_SECRET`. Never commit `.env` files.

```powershell
npm run dev
```

Frontend normally runs at `http://127.0.0.1:5173`; backend runs at `http://127.0.0.1:4000`. Set `APP_ORIGIN` to the exact frontend origin printed by Vite, including the port. Vite proxies `/api` to the backend, so browser sessions use same-origin cookies.

Run independently with `npm run dev -w frontend` and `npm run dev -w backend`. For deployment, run `npm run build`, then `npm start -w backend` with production environment variables.

## Current preview

The development preview created during implementation uses `http://127.0.0.1:5174`, API port 4000, and a real loopback MongoDB server on port 27018. Its database files are in the ignored `backend/.local-data/` folder. The preview session secret is generated in memory; restarting the preview API invalidates its sessions. This is a local development arrangement, not a hosted production configuration.

To restart that arrangement on this machine, use separate terminals:

```powershell
# Available only if the optional official MongoDB test runtime was downloaded.
node_modules/.cache/mongo-runtime/mongod.exe --dbpath backend/.local-data --bind_ip 127.0.0.1 --port 27018
node backend/scripts/preview.mjs
npm run dev -w frontend -- --port 5174
```

## Architecture

- `frontend/src/pages/`: homepage, service directory/detail, state directory/detail, account, projects, contact.
- `frontend/src/components/`: layout, shared service cards, FAQs, call planner, accessible confirmation dialog, metadata.
- `frontend/src/data/`: all 24 services, all 50 states plus DC, and telephone/site configuration.
- `frontend/src/images/`: all project imagery. Each service slug has its own replacement folder.
- `frontend/src/api.js`: cookie-based API client, CSRF handling, validated guest storage.
- `frontend/scripts/seo.mjs`: public route HTML shells, sitemap, robots output.
- `backend/src/models/`: users, projects and embedded quotes/history, tickets, contacts.
- `backend/src/validators/`: Zod request schemas.
- `backend/src/routes/`: authentication, projects/quotes/imports, tickets/contact.
- `backend/src/app.js`: security middleware, MongoDB session store, route registration, errors.
- `backend/tests/`: integration and security tests using an isolated real MongoDB instance.

Frontend and backend source are separate; no frontend code contains database credentials or session tokens.

## Implemented workflows

- Homepage with a distinctive navy/cyan identity, service previews, process, location links, FAQs, and CTAs.
- All 24 services in searchable grid/list modes. View preference persists locally. Each service has a dynamic detail page, three-image layout, related services, FAQs, and pricing preparation controls.
- Four-question call planner with automatic advancement, back navigation, preserved answers, session draft recovery, focus trapping/restoration, Escape support, scroll lock, and saved call tickets.
- Guest projects persist in localStorage; accounts use MongoDB. Users explicitly import guest plans, notes, quotes, original creation dates, and history. Repeated imports preserve existing account records.
- Dashboard progress, notes, quote create/edit/delete, decision status, history, and guarded project deletion. Telephone actions never automatically claim a call was completed.
- Backend-connected registration, login, current user, logout, password hashing, session regeneration, HTTP-only cookies, CSRF tokens, origin checks, rate limiting, validation, and owner-scoped queries.
- Searchable 51-location directory and dynamic state information pages. Location context passes into plans started from state-page cards.
- Contact form with backend persistence, validation, honeypot, submission feedback, and stricter rate limits.
- Motion layout/modal transitions and GSAP/ScrollTrigger hero animation, with reduced-motion support and cleanup.
- Public metadata and canonical URLs, runtime Service/Breadcrumb structured data, 79 HTML route shells with initial semantic content, sitemap, and robots rules. These shells provide initial crawlable content; they are not full React SSR.

## Images and telephone

Add your own photos to `frontend/src/images/services/<service-slug>/main.webp`, `detail-1.webp`, and `detail-2.webp`. Vite maps existing files centrally. Replacing `main.webp` updates its card, list thumbnail, and detail image after rebuilding. All 72 image paths currently contain optimized illustrative plumbing photographs; exact generation prompts are recorded in frontend/src/images/generated-assets.json.

The hero illustration is AI-generated, optimized to WebP, and stored in `frontend/src/images/hero/plumber.webp`. The asset prompt and replacement guidance are in `frontend/src/images/README.md`.

Official branding, domain and telephone settings live in `frontend/src/data/siteConfig.js`. The shared `CallButton` uses the official toll-free number in every placement. Environment variables no longer override this identity. Never put backend secrets in public frontend configuration.

## Verification

```powershell
npm test
```

The command builds the frontend, runs 11 backend tests, then 8 frontend tests covering service/location/SEO/estimator, telephone validation, city data, and image mappings. Tests use a disposable database, never the configured production database. The first integration-test run may download MongoDB through `mongodb-memory-server`; use `MONGOMS_SYSTEM_BINARY` for an existing trusted server binary. On Windows, the optional `python backend/tests/fetch-mongo-runtime.py` helper retrieves only `mongod.exe` from the official MongoDB ZIP using validated byte ranges and ZIP CRC checks; the test suite detects that cached binary automatically.

For browser overflow regression checks:

```powershell
npm run build
node frontend/scripts/qa-server.mjs
```

Open `http://127.0.0.1:4173/__qa`. The development-only harness checks nine representative page/view combinations at all 11 requested widths, plus all 24 service detail pages at 390px and 1440px. It verifies a heading renders and no horizontal overflow occurs. It does not replace a full assistive-technology or cross-browser audit. The QA server must not be deployed.

Browser interactions verified during development include planner advancement and draft recovery, completed ticket saving, guest project persistence, quote addition/editing, manual decision status, deletion cancellation, and directory view/filter controls. The responsive harness passed 147 of 147 route/width checks. Backend integration tests cover cross-user access rejection, registration/login/logout, quote mutations, safe imports, contact validation, and private tickets.

## Deployment

1. Provision MongoDB with restricted access and durable backups. Supply the actual `MONGODB_URI`, a strong persistent `SESSION_SECRET`, `APP_ORIGIN`, `PORT`, and `NODE_ENV=production` to the backend.
2. Serve `frontend/dist/` over HTTPS. Preserve generated route directories and redirect unknown client routes to `index.html`. Exclude `/api` from the SPA fallback and reverse-proxy it to Express on the same origin.
3. Production cookies require HTTPS. The backend assumes one trusted reverse-proxy hop; adjust that setting for the actual topology. Do not expose the database directly to the internet.
4. Set the final site origin and phone before building; verify canonical URLs, redirects, and sitemap against that domain.
5. Add licensed service photos and verified business/coverage information. Arrange operational monitoring and review contact requests in the database or integrate a real delivery system.

No hosting deployment or third-party business services have been configured by this implementation.

## Remaining content and configuration

- The 14 supplied reference screenshots informed the redesign. Browser screenshot capture failed, so final screenshot-based visual sign-off remains pending. See frontend/REDESIGN.md.
- A final phone number, business details, production database/hosting, and email delivery credentials have not been supplied. The contact API saves requests; it does not send email or dispatch providers.
- Verified market prices and call durations are unavailable. The estimator intentionally requests a professional quote instead of calculating invented local prices.
- Service photography uses replaceable AI-generated illustrative scenes. City selection uses real Census geographic names; service coverage, local prices, and climate-specific claims are not inferred from those names.
- Account email verification, password recovery, administrator lead inbox, and external call tracking are not included in this initial implementation.

## Phase record

1. Setup: root workspace scripts and separate frontend/backend packages; environment examples and Vite proxy. Dependency installation completed.
2. Design: shared layout/UI, responsive CSS, navy/cyan identity. Browser preview inspected.
3. Homepage: hero, services, benefits, process, safety CTA, locations, FAQs, contact links, footer. Frontend build passed.
4. Services: centralized 24-service dataset, view toggle/search, dynamic detail/collage, related links. Dataset/SEO tests pass.
5. Planner: four steps and ticket saving with guest draft recovery and keyboard support. Browser save/persistence checks pass.
6. Estimator: location/job-size/complexity controls and honest unavailable-price fallback. No fabricated price data.
7. Accounts/projects: real MongoDB sessions, authorization, progress/notes/quotes/history, safe guest imports. Eleven backend tests pass.
8. Locations: 50 states plus DC, filter, dynamic details, plan context. Location count/slug tests pass. Census city search and persistent selection are implemented.
9. Animation: Motion transitions, GSAP hero reveal, reduced-motion support. Production bundle split into vendor chunks.
10. Verification: production build, lint, and 19 automated tests pass; browser workflow and 147 responsive layout checks across 11 widths are provided. Final production/business configuration remains outstanding.


## Frontend redesign review

The navy, blue, orange, and white redesign preserves existing API integrations and routes. Detailed changes, verification, image provenance, and the screenshot-capture limitation are recorded in [frontend/REDESIGN.md](frontend/REDESIGN.md).

For typography, component locations, service content, image replacement, and the latest checks, see [frontend/EDITING_GUIDE.md](frontend/EDITING_GUIDE.md).

For the complete colocated CSS architecture and component-to-stylesheet mapping, see [frontend/CSS_EDITING_GUIDE.md](frontend/CSS_EDITING_GUIDE.md).
#   G e t l o c a l p l u m b e r W E B  
 