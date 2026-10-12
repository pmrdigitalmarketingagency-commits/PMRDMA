# PMR Digital Marketing Agency — Product Requirements

## Original Problem
Build a complete production-oriented digital marketing agency website + internal management application for PMR Digital Marketing Agency (Hyderabad), including a public marketing website that attracts prospects and a private multi-role dashboard for managing sales, clients, projects, tasks, employees, content, invoices, etc. Domain: pmratnam.com.

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn components + Recharts + Sonner (toasts) + Framer Motion. Three app shells: PublicLayout, DashboardLayout, PortalLayout.
- **Backend**: FastAPI + Motor (MongoDB async) + bcrypt + PyJWT. All routes under /api. HTTP-only cookie auth + Bearer header fallback. RBAC via `require_roles` dependency.
- **Database**: MongoDB with string UUIDs, datetimes stored as ISO strings. Indexes on email (unique), slug (unique), invoice_number (unique), etc. TTL index on password_reset_tokens.
- **Auth**: JWT (24h access + 7d refresh), bcrypt password hashing, brute-force lockout (5 fails = 15 min), seeded admin + demo users.

## User Personas
- **Super Admin / Admin** — full workspace control
- **Sales Manager** — leads & CRM, conversion
- **Project Manager** — projects, tasks, delivery
- **Marketing Executive** — content calendar & deliverables
- **Finance Manager** — invoices & payments
- **Employee** — assigned tasks only
- **Client** — isolated portal (own projects/invoices only)

## Implemented (Phase 1 — Feb 2026)

### Public Website
- Homepage with hero, challenges, 9 services, 6-step methodology, portfolio, 7 industries, why PMR, testimonials, insights, final CTA
- About, Services (list + 9 detail pages), Industries, Our Work (filterable), Pricing (3-tier), Insights (list + detail), Contact (full lead form with UTM capture), Privacy, Terms, 404, Unauthorized
- Public API: `POST /api/leads`, `GET /api/public/{services,blog,portfolio,testimonials}`

### Auth
- Login (role-aware redirect), Forgot Password, Reset Password
- HTTP-only cookie session with Bearer fallback

### Admin Dashboard (/app)
- Overview with 7 KPIs + 2 charts (leads by stage, by source) + recent leads
- Leads Kanban (7 stages) with drawer + stage transition + convert-to-client
- Clients directory with modal create
- Projects grid with progress bars + modal create
- Tasks Kanban (5 columns) with status transitions + project progress recalculation
- Team management with role assignment (admin only)
- Content CMS (Blog + Portfolio + Testimonials with draft/publish workflow)
- Invoices with server-side totals (GST), line items, sequential numbering (PMR-YYYY-00001), payment recording
- Settings (agency profile + integration adapter list)

### Client Portal (/portal)
- Overview with active projects + outstanding amount
- Projects (read-only with progress)
- Tasks (read-only)
- Invoices (own only)
- Profile

### Security
- RLS-equivalent enforced server-side on every endpoint via `require_roles` + explicit client/user filtering
- Client role cannot access other clients' data (verified by tests)
- Brute-force lockout, bcrypt, httpOnly cookies, invoice number uniqueness constraint
- 28/28 backend tests passed (100%)

## Credentials (seeded on startup)
See `/app/memory/test_credentials.md`.

## Backlog (P1/P2 for future phases)
- **P1**: Content calendar (unified social/blog/ad calendar), Meetings module, Files module with signed URLs, Reports module with export, Service detail pages FAQs, Case study detail pages (/case-studies/:slug), Email notifications (Resend), Audit logs UI
- **P1**: Integration adapters wired up (GA4, Google Ads, Meta Ads, GSC, Google Calendar)
- **P2**: Payment gateway (Stripe/Razorpay) with webhook verification, Invitation-based onboarding (/invite/accept), Multi-workspace, Advanced search/global cmd+k, PDF export for invoices/proposals, Proposals module with acceptance workflow

## Not Yet Implemented
- Content calendar module (scheduling + approval flow)
- Meetings module
- Files/asset manager (needs object storage integration)
- Reports module (dedicated UI; data available via /api/overview)
- Proposals module (separate from invoices)
- Email notifications (SMTP/Resend integration)
- Invitation accept flow (/invite/accept)
- Service detail: FAQs, timeline, related case studies tabs
