# Project Progress — Marketing Campaign Management Frontend

## Objective and status
Prepare the frontend to run with the separate backend, preserve current workflows, and reflect background campaign delivery accurately.
- The frontend build, production container smoke test, and full Playwright integration suite passed for current code and the queued-report refresh behavior.
- Campaign execute returns a queued report, and the Campaigns page now refreshes the report while backend worker processing is active. Polling is capped, so a development instance without SMTP does not poll indefinitely.
- Production image, security headers, and the optional self-hosted Caddy overlay have CI coverage.
- No live deployment has been performed. A real host, custom DNS/domains, production secrets, and valid SMTP provider credentials are external deployment inputs and have not been fabricated.

## Repository and current code
- Repository: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Target branch: `main`
- Current application/test revision before this progress-file refresh: `24c63ba8e5a61c1c5e35565acf311fc05b0949ae`.
- Latest passing CI for that revision: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39368383616
- Earlier relevant commits include `5e3e84745b09` (fix E2E Audience selector ambiguity), `d04a6d16f828` (saved templates), `6c5322486eac` (API URL normalization/static routing), and `45c59afbf59d` (unprivileged Nginx runtime).

## Implemented functionality and deployment design
- React 19 + Vite workspace includes authentication, dashboard, audiences/contacts, campaign lifecycle, reusable templates, analytics, responsive navigation, and loading/error states.
- API routes match the separately maintained backend for auth, audiences/contacts, campaigns, dashboard, analytics, and templates.
- API client normalizes a trailing slash in `VITE_API_URL` and uses credentialed fetch for the backend's HttpOnly session cookie.
- Campaign execution now treats HTTP 202 as queue acknowledgment, and the report panel periodically checks the durable report endpoint while queued deliveries remain. It displays the eventual worker status and stops checking after completion or a bounded wait.
- E2E coverage verifies the audience-to-campaign flow, template owner privacy/use, responsive nav, session/error handling, scheduled campaigns, and simulated report completion after background work.
- Docker uses a Node build stage and `nginxinc/nginx-unprivileged` on container port 8080. The normal local Compose workflow remains available at `http://localhost:5173`.
- The base host port is loopback-bound. The optional `docker-compose.production.yml` attaches the frontend to external Docker network `campaign_proxy` with alias `campaign-frontend`.
- The backend Caddy overlay publishes ports 80/443, terminates HTTPS, routes the frontend/API by custom domain, and persists certificate state. The API/DB direct host ports remain loopback-bound.
- The deployed frontend gets `VITE_API_URL=https://api.example.com` at build time. This value is public; never put backend secrets in any `VITE_*` variable.

## CI and test verification
- Passing CI on revision `24c63ba8e5a61c1c5e35565acf311fc05b0949ae` ran both frontend build/container smoke checks and the full browser integration suite against backend `main`: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39368383616
- The latest E2E adds coverage that a report changes from queued to a completed status when a later report request reflects background worker completion; no real SMTP account is used in CI.
- CI uses `contents: read` and `npm ci`.
- No local test run is claimed because a usable local clone was unavailable; validation is from GitHub Actions.

## Branch review
Inspected `main`, `development`, and `chore/startup-docker-support` recursively and compared file paths/blob SHAs. At the time of review both non-main branches were behind `main` with zero commits ahead. The branch-only `run.py` that tried to start a sibling backend checkout remains intentionally excluded; no branches were merged wholesale.

## Production configuration
- The documented self-hosted setup needs Docker Engine/Compose, a persistent server disk, the shared Docker network `campaign_proxy`, public DNS records, and inbound TCP ports 80/443 for Caddy certificate issuance.
- Use frontend and API HTTPS subdomains under the same registrable domain for the backend's `SameSite=Strict` session cookie.
- Backend production configuration now requires strong DB/JWT/Redis values, secure cookies, HTTPS origins, and SMTP configuration. Redis-backed rate-limit state is shared by API workers. Missing/unavailable Redis fails authentication closed rather than disabling protection.
- Production SMTP settings must point to a real provider and verified sender; example placeholders are rejected. A controlled-inbox delivery is still required to verify the actual provider credentials, DNS email authentication and deliverability after deployment.
- No server, domains, SMTP account, or secrets are supplied by the repository; no live deployment is claimed and no secret values are stored here.

## Next actions
1. Deploy backend API/worker/PostgreSQL/Redis/Caddy, then the frontend overlay, on the configured host.
2. Verify HTTPS health and frontend login/session behavior.
3. Send a real controlled-inbox campaign and confirm queued-to-sent status, tracking, and analytics after background processing.
4. Verify off-host database backups and record the real public URLs.
