# Project Progress — Marketing Campaign Management Frontend

## Status — October 20, 2026
The frontend application, deployment configuration, and browser integration are committed on main.
- Campaign execution treats HTTP 202 as durable queue acceptance; it does not imply SMTP has sent mail.
- The report panel refreshes delivery status while the backend worker processes queued campaigns.
- The editor documents the backend-supported merge fields {{first_name}}, {{last_name}}, {{full_name}}, and {{email}}.
- When a contact unsubscribes after a campaign is queued but before the worker sends it, the backend skips that email and the report shows Skipped separately from Sent and Failed.
- Empty-audience campaigns can be run again after contacts are added; failed/partial campaigns can be edited before retry.
- The Vercel production build and Docker production build reject missing, non-HTTPS, localhost, or reserved example API URLs with clear errors.
- Current frontend production/container and Playwright integration checks passed. No CLI/connector installation was performed.

## Repositories and verification
- Frontend: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Backend: https://github.com/faizansaiyed123/marketing-campaign-management-backend
- Frontend application/E2E revision verified by CI before this docs update: `6d9c0f459da5ab2978eea48d2f5446fc52e7781a`.
- Passing frontend build + integration CI: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39386307829
- Backend pre-send unsubscribe, skipped-count schema and API revision: 99358fc3b282354ac586f536d458134ad0e30eff
- Passing backend CI: https://github.com/faizansaiyed123/marketing-campaign-management-backend/actions/runs/39386023991
- Frontend CI validates npm lockfile install, Vercel config, API URL guard behavior, HTTPS production build, Docker production build including rejecting unsafe API URLs, Nginx smoke/security headers, and browser tests against backend main.

## Application workflows
- Account registration/login/session/logout, dashboard, audience/contact management and subscription changes, campaign create/edit/schedule/execute/report, reusable owner-scoped templates, analytics, responsive navigation, loading/error/empty states.
- Frontend API client normalizes trailing slashes and sends credentialed requests for the backend's HttpOnly cookie.
- Campaign report polling refreshes queued runs and caps polling instead of making indefinite requests when SMTP/worker is unavailable.
- Delivery summaries show campaign-wide attempts (including retries) with sent, failed, queued, and skipped counts; latest_run_status separately names the most recent run state.
- The E2E suite covers campaign send/retry UI, template privacy/use, sessions, schedule edits, report refresh, skipped-delivery display, and recovery after an initially empty audience.

## Deployment
1. Existing Vercel project: connect this frontend repo with production branch main, keep project root at repository root, and use the checked-in `vercel.json`. Set Production `VITE_API_URL` to the real public HTTPS API origin; the guarded build fails before emitting assets if it is missing or unsafe.
2. Self-hosted alternative: Node build stage + unprivileged Nginx, behind the backend repository's Caddy proxy.
3. For session-cookie behavior, frontend and API need HTTPS custom subdomains under the same registrable domain. Backend `FRONTEND_ORIGIN` must exactly match the frontend origin.
4. The backend's `docker-compose.api-production.yml` + `Caddyfile.api-only` are for API-on-VPS with Vercel frontend; the full `docker-compose.production.yml` serves both frontend and API via Caddy. Do not run both public Caddy overlays on the same server.
5. Never store backend secrets in `VITE_*` frontend build variables. Vercel preview domains are not allowed by the production API's exact-origin CORS/CSRF rules.

## Branch review
Previous recursive comparisons inspected main, development, and chore/startup-docker-support. At that checkpoint the non-main branches were behind main with zero commits ahead. No unrelated branches were merged wholesale.

## Live deployment status
Current main code and container/deployment configurations are CI-checked, but no live Vercel production domain or backend server was accessed or verified. Actual launch still requires the existing Vercel project to use the production branch, real frontend/API domains, public DNS, a configured Linux Docker host for the API, random production secrets, and working SMTP credentials/verified sender. After provisioning, verify login/session/logout, send a controlled-inbox campaign, test tracking/unsubscribe, and perform a real PostgreSQL backup/restore.
