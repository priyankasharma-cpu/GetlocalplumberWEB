# API

All routes use JSON. Mutations require a same-origin browser session and `X-CSRF-Token`. Fetch `GET /api/csrf` to obtain `{token}` first; preserve the HTTP-only session cookie. Login and registration regenerate the session, so obtain a fresh token afterward. Authentication tokens are never returned to localStorage.

Errors have `{error: string}`. Validation returns 400, missing authentication 401, invalid origin/CSRF 403, missing or inaccessible private objects 404, conflicts 409, and rate limits 429. Successful deletion/logout returns 204.

## Authentication

- `POST /api/auth/register`: `{name, email, password}`. Name 2–80 characters; password 12–128 characters. Returns 201 `{user:{id,name,email}}`.
- `POST /api/auth/login`: `{email,password}`. Returns `{user}` and regenerates the session.
- `POST /api/auth/logout`: destroys the session and clears its cookie.
- `GET /api/auth/me`: `{user}` or `{user:null}`.

## Projects (authentication required)

- `GET /api/projects`: current user's projects, newest first.
- `POST /api/projects`: `{clientId,service,state,answers}`. `clientId` is a UUID; `answers` contains the four valid planner answers in order. Returns 201 with a planned project. Repeating an owner/clientId pair returns the existing project without overwriting it.
- `GET /api/projects/:id`: owner-scoped project details.
- `PATCH /api/projects/:id`: `{status?,notes?}`. Status is `Planned`, `Called`, `Quote in`, or `Decided`. Notes maximum 4,000 characters. History records homeowner updates.
- `DELETE /api/projects/:id`: removes the current user's project.
- `POST /api/projects/import`: project input plus `{status,notes,quotes,createdAt,history}` from an explicitly approved guest import. Owner comes exclusively from the session. Existing records are preserved. Imported timestamps must be ISO date strings; quote/history arrays are bounded.

Project responses include `_id`, `clientId`, `service`, `state`, `answers`, `status`, `notes`, `quotes`, `history`, `createdAt`, and `updatedAt`. Database owner IDs are used only for authorization; no list endpoint exposes other users' records.

## Quotes (authentication and project ownership required)

- `POST /api/projects/:id/quotes`: `{provider,amount,notes?}`. Amount is a nonnegative finite number. Adds a quote and sets the project to `Quote in`.
- `PATCH /api/projects/:id/quotes/:quoteId`: `{provider,amount,notes?}`. Replaces editable quote fields.
- `DELETE /api/projects/:id/quotes/:quoteId`: removes the embedded quote.

Each quote mutation returns the updated project and adds a history entry. Dollar amounts are user-entered quotes, not published estimates.

## Call tickets (authentication required)

- `POST /api/call-tickets`: `{service,state,answers}`. Creates a private standalone call ticket.
- `GET /api/call-tickets`: current user's standalone tickets. Dashboard plans also contain their complete call ticket in the saved project.

## Contact

`POST /api/contact`: `{name,email,phone,state,service,message,website?}`. `website` is a honeypot and must be empty. Message length 10–4,000 characters; phone 7–25 allowed phone characters. Returns 201 after database persistence. This does not imply email delivery or dispatch.

Limits: 200 API requests per 15 minutes per IP, 30 authentication requests per 15 minutes, and 5 contact submissions per hour. Use a shared rate-limit store if deploying more than one API instance.
