# Project Progress — Marketing Campaign Management Frontend

## Status
The frontend's core workflows and production container are committed on `main`. The latest Playwright run passed after adding a visible personalization helper and E2E assertions for the available merge fields.
- Campaign execution treats HTTP 202 as durable queue acceptance.
- The report panel automatically re-queries the backend report while deliveries remain queued and stops polling after worker completion or a bounded interval.
- The campaign editor documents `{{first_name}}`, `{{last_name}}`, `{{full_name}}`, and `{{email}}`; the backend escapes contact data for HTML delivery.
- Production image, Nginx smoke test/security headers, shared-network overlay and browser integration have CI coverage.
- A live deployment has not been performed; actual host/DNS/secrets/SMTP settings must be supplied by the deployment operator.

## Repository and current code
- Repository: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Target branch: `main`
- Current code revision verified by the latest frontend CI: `d5f89799217d171d9408131daf0d2f04058ef17f`.
- CI run: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39370945582
- Existing functionality includes registration/login/session handling, dashboard, audience/contact management, subscribe/unsubscribe UI, campaign authoring/scheduling/execution/reporting, saved templates, analytics, and responsive navigation.
- The API client normalizes trailing slashes in `VITE_API_URL` and uses credentialed requests for the backend HttpOnly cookie.

## Campaign delivery experience
- Execute queues the campaign; the UI does not imply SMTP completion merely because the API acknowledged the request.
- The Campaigns report panel polls the persistent report endpoint while the run is queued, displays queued/sent/failed state, and caps polling for development setups without SMTP.
- Merge-field helper text identifies supported personalized fields. Saved templates remain reusable and owner-scoped by the backend.
- E2E coverage verifies audience/contact lifecycle, campaign execution, saved-template application, responsive navigation, session/error handling, scheduled edits, personalization help text, and a queued-to-completed report update.

## Build and deployment design
- React 19 + Vite; static assets built in a Node stage and served by `nginxinc/nginx-unprivileged` on port 8080.
- Production host-port binding is loopback-only. The optional `docker-compose.production.yml` attaches the frontend to the external Docker network `campaign_proxy` as `campaign-frontend`.
- The backend's Caddy overlay terminates TLS on ports 80/443 and routes to the frontend and API containers. Build with `VITE_API_URL=https://<API_DOMAIN>`; this is embedded into assets at build time and is public, so never put private secrets in `VITE_*` values.
- For cookie behavior, use frontend/API HTTPS domains under the same registrable domain and set the backend `FRONTEND_ORIGIN` to the frontend's exact HTTPS origin.
- Both repository deployment guides use the same custom bridge network example: `172.30.240.0/24` with gateway `172.30.240.1`; the backend Caddy container uses `172.30.240.2`. Choose an unused private subnet and keep the backend's Caddy static IP and `FORWARDED_ALLOW_IPS` in sync if changing it.

## CI and verification
- Passing current code revision `d5f89799217d171d9408131daf0d2f04058ef17f`: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39370945582
- CI includes locked dependency install, Vite production build, production image build/smoke test/security headers, production Compose configuration, and full Playwright integration against backend `main`.
- CI uses `contents: read` and `npm ci`; no local build is claimed because no working local clone was available in this environment.

## Branch review
Previously inspected `main`, `development`, and `chore/startup-docker-support` recursively and compared file paths/blob SHAs. At that review point the two non-main branches were behind main with no commits ahead. No branches were merged wholesale; the branch-only script that expected a sibling backend checkout remains excluded intentionally.

## Production deployment status
Source code and CI are verified; a live production URL has not been created or checked. Launching the included one-host setup requires:
1. A Linux host with Docker Engine/Compose, persistent disk, public DNS and web ports 80/443.
2. Actual frontend and API domains resolving to that host.
3. Real, untracked backend production secrets and a valid SMTP provider account/verified sender.
4. A successful controlled-inbox campaign test plus post-deployment auth, tracking and restore checks.

The exact Docker commands and current backend configuration are in the two READMEs. Do not commit production `.env` files.
