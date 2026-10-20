# Project Progress — Marketing Campaign Management Frontend

## Objective and status
Prepare the frontend to run with the separate backend and support production deployment while preserving current functionality.
- Latest frontend build and Playwright integration suite are passing.
- Production container, Nginx smoke test, and optional self-hosted reverse-proxy overlay have CI coverage.
- No live deployment has been performed; a real VPS/host, DNS domains, and production settings still need to be supplied by the deployment operator.

## Repository and current code
- Repository: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Target branch: `main`
- Production-overlay commit under verification: `9b126f0934cd15ed6ab1c2e8162403724d4da995`
- This adds `docker-compose.production.yml` and tightens the base frontend port mapping to loopback; see the current GitHub main branch for the latest tree.
- Earlier relevant application commits include `5e3e84745b09` (fix E2E Audience selector ambiguity), `d04a6d16f828` (saved template workspace), `6c5322486eac` (API base URL normalization/static routing), and `45c59afbf59d` (unprivileged Nginx runtime).

## Implemented functionality and deployment design
- React 19 + Vite frontend includes authentication, dashboard, audiences/contacts, campaign lifecycle, saved templates, analytics, responsive navigation, and loading/error states.
- API routes used by the frontend match backend main for auth, audiences/contacts, campaigns, dashboard, analytics, and templates.
- API client strips trailing slashes from `VITE_API_URL` and uses credentialed fetch requests for the HttpOnly session cookie.
- Docker uses a Node build stage and `nginxinc/nginx-unprivileged` on container port 8080; the normal Compose workflow stays usable at `http://localhost:5173`.
- Base frontend port mapping now binds to loopback only. The optional `docker-compose.production.yml` attaches the frontend container to external Docker network `campaign_proxy` under alias `campaign-frontend`.
- The backend repository's optional Caddy overlay publishes ports 80/443, terminates HTTPS, routes frontend and API traffic by custom domain, and persists Caddy certificate data. The API and PostgreSQL host ports remain loopback-bound.
- The frontend uses `VITE_API_URL=https://api.example.com` in its untracked deployment `.env`; this value is embedded at build time and is public. Never put backend secrets in `VITE_*` values.

## CI and test verification
- Latest checked run for production-overlay commit `9b126f0934cd` passed: locked-dependency frontend build, Compose overlay validation, production image build, container smoke test/security headers, and the full frontend/backend Playwright integration suite: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39364319938
- The Audience selector collision was fixed in `5e3e84745b0974868c7b42ea5929f847b133e697`; its complete CI run also passed: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39362831207
- CI uses `contents: read` and `npm ci`.
- No local test run is claimed because a local clone was unavailable.

## Branch review
Inspected `main`, `development`, and `chore/startup-docker-support` recursively and compared file paths/blob SHAs. Both non-main branches were behind `main` with zero commits ahead. The old branch-only `run.py` that tried to launch the backend from a sibling checkout remains excluded intentionally. No branches were merged wholesale.

## Deployment prerequisites and limits
- No production URL, host, DNS records, or TLS certificate has been created or verified.
- The optional one-server setup requires Docker Engine/Compose, a persistent server disk, a shared Docker network named `campaign_proxy`, DNS records for both custom domains, and public TCP 80/443 access for Caddy certificate issuance.
- Use frontend and API HTTPS subdomains under the same registrable domain for the backend's `SameSite=Strict` session cookie.
- Backend must be configured with `ENVIRONMENT=production`, a unique random `JWT_SECRET_KEY`, `COOKIE_SECURE=true`, `COOKIE_NAME=__Host-campaign_session`, exact `FRONTEND_ORIGIN`, HTTPS `PUBLIC_BASE_URL`, and non-default database credentials.
- SMTP must be configured separately before claiming live email delivery. Without it, campaign executions remain queued by design.
- No secrets are stored in this progress file.

## Next action
1. Verify the current backend production-overlay and auth-rate-limit CI run.
2. Configure a real VPS, custom domains, DNS/TLS and secret values.
3. Deploy API + worker + PostgreSQL/Caddy first, then the frontend overlay.
4. Run production smoke checks for health, registration/login/logout, template privacy, campaigns, tracking, and SMTP if enabled.
