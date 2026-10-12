# PMR Agency — Phase 3 Security & Database Architecture

## Stack
- **Database**: MongoDB (via Motor, async)
- **Auth**: FastAPI custom JWT (access 24h + refresh 7d) with bcrypt password hashing
- **Session delivery**: HTTP-only `Secure; SameSite=None` cookies with `Authorization: Bearer` fallback for API clients
- **Secrets**: Server-side only in `/app/backend/.env` — `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MONGO_URL`. Never read by frontend code.

> Note: The original spec referenced Supabase/Lovable Cloud with Postgres RLS. We implemented an equivalent **application-layer RLS** on FastAPI, which enforces the same guarantees at every endpoint via `require_roles` and explicit `client_id` filters.

## Roles (hardcoded in `server.py:ROLES`)
`super_admin` → `admin` → `sales_manager` / `project_manager` / `marketing_executive` / `finance_manager` / `employee` → `client`

Role assignments live on `users.role`. **Only** `super_admin` or `admin` can change a role (PATCH `/api/users/{id}`). A regular user has no endpoint through which they can modify their own role.

## Collections & indexes
| Collection | Key fields | Indexes |
|---|---|---|
| `users` | id (UUID), email, password_hash, role, status, client_id | `email` unique |
| `leads` | id, stage, email, source, utm_* | `email`, `stage` |
| `lead_activities` | id, lead_id, actor_id | — |
| `clients` | id, email, status, services[] | `email` |
| `projects` | id, client_id, status, progress | `client_id` |
| `tasks` | id, project_id, assignee_id, status | `project_id`, `assignee_id` |
| `blog_posts` | id, slug, status | `slug` unique |
| `portfolio` | id, slug, status | — |
| `testimonials` | id, approved | — |
| `services` | id, slug, active | — |
| `invoices` | id, invoice_number, client_id, status, total | `invoice_number` unique |
| `payments` | id, invoice_id, amount | — |
| `counters` | _id (name), seq | — |
| `login_attempts` | identifier, count, locked_until | `identifier` |
| `password_reset_tokens` | token, user_id, expires_at, used | `expires_at` TTL |

## Access matrix (verified by iteration_1 and iteration_2 tests — 67/68 passed)

| Endpoint | Anon | Client | Employee | Sales | PM | Marketing | Finance | Admin |
|---|---|---|---|---|---|---|---|---|
| `POST /api/leads` (public form) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/public/*` (CMS reads) | ✅ (published only) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/leads` | ❌ 401 | ❌ 403 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PATCH /api/leads/{id}` | ❌ | ❌ | ❌ 403 | ✅ | ❌ | ❌ | ❌ | ✅ |
| `POST /api/leads/{id}/convert` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `GET /api/clients` | ❌ | own only | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/clients/{id}` | ❌ | own only (403 otherwise) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/projects` | ❌ | own client only | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/projects/{id}` | ❌ | own client only (403 otherwise) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/tasks` | ❌ | own client projects only | assigned/created only | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/overview` | ❌ | ❌ 403 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/invoices` | ❌ | own only | ❌ 403 | ✅ | ❌ 403 | ❌ 403 | ✅ | ✅ |
| `POST /api/invoices` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `POST /api/payments` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `GET /api/users` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `POST /api/users` | ❌ | ❌ | ❌ 403 | ❌ | ❌ | ❌ | ❌ | ✅ |
| `DELETE /api/users/{id}` (deactivate) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | super_admin only |
| `GET /api/portal/overview` | ❌ | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |

**Client isolation verified**: Two independent client accounts cannot see each other's projects, tasks, or invoices (iteration_2 explicitly created cross-tenant users and confirmed 403s).

## Password reset flow
1. `POST /api/auth/forgot-password` with `email` → always returns 200 (no email enumeration). If user exists, a token is generated via `secrets.token_urlsafe(32)` stored with 1h expiry and TTL-indexed cleanup.
2. `POST /api/auth/reset-password` with `token` + new `password` (≥8 chars) → updates `password_hash`, marks token `used=true`. Reuse returns 400.

## Brute-force defense (hardened)
Dual-counter strategy keyed on both `{ip}:{email}` **and** `email:{email}`. 5 failed attempts on either key triggers a 15-minute 429 lockout. This defeats both single-IP flood and proxy-rotated distributed attacks (relevant under Kubernetes ingress + horizontal pods). Successful login resets both counters.

## Secrets hygiene (verified)
- `password_hash` is explicitly stripped from every response (`get_current_user`, `/users` projections, `/auth/login` response).
- Frontend bundle grep confirms no `JWT_SECRET`, `ADMIN_PASSWORD`, or `MONGO_URL` strings in `/app/frontend/src/**`.
- Service-role or admin seed credentials are read from `.env` only during startup; never returned via any API.
- Inactive accounts cannot continue using existing JWTs — `get_current_user` now short-circuits with 403 when `status=inactive`.

## Public content filtering
- `GET /api/public/blog` filters `status=published` — drafts never leak.
- `GET /api/public/portfolio` filters `status=published`.
- `GET /api/public/testimonials` filters `approved=true`.
- Admin CMS endpoints (`/api/blog`, `/api/portfolio`, `/api/testimonials`) are gated to `super_admin | admin | marketing_executive`.

## Lead-to-client conversion safety
`POST /api/leads/{id}/convert` is **idempotent**:
1. If lead already has `client_id` → returns existing `{client_id, already_converted: true}`.
2. If a client with the same `email` already exists → links to that client, no duplicate.
3. Otherwise creates one new client and marks lead as `stage=won`.

## Invoice financial safety
- Totals are **computed server-side** from line items (`_compute_invoice_totals`). Client-submitted totals are ignored.
- `invoice_number` uses a MongoDB atomic `findOneAndUpdate($inc)` counter → sequential `PMR-YYYY-NNNNN`, enforced by a `unique` index.
- Payments are **separate documents**; invoice `status` transitions `draft → sent → partially_paid → paid` are derived from the sum of recorded payments, not from client input.

## Audit log hooks (present)
- `lead_activities` collection records stage/field updates (actor_id, actor_name, type, detail, timestamp).
- Future (P1): extend to `role_change_log`, `invoice_change_log`, `file_access_log`.

## Unconfigured integrations (documented, not pretending)
All listed on the Settings page as `not_connected`. No credentials present, no API calls made:

| Integration | Required credential | Server-side only? | Status |
|---|---|---|---|
| Google Analytics 4 | OAuth refresh token | yes | not_connected |
| Google Search Console | OAuth refresh token | yes | not_connected |
| Google Ads | OAuth + developer token | yes | not_connected |
| Meta Ads | long-lived user token | yes | not_connected |
| Google Calendar | OAuth refresh token | yes | not_connected |
| WhatsApp Business | WABA token + phone id | yes | not_connected |
| Resend (email) | `RESEND_API_KEY` | yes | not_connected |
| Stripe | `STRIPE_SECRET_KEY` + webhook secret | yes | not_connected |
| Razorpay | key id + key secret + webhook secret | yes | not_connected |

**Rule**: No integration will be marked `connected` or produce "live" data until (1) credentials are provided via `.env`, (2) the official API/OAuth flow is implemented, (3) webhook signature verification is in place (for payment providers).

## Fixes applied in this phase
1. **CRITICAL** — Fixed password-reset operator-precedence bug (`server.py` line ~445). Previously always returned 400 "Token expired". Now works end-to-end with one-time token enforcement.
2. **HIGH** — Hardened brute-force protection against K8s proxy IP rotation: counters now key on both `{client_ip}:{email}` and `email:{email}`, honoring `X-Forwarded-For`. Lockout fires at the 6th attempt as intended.
3. **MINOR** — `get_current_user` now rejects inactive accounts (prevents a soft-deleted user from continuing to use a pre-deactivation token until expiry).

## Outstanding (P1)
- CSRF double-submit token for cookie-based state-changing requests (Bearer-header clients and SameSite=None cookies both reach the API — a CSRF token adds defense-in-depth).
- Dedicated `audit_logs` collection + admin UI (role changes, invoice edits, payment records, file shares).
- Rate limiting on `POST /api/leads` to prevent public form spam (currently only in-form consent + validation).
