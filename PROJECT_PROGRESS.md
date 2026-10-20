# Project Progress — Marketing Campaign Management Frontend

## Status — October 20, 2026
The frontend code and production configuration are committed on `main`.
- Campaign execution is modeled as an asynchronous queue acknowledgement; reports refresh while the backend worker sends queued messages.
- Report UI distinguishes queued, sent, failed, skipped, opened and clicked counts.
- The editor documents `{{first_name}}`, `{{last_name}}`, `{{full_name}}`, and `{{email}}` personalization fields.
- Empty-audience campaigns can be reused after adding contacts, and failed/partial campaigns can be edited before retry.
- Vercel uses checked-in SPA configuration with a guarded `build:vercel` script. It rejects missing, HTTP, localhost and reserved example API URLs before producing production assets. No Vercel CLI/plugin was installed or connected in this work.

## Repositories and revisions
- Frontend: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Backend: https://github.com/faizansaiyed123/marketing-campaign-management-backend
- Frontend application/config revision before this progress-file update: `31ed78b4488acdd1bb6426a7c8267d1bda4e43e9`.
- Last known fully successful frontend CI before the backend schema work: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39403014152
- The next frontend CI must run integration against backend main after the migration revision fix; the immediate preceding frontend run failed because the backend Alembic revision identifier exceeded PostgreSQL's 32-character limit.
- That backend issue is fixed by changing the revision to `0005_run_content_snapshot`, and the backend's complete CI run now passes: https://github.com/faizansaiyed123/marketing-campaign-management-backend/actions/runs/39404581186.

## Application functionality
- React + Vite supports registration/login/session/logout, dashboard, audiences/contacts, subscriptions, campaign authoring/scheduling/execution/reports, templates, analytics, responsive navigation and error states.
- Credentialed API calls use the backend HttpOnly session cookie; `VITE_API_URL` is public and embedded at build time. Never put private secrets in `VITE_*` variables.
- The Campaigns report panel polls the durable report API while deliveries are queued and stops after completion or a bounded wait.
- Browser integration covers audience/contact flows, templates, scheduled campaigns, auth/session behavior, empty-campaign reuse, queued-to-completed reports, and display of skipped delivery counts.

## Deployment
1. **Existing Vercel project:** use repository root, production branch `main`, Vite preset, build command `npm run build:vercel`, output `dist`, and Production variable `VITE_API_URL` set to the real public HTTPS API origin.
2. **Optional all-Docker setup:** build through Node and serve with unprivileged Nginx through the shared Docker/Caddy production stack.
- Cookie-authenticated production frontend/API domains must be HTTPS sibling subdomains under the same registrable domain, e.g. `app.yourdomain.com` and `api.yourdomain.com`; the backend's `FRONTEND_ORIGIN` must match exactly.
- The backend README documents the API-only Caddy overlay for an API VPS with Vercel hosting the frontend. Do not expose backend secrets through the frontend build.
- Reserved domains and preview deployments are not substitutes for setting the real production domain. Production frontend/API auth should be tested on the custom domains.

## CI coverage
- `npm ci`, Vercel config validation, rejected URL cases (missing, HTTP localhost and reserved examples), valid HTTPS production build, standard Vite build, Docker/container smoke checks, Compose validation, and Playwright integration against backend main.
- The current code previously had a passing Vercel production build/container job, while the full integration run was blocked before API tests by the backend migration identifier. The migration has been fixed and this documentation push triggers a fresh integration run against it.

## Branch review
Previously compared main, development and chore/startup-docker-support recursively. At the review checkpoint, non-main branches were behind main with zero commits ahead; no unrelated branches were merged wholesale.

## Live deployment status
The repository and CI configuration are maintained and tested, but no live Vercel production URL or backend domain was accessed or independently verified here. Final live verification still requires the existing Vercel project to be pointed at this repo, a real Production `VITE_API_URL`, actual custom domains/DNS, API host secrets, and a controlled-inbox SMTP test.
