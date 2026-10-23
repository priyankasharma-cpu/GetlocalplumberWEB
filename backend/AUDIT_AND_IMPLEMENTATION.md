# Backend audit and implementation — GetLocalPlumber.com

Historical report from the initial Atlas integration. The subsequent architecture refactor moved configuration and split the inline modules. See README.md and ARCHITECTURE_REFACTOR.md for current file paths and verification results.

Verified on 2026-10-23. The existing Express/Mongoose backend was completed rather than replaced. No React, CSS, page structure, navigation, layout, animation, or frontend API code was changed.

## Audit findings before implementation

- Authentication already implemented registration, login, logout and `GET /api/auth/me`, bcrypt cost 12, session regeneration, HttpOnly cookies, CSRF checks, input validation and rate limiting. Required work: normalize whitespace in email, protect password fields by default, cover bcrypt truncation, and use the dedicated users collection.
- Account information already came from MongoDB through `/api/auth/me`. Public account responses contained only id/name/email. There is no profile-editing UI, so no new profile endpoint or visual workflow was added.
- Projects already supported private owner-scoped creation/read/update/delete, embedded quotes, history, progress and idempotent guest import. Guest data uses `glp-projects` localStorage; homeowners explicitly import it after signing in. No automatic migration was added.
- The Contact page already sent `name`, `email`, `phone`, `state`, `service`, `message`, and the optional empty `website` honeypot to `/api/contact`. Its success/reset occurs only after an awaited successful response, so failures retain entered data. Required work: separate collection, trusted source, stronger phone/options validation and JSON rate-limit errors.
- Default Mongoose names previously targeted users/projects/contacts/tickets. This risked touching the unrelated contacts collection. Connection accepted whatever database was in the URI. No backend .env existed at the first audit; the owner subsequently supplied it privately.
- Existing Vite `/api` proxy already targeted port 4000 and included cookies. No frontend integration rewrite was necessary.
- Other browser storage is UI state only: `glp-location`, `glp-view`, and session draft `glp-draft`. No authentication secret is persisted there.
- No email sending, provider dispatch, extra backend TODO workflow, or profile editing was discovered or added.

## Implemented database integration

The live Atlas connection to `excellenthomeoffers_db` was verified. The owner corrected initially rejected database credentials. The machine's default resolver could not resolve Atlas SRV records; the optional process-local `MONGODB_DNS_SERVERS` setting resolved that issue without changing OS DNS or disabling TLS. Backend .env remains Git-ignored and no credentials are included in this report.

Core collections:

- `plumbing_users`: registration and account profiles.
- `plumbing_contacts`: Contact form submissions, timestamps, and server-controlled `source: getlocalplumber.com`.
- `plumbing_projects`: private plans, quotes, progress, notes and history.

Operational collections preserve existing backend capabilities:

- `plumbing_sessions`: persistent server-side sessions with expiry.
- `plumbing_call_tickets`: existing standalone private ticket endpoints. The dashboard continues storing its complete call ticket within its project.

No default users collection or plumbing_leads collection is used. Legacy contacts/leads/users/projects/tickets/sessions records are not migrated or rewritten. Existing accounts or projects in legacy collections are deliberately not silently moved into the new collections; any future migration needs explicit approval.

Startup rejects another database name. Mongoose autoCreate/autoIndex are disabled for normal startup. Only absent plumbing collections receive initial indexes; existing collections and indexes are left unchanged. Existing users/projects collections require the appropriate unique indexes before startup can proceed. No syncIndexes, dropDatabase, collection deletion, deduplication or migration runs against Atlas.

## Security and preserved behavior

- Password hashing remains bcrypt cost 12; registration rejects passwords beyond its 72 UTF-8 byte boundary. Passwords are excluded by default from model queries and never returned in account responses.
- Email is trimmed and lowercased; the unique database index prevents racing duplicate registrations.
- Sessions rotate after registration/login, use HttpOnly/SameSite=Lax cookies, Secure cookies in production, and are destroyed by logout. Expired/replayed logged-out sessions cannot access projects.
- Exact-origin and CSRF validation protect mutations; Vite and production use same-origin API proxying instead of permissive CORS. Production startup requires an HTTPS frontend origin.
- JSON request bodies are limited to 32 KB. Existing rate limits and honeypot remain, with consistent JSON errors. API responses use Cache-Control: no-store. Private driver/connection messages and credentials are not logged.
- Contact fields keep their existing required/optional behavior. State/service are restricted to actual form choices; a regression test keeps backend allowlists aligned with frontend catalogs. Phone requires actual digits. Unknown ownership/status fields are stripped, source is assigned by the server, and strings remain plain text.
- Guest import is explicit, owner-scoped and idempotent. Local valid records remain until all import requests succeed; existing account records are not overwritten. Existing quote/progress/delete operations are preserved. Clicking a phone link does not mark a call complete.

## Existing API endpoints reused

- GET `/api/csrf`.
- POST `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`; GET `/api/auth/me`.
- GET/POST `/api/projects`; POST `/api/projects/import`.
- GET/PATCH/DELETE `/api/projects/:id`.
- POST `/api/projects/:id/quotes`; PATCH/DELETE `/api/projects/:id/quotes/:quoteId`.
- GET/POST `/api/call-tickets` (private).
- POST `/api/contact` (no public submission-list endpoint).

## Files created

- `backend/src/database.js`: exact database, collection map, safe provisioning, optional DNS configuration and sanitized diagnostics.
- `backend/src/validators/formOptions.js`: server allowlists matching the existing Contact selectors.
- `backend/scripts/check-database.mjs`: read-only database diagnostic.
- `backend/scripts/verify-atlas.mjs`: explicit opt-in live persistence verification with UUID-scoped cleanup.
- `backend/tests/database.test.js`: collection, persistence, session, validation and real startup tests.
- `backend/tests/database-config.test.js`: safe index/configuration failure tests.
- `backend/AUDIT_AND_IMPLEMENTATION.md`: this report.
- `backend/test-results/frontend-baseline.json`, `environment-check.json`, `atlas-integration.json`, and `verification-summary.json`: sanitized verification evidence.
- Private `backend/.env` was provided by the owner, not committed. Only non-secret local DNS/origin/port settings were adjusted; credentials remained private.

## Files modified

- `.gitignore`: protects .env variants, while retaining .env.example.
- `backend/.env.example`: Atlas placeholders and local settings.
- `backend/package.json`: diagnostic and opt-in verification commands.
- `backend/README.md`: API, environment, collection and operating instructions.
- `backend/src/app.js`: plumbing session store, safe errors, non-cacheable responses, JSON rate-limit message and closeable store.
- `backend/src/server.js`: verified connection before listening, validated port, safe startup/listen failure handling, graceful session/database shutdown.
- `backend/src/models/index.js`: explicit collection names, default password exclusion, trusted Contact source.
- `backend/src/routes/auth.js`: trimmed credentials, bcrypt byte bound, explicit password query, JSON rate-limit error.
- `backend/src/routes/contact.js`: normalization, allowlists, phone validation, source and JSON rate-limit error.
- `backend/src/validators/index.js`: email trimming.
- `backend/tests/api.test.js`: explicit password selection only for the hash assertion.

The pre-existing uncommitted frontend changes seen at inspection were preserved. All 108 frontend JSX/CSS files matched their initial hashes after this work. No frontend source file was modified.

## Environment and commands

Required backend environment: MONGODB_URI (Cluster0 URI naming excellenthomeoffers_db), SESSION_SECRET (random, at least 32 characters), APP_ORIGIN (exact frontend origin). PORT defaults to 4000. Set NODE_ENV=production behind HTTPS. Optional MONGODB_DNS_SERVERS is documented above and in .env.example. No database secret belongs in VITE_ variables.

From the repository root:

```sh
npm run check:database --workspace backend
npm start --workspace backend
npm run dev --workspace frontend -- --port 5174
npm test --workspace backend
npm run build --workspace frontend
npm run lint --workspace frontend
npm test --workspace frontend
```

Local development API is running on port 4000; preview is http://127.0.0.1:5174/. Existing Vite proxy was verified to return the actual account API response successfully. The private environment previously specified port 5000; it was aligned to 4000 to match that proxy.

For future live persistence checks, only with explicit approval to create and clean isolated test data:

```sh
npm run verify:atlas --workspace backend -- --write-test-data
```

That command requires the flag, creates UUID-tagged synthetic identities, and deletes only matching test users/projects/contacts/sessions. It never drops collections or deletes unrelated records. The normal backend test suite always uses disposable local MongoDB, never an environment/Atlas URI.

## Verified results and limitations

- Atlas read-only connect/ping passed for excellenthomeoffers_db.
- Live Atlas verification passed 17 checks: registration and actual password hash storage; duplicate rejection; account retrieval; valid/invalid login; logout; private project/quote persistence across login; cross-user rejection; Contact validation and actual persistence with source/timestamps.
- Isolated live test records were cleaned up and cleanup was verified. Protected contacts/leads counts and index fingerprints were unchanged across the run. In isolated local tests, protected and legacy document contents and indexes were also compared directly and remained unchanged.
- Backend tests: 23/23 passed, including the real server entry point and Mongo-backed session sharing/revocation. Startup now also runs successfully with the live Atlas connection.
- Frontend build and lint passed; no MongoDB URI/credential was found in frontend source, public assets or built output.
- Frontend tests: 13/14 passed. The pre-existing CSS architecture test reports duplicate .hero margin-top declarations under max-width:767px in Hero.css. The file was not changed because CSS changes were explicitly forbidden.
- Browser security policy blocked local preview inspection. No workaround was attempted; fresh rendered route/desktop/mobile checks and screenshots were therefore not completed. UI source identity is verified by hashes, not a new visual comparison.
- Production hosting, HTTPS proxy/cookie behavior, multi-instance distributed rate limiting, and provider/email delivery were not deployed or claimed verified. No email/dispatch integration was added.
