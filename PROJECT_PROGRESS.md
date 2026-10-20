# Project Progress — Marketing Campaign Management Frontend

## Status — October 20, 2026
The frontend application, production Docker image, Vercel deployment configuration, and browser integration are committed on main.
- Campaign execution treats HTTP 202 as durable queue acceptance; it does not imply SMTP has sent mail.
- The report panel refreshes delivery status while the backend worker processes queued campaigns.
- The campaign editor lists supported personalized fields: {{first_name}}, {{last_name}}, {{full_name}}, and {{email}}.
- Empty-audience campaigns can be executed again after contacts are added; failed/partial campaigns can be edited before retry.
- Both the Vercel build and self-hosted Docker production build fail with a clear message if VITE_API_URL is missing, non-HTTPS, localhost, or a reserved example placeholder.
- The production build configuration and its failure cases pass CI alongside Docker/container and Playwright tests.
- No Vercel connector or CLI installation was performed.

## Repositories and verification
- Frontend: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Backend: https://github.com/faizansaiyed123/marketing-campaign-management-backend
- Current frontend application/configuration revision before this progress update: e6f710ec3e923986de9305393e33c70eaa588299
- Last passing CI before this production Docker URL guard: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39378962904
- Backend API-only/full-stack production deployment configuration is in the backend main branch and its CI workflow validates both overlays.
- Frontend CI checks npm ci, Vercel SPA configuration, rejection of missing/unsafe API URLs, valid HTTPS Vercel build, Docker production build rejection of localhost, normal Vite build, Compose configuration, production Docker image smoke test/security headers, and Playwright integration against backend main.

## Application functionality
- React + Vite workspace supports account registration/login/session/logout, dashboard, audiences/contacts, subscription changes, campaign create/edit/schedule/execute/report, saved templates, analytics, responsive navigation, and error/empty states.
- The API client normalizes trailing slashes in VITE_API_URL and uses credentialed fetch for the backend HttpOnly cookie.
- The Campaigns report panel polls the durable report endpoint while the latest run has queued deliveries, displays updated sent/failed state, and caps polling if no worker processes the queue.
- Campaign subjects and HTML support {{first_name}}, {{last_name}}, {{full_name}}, and {{email}}. The backend substitutes contact values safely and escapes HTML.
- Saved templates remain private to each account through backend owner-scoped APIs.

## Deployment options
1. Existing Vercel project: repository root, production branch main, Vite framework, build command npm run build:vercel, dist output, and Production variable VITE_API_URL pointing at the public HTTPS API origin. The checked-in vercel.json adds SPA fallback routing and the build script prevents placeholder API URLs.
2. Fully self-hosted alternative: Node build stage, unprivileged Nginx static server, and shared Caddy HTTPS proxy through Docker network campaign_proxy.
- For cookie-based authentication, the frontend and API must use HTTPS custom subdomains under the same registrable domain, for example app.yourdomain.com and api.yourdomain.com. Backend FRONTEND_ORIGIN must match the frontend's exact origin.
- VITE_API_URL is public and embedded at build time. Never put credentials, JWT secrets, SMTP settings or any backend secret into VITE_* variables.
- Vercel preview origins are intentionally not trusted by production API CORS/CSRF settings. Use the production custom domain for end-to-end authentication checks.
- The backend README documents Caddyfile.api-only and docker-compose.api-production.yml for a VPS-hosted API with a Vercel frontend. Do not run the API-only overlay and full two-domain Caddy overlay on the same host simultaneously because both publish ports 80/443.

## CI verification
- Passing CI for revision c3974c30c80b164091c160218a0c42d418a13f8c: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39378747582
- Browser tests cover audience/contact flows, campaign execution and queued-to-completed report refresh, reusable templates, session behavior, scheduled campaigns, responsive navigation, empty-audience recovery, and error states.
- The Vercel build guard has explicit CI cases for missing API URL, insecure localhost, reserved example subdomain, and a valid HTTPS origin.

## Branch review
Earlier recursive comparisons inspected main, development, and chore/startup-docker-support. At the review checkpoint, non-main branches were behind main with zero commits ahead. No branches were merged wholesale; unrelated branch-only startup scripts remain excluded.

## Live deployment status
The source and deployment definitions are CI-checked, but no live Vercel deployment or backend service has been accessed or verified during this work. To go live, the existing Vercel project must be linked to this repository with the Production environment variable and a custom frontend domain. The API host still needs real DNS, Linux/Docker access, production secrets, and working SMTP provider settings. A controlled-inbox send, authentication/session tests, and a PostgreSQL restore test are required after provisioning.
