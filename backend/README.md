# GetLocalPlumber.com backend

The existing Express 5/Mongoose API uses Atlas database excellenthomeoffers_db. This refactor preserves API contracts, schemas, collection mappings, sessions, CSRF, and frontend workflows. No frontend files or dependencies were changed.

## Architecture and complete source map

Routes attach middleware and controllers. Middleware authenticates, validates and authorizes. Controllers handle HTTP responses; services implement business operations; models define schemas and explicit MongoDB collections.

    src/
      app.js                          Middleware/router composition; createApp factory
      server.js                       Validated environment, connection, listener, shutdown
      config/
        database.js                   Database/collections, DNS, safe provisioning/index checks
        env.js                        Startup environment validation
        session.js                    Persistent session store and cookie configuration
      controllers/
        auth.controller.js            Account/register/login/logout responses
        contact.controller.js         Success only after confirmed Contact persistence
        project.controller.js         Project/import/quote responses
        ticket.controller.js          Existing private standalone ticket responses
      middleware/
        auth.middleware.js            Require server-authenticated session
        csrf.middleware.js            Token issuance, exact-origin and mutation checks
        error.middleware.js           Operational/Zod/JSON/duplicate/generic errors and 404
        project.middleware.js         Load owner-scoped project and embedded quote
        rateLimit.middleware.js       Independent API/auth/contact limiter factories
        validate.middleware.js        Parse bodies through Zod into req.validated
      models/
        PlumbingUser.js               User schema; passwords excluded by default
        PlumbingContact.js            Contact schema, timestamps and trusted source
        PlumbingProject.js            Project, embedded quotes/history, existing indexes
        PlumbingTicket.js             Existing standalone private ticket schema
        index.js                      Stable model compatibility exports
      routes/
        auth.routes.js                /api/auth endpoint wiring
        contact.routes.js             /api/contact endpoint wiring
        project.routes.js             /api/projects and nested quotes endpoint wiring
        ticket.routes.js              /api/call-tickets endpoint wiring
      services/
        auth.service.js               Safe DTOs, uniqueness, hashing and authentication
        contact.service.js            Contact save with server-controlled source
        project.service.js            Ownership queries, CRUD, guest import and quotes
        ticket.service.js             Owner-scoped ticket persistence
      utils/
        AppError.js                   Explicit safe operational HTTP errors
        session.js                    Rotate/save/destroy session lifecycle helpers
      validators/
        auth.validator.js             Login and registration schemas
        contact.validator.js          Contact fields and honeypot schema
        project.validator.js          Planner/import/patch/quote/ticket schemas
        formOptions.js                Server Contact allowlists matching frontend catalogs
        index.js                      Stable validator compatibility exports

Every listed file has working behavior or a deliberate compatibility export. Express 5 already forwards rejected async handlers; an asyncHandler wrapper would be redundant. There is no permissive CORS file: the existing same-origin proxy and csrf.middleware.js enforce the origin policy.

Old inline route files auth.js/contact.js/projects.js were replaced by the routers above. Database implementation moved from src/database.js to src/config/database.js; every code import was updated. Model registration names User/Contact/Project/Ticket and existing model/validator barrel imports remain compatible. app.js still exports User and Project for existing tests/scripts.

## Models and MongoDB safety

- PlumbingUser.js maps User to plumbing_users: name, normalized unique email, password hash, timestamps. Password is select:false; only authentication explicitly selects it. Account responses contain only id/name/email.
- PlumbingContact.js maps Contact to plumbing_contacts: existing six form fields, timestamps and immutable source getlocalplumber.com assigned by the server.
- PlumbingProject.js maps Project to plumbing_projects: owner, clientId, service/state, four planner answers, status, notes, embedded quotes/history, timestamps. Existing owner and unique owner/clientId indexes remain.
- PlumbingTicket.js maps Ticket to plumbing_call_tickets, preserving the private standalone API. Dashboard call tickets remain embedded in projects.
- plumbing_sessions stores the existing server-side sessions and expiry metadata.

No default users, contacts, leads, or plumbing_leads collection is used by app models. Existing legacy records are not migrated or rewritten. Legacy accounts/projects are not silently imported into plumbing collections; migration requires separate approval.

Normal startup disables Mongoose autoCreate/autoIndex. prepareCollections initializes only missing plumbing collections and initial indexes. Existing collections/indexes are untouched. Existing plumbing_users must already have a full unique email index, and plumbing_projects a full unique owner/clientId index. Startup stops safely if required indexes are missing. Review any index maintenance separately; do not bypass this with destructive production changes.

## Existing API contracts

All routes use JSON. Mutations require the HttpOnly session cookie and X-CSRF-Token obtained from GET /api/csrf. Login/registration rotate the session and token; obtain a fresh token afterward. The existing frontend api.js already handles this and credentials.

Authentication:
- GET /api/csrf returns {token}.
- GET /api/auth/me returns {user:{id,name,email}} or {user:null}. The anonymous null response is intentional compatibility behavior.
- POST /api/auth/register accepts {name,email,password}, returns 201 {user} after creating an account/session.
- POST /api/auth/login accepts {email,password}, rotates the session, returns {user}.
- POST /api/auth/logout revokes the server session, clears the cookie, returns 204.

Projects require authentication and resource ownership:
- GET /api/projects lists the current user's projects, newest first.
- POST /api/projects accepts {clientId,service,state,answers}, returns 201. Repeating an owner/clientId does not overwrite an account project.
- POST /api/projects/import accepts planner input plus {status,notes,quotes,createdAt,history}. Explicit guest import is idempotent, bounded, and preserves account records.
- GET /api/projects/:id retrieves the owned project.
- PATCH /api/projects/:id accepts {status?,notes?}, rejects unknown fields, records homeowner history.
- DELETE /api/projects/:id deletes the owned project, returns 204.
- POST /api/projects/:id/quotes accepts {provider,amount,notes?}, adds a quote and sets Quote in.
- PATCH /api/projects/:id/quotes/:quoteId updates editable quote fields.
- DELETE /api/projects/:id/quotes/:quoteId removes that embedded quote.

Quote mutations return the updated project/history. Project middleware loads the owned document before quote validation, preserving the original authorization/error order. Invalid or inaccessible resource IDs return 404.

Other existing endpoints:
- GET/POST /api/call-tickets list/create the current user's private standalone tickets. Creation accepts {service,state,answers} and returns 201.
- POST /api/contact accepts {name,email,phone,state,service,message,website?}, returns 201 only after MongoDB confirms save. No public submission-list or email/provider dispatch was added.

Errors retain {error:string}: validation/malformed JSON 400; missing authentication 401; origin/CSRF 403; inaccessible resources/API 404; duplicates 409; oversized bodies 413; rate limits 429; unexpected errors 500 with a generic message. Only intentional AppError messages are public. Raw driver errors, request bodies, passwords, credentials and tokens are not logged.

## Validation and security

Registration retains name 2–80 characters, password 12–128 characters, and rejects passwords beyond bcrypt's 72 UTF-8 byte limit instead of truncating them. Email is trimmed/lowercased; a unique database index handles racing duplicates. Bcrypt cost remains 12.

All six visible Contact fields are required; website is the existing optional empty honeypot. Message is 10–4000 characters; phone is 7–25 phone characters with at least seven digits. State/service must match the actual form options; tests enforce parity with frontend catalogs. Unknown administrative fields are stripped and ownership/source come from the server. Strings remain plain text.

Planner questions/answers, statuses, quotes, progress and guest import are unchanged. Guest data stays in localStorage until explicit import; failed imports retain local data and existing account projects are not overwritten. Telephone clicks never automatically mark a call completed.

Sessions regenerate and save before auth success. glp.sid uses HttpOnly, SameSite=Lax, seven-day lifetime, and Secure in production. Logout revokes the session. Production retains the single trusted proxy hop; deploy HTTPS accordingly. Origin/CSRF protect mutations; API responses are non-cacheable; JSON is limited to 32 KB. API/auth/contact rate limits remain 200/15 minutes, 30/15 minutes, and 5/hour per IP. Use a shared limiter store before a multi-instance deployment.

## Backend-only environment

Keep credentials in Git-ignored backend/.env, never VITE_ variables, frontend code or logs. Existing commands use Node's --env-file-if-exists option.

- MONGODB_URI: Atlas Cluster0 database-user URI naming excellenthomeoffers_db. Percent-encode reserved credential characters. Copy the actual Atlas hostname; .env.example contains placeholders only.
- SESSION_SECRET: stable random value of at least 32 characters; rotation signs sessions out.
- APP_ORIGIN: exact browser origin including hostname/port. Local preview: http://127.0.0.1:5174; production: https://getlocalplumber.com.
- APP_ORIGINS: optional comma-separated additional exact origins. Local development may explicitly include localhost/127.0.0.1 on ports 5173 and 5174. Unknown origins still receive 403 and every mutation still requires a valid CSRF token. In production, remove local HTTP entries and use only explicitly configured HTTPS origins.
- PORT: 4000 matches the unchanged Vite API proxy.
- NODE_ENV: production behind HTTPS, development locally.
- MONGODB_DNS_SERVERS: optional comma-separated resolver IPs for failing Atlas SRV resolution. Only Node process DNS changes; system DNS and TLS checks remain intact.

## Commands

Run from the repository root:

    npm run dev --workspace backend
    npm start --workspace backend
    npm run dev --workspace frontend -- --port 5174
    npm run check:database --workspace backend
    npm test --workspace backend
    npm run build --workspace frontend
    npm run lint --workspace frontend
    npm test --workspace frontend

Use either backend dev (watch) or start, not both on the same port. Production should proxy /api behind the frontend origin with HTTPS. No frontend API changes are required.

check:database is read-only: connect, ping and report collection presence. It never provisions or writes records. Normal backend tests always use disposable local MongoDB, never the environment's Atlas URI.

scripts/preview.mjs is the existing optional loopback-only preview helper, not an alternate backend. It now uses the same database configuration and excellenthomeoffers_db name on local port 27018. It never connects to Atlas or migrates the older local preview database. Use normal start/dev commands for the configured Atlas backend.

Live Atlas persistence tests require explicit approval to create/clean isolated synthetic records:

    npm run verify:atlas --workspace backend -- --write-test-data

The flag is mandatory. The script creates UUID-tagged test identities, cleans only matching test records, and verifies cleanup plus protected contacts/leads counts/index fingerprints. It never drops collections. Sanitized reports in backend/test-results contain no credentials, hashes or tokens.

## Testing and extension

tests/architecture.test.js checks real implementations, resolved imports, absence of cycles, layer boundaries, environment validation and HTTP error/router contracts. Other tests cover real server startup, hashing/uniqueness, sessions/revocation, contact failures, project/quote CRUD, guest import, ownership, and unchanged protected legacy data/indexes. Syntax-check backend source/scripts with node --check <file>.

To add a domain:
1. Define a focused model with an explicit collection mapping. For a genuinely new collection, update database configuration and initial indexes; do not rebuild existing indexes automatically.
2. Define Zod request schemas matching intended fields and editable updates.
3. Implement database/business operations in a service. Scope private lookups by authenticated owner and use AppError for safe intentional failures.
4. Add controller functions consuming validated input and sending established HTTP responses.
5. Add a router attaching authentication, ownership, validation and rate limits in the correct order, then mount it once in app.js.
6. Add isolated API tests for happy paths, validation and cross-user denial. Run the full suite and frontend build. Keep compatibility re-exports only when an existing import path needs them.

See ARCHITECTURE_REFACTOR.md for changed files, verification results and remaining limitations.

## Troubleshooting: port already in use

If MongoDB connects but the API reports EADDRINUSE, another process already owns the configured API port. This is a listener conflict, not a MongoDB authentication error. Stop the previous backend terminal with Ctrl+C, then run only one backend command. Do not run start and dev together. The root npm run dev command already launches the backend, so do not also launch a second backend separately.

For development from the repository root:

    npm run dev --workspace backend

To identify the listener in Windows PowerShell:

    Get-NetTCPConnection -LocalPort 4000 -State Listen | Select-Object LocalPort, OwningProcess

Check the owning process before stopping anything. Prefer Ctrl+C in its original terminal; never stop all Node processes indiscriminately. If intentionally changing PORT, also update the frontend API proxy to match it. The existing project uses API port 4000. EACCES instead indicates a port permission/reservation issue.

## Troubleshooting: 403 Origin rejected

The browser's origin includes scheme, hostname and port. http://localhost:5173 and http://127.0.0.1:5174 are different origins even on the same machine. If the form URL does not match APP_ORIGIN or an explicit APP_ORIGINS entry, the server correctly rejects the mutation before registration or Contact persistence.

Set APP_ORIGIN to the primary frontend URL. If both local preview URLs are needed, configure explicit APP_ORIGINS entries in backend/.env and restart the backend. Do not disable the origin/CSRF middleware or use a wildcard. A fresh submission will request its CSRF token through the existing API client. The React DevTools download notice is informational, not the cause of a 403.
