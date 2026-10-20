# Project Progress — Marketing Campaign Management Frontend

## Objective and current status
Prepare the existing frontend to work reliably with the separate backend and for production deployment while preserving current functionality.
- Source/configuration audit completed for the current main-line application.
- Production build and Playwright frontend/backend integration CI are passing.
- No live deployment has been performed; production hosting, domains, TLS, and public backend configuration remain external prerequisites.

## Repository and latest verified revision
- Repository: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Target branch: `main`
- Current inspected main SHA at this checkpoint: `3b2b61c3ba24ea21dbaf7b13e7425d2f17dfe84b`
- Recent relevant commits:
  - `45c59afbf59d` — serve built assets with unprivileged Nginx.
  - `2147f961db65` — add production container smoke test.
  - `6c5322486eac` — normalize API base URL and harden static routing.
  - `d04a6d16f828` — saved campaign template workspace.
  - `5e3e84745b09` — scope the campaign Audience selector to the editor in the E2E test.
  - `3b2b61c3ba24` — record passing integration regression run.
- GitHub access was verified earlier with push/admin permissions. Local cloning was unavailable because github.com did not resolve from the local execution environment; all changes were made and reviewed through GitHub APIs.

## Implemented changes and current design
- React 19 + Vite frontend consumes `VITE_API_URL` and includes credentialed fetch requests for the HttpOnly session cookie.
- API base URL normalization removes a trailing slash before composing endpoints.
- Frontend UI covers authentication, dashboard, audiences/contacts, campaign creation/editing/scheduling/execution/reporting, saved reusable templates, analytics, responsive navigation, and loading/error states.
- Campaign template APIs are referenced as `GET/POST /api/v1/templates` and `PATCH/DELETE /api/v1/templates/{id}`; these are implemented in backend main.
- Docker builds assets in a Node stage, serves them with the `nginxinc/nginx-unprivileged` image as a non-root user on container port 8080, and supplies SPA fallback plus baseline security headers.
- Docker Compose maps host port 5173 to container port 8080 for local convenience; the API URL is embedded at build time.
- Frontend CI has `contents: read`, installs locked dependencies with `npm ci`, builds the application/container, smoke-tests the static container, and runs Playwright end-to-end tests against the current backend main branch.
- No startup runner that assumes a sibling backend checkout is shipped with frontend main; the old branch-only runner remains intentionally excluded.

## Branch comparison
Branches inspected: `main`, `development`, and `chore/startup-docker-support`.
Recursive trees and blob SHAs showed both non-main branches behind main with zero commits ahead. The old branch-only `run.py` attempts cross-repository backend startup and is intentionally not reintroduced. No branches were blindly merged.

## CI and test verification
- Latest checked run on main SHA `3b2b61c3ba24` completed successfully: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39362965002
- This CI workflow runs the dependency-locked build, production Docker image build/container smoke test, and integration job with migrations and Playwright.
- The selector collision was reproduced in runs `39361998680` and `39362043595`: the unscoped accessible-name query matched the sidebar Audience button and editor select. It was fixed in `5e3e84745b0974868c7b42ea5929f847b133e697`; full CI passed after the fix: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39362831207
- The mobile navigation regression test had previously passed as part of the full Playwright suite: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39362831207
- Do not claim a separately run local test suite; no local clone was available.

## Deployment prerequisites and known limits
- No production URL, DNS/TLS setup, cloud hosting project, or deployed service has been created/verified.
- Build with `VITE_API_URL` set to the public HTTPS backend origin; changing it requires rebuilding the image.
- Configure backend `FRONTEND_ORIGIN` to the exact public frontend origin.
- The backend session cookie uses `SameSite=Strict`; use HTTPS custom domains under the same registrable domain (for example `app.example.com` and `api.example.com`) so cookie-based authentication behaves as expected.
- The backend PostgreSQL database, migrations, strong runtime secrets, worker process, and optional SMTP credentials must be configured separately.
- The frontend API build variable is public; do not place backend secrets or SMTP credentials in any `VITE_*` variable.
- No secrets are recorded in this file.

## Next action
1. Complete the deployment environment setup with a selected hosting target, DNS/TLS, and production variables.
2. Deploy the backend API and worker with persistent PostgreSQL, then deploy the frontend with the API URL embedded at build time.
3. Verify production HTTPS health, registration/login/logout, template isolation, audience/campaign lifecycle, tracking, and real SMTP delivery if configured.
