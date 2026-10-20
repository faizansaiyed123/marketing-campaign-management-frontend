# Project Progress — Marketing Campaign Management Frontend

## Status — October 20, 2026
The frontend application, Vercel project configuration, production Docker image, and browser integration are committed on main.
- Campaign execution treats HTTP 202 as durable queue acceptance; it does not imply that SMTP sent mail.
- The report panel refreshes delivery status while the backend worker processes queued campaigns.
- The editor documents supported personalized fields: {{first_name}}, {{last_name}}, {{full_name}}, and {{email}}.
- Empty-audience campaigns can be executed again after contacts are added; failed/partial campaigns can be edited before retry.
- A Vercel configuration now sets the Vite build, dist output, and SPA fallback. No CLI/plugin installation is required for the Git-connected dashboard flow.
- CI has passed for the Vercel configuration, production build/container smoke checks, and Playwright end-to-end suite.

## Repositories and verification
- Frontend: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Backend: https://github.com/faizansaiyed123/marketing-campaign-management-backend
- Frontend Vercel configuration/application revision before this progress update: acf872b67421e802863f2ee4496750b01adae7e5
- Passing CI run for that revision: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39378045862
- Backend's latest reviewed API-only production configuration is committed in its main branch and has a separate CI run; see the backend progress file.
- Frontend CI covers npm ci, explicit Vercel configuration validation, Vite build, Compose configuration, production image build/smoke checks/security headers, and Playwright integration against backend main.

## Application functionality
- React + Vite workspace supports account registration/login/session/logout, dashboard, audiences/contacts, subscription changes, campaign create/edit/schedule/execute/report, saved templates, analytics, responsive navigation, and error/empty states.
- The API client normalizes trailing slashes in VITE_API_URL and uses credentialed fetch for the backend's HttpOnly cookie.
- The Campaigns report panel polls the durable report endpoint while the latest run has queued deliveries, shows updated sent/failed state, and caps polling if no worker processes the queue.
- Campaign subjects and HTML support {{first_name}}, {{last_name}}, {{full_name}}, and {{email}}; the backend performs substitution and HTML escaping.
- Saved templates remain private to the account through backend owner-scoped APIs.

## Production deployment choices
1. Existing Vercel project: repository root, production branch main, Vite build, dist output, and Production variable VITE_API_URL pointing at the backend's public HTTPS API origin. The checked-in vercel.json adds SPA fallback routing.
2. Fully self-hosted alternative: Node build stage, unprivileged Nginx static server, and shared Caddy HTTPS proxy through Docker network campaign_proxy.
- The frontend must be deployed on an HTTPS custom domain under the same registrable domain as the API host for the backend's SameSite=Strict session cookie; e.g. app.example.com and api.example.com. The exact FRONTEND_ORIGIN setting on the backend must match the frontend origin.
- VITE_API_URL is public and embedded at build time. Never place credentials, JWT secrets, SMTP settings or any backend secret into VITE_* variables.
- Vercel preview origins are intentionally not trusted by the production API CORS/CSRF settings. Use the production custom domain for end-to-end auth validation.
- The backend README documents the API-only Caddy overlay to use when Vercel hosts the frontend. Do not run the API-only Caddy overlay and the full two-domain Caddy overlay on the same host at once because each publishes ports 80/443.

## CI verification
- Passing CI for code/config revision acf872b67421e802863f2ee4496750b01adae7e5: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39378045862
- Browser tests cover audience/contact flows, campaign execution and queued-to-completed report refresh, reusable templates, session behavior, scheduled campaigns, responsive navigation, empty-audience recovery, and error states.
- Build checks include Vercel JSON validity, production Vite build, Docker/Nginx startup, SPA root response, and security headers.

## Branch review
Previously inspected main, development, and chore/startup-docker-support recursively and compared file paths/blob SHAs. At that checkpoint the non-main branches were behind main with zero commits ahead. No unrelated branch code was blindly merged.

## Live deployment status
The source and deployment definitions are CI-checked, but no live Vercel deployment or backend service has been accessed or verified during this work. To go live, the existing Vercel project must be linked to this repo with the Production environment variable and a custom domain; the API host still needs real DNS, Linux/Docker access, secrets, and working SMTP provider settings. A controlled-inbox send, authentication/session tests, and a PostgreSQL restore test are required after provisioning.
