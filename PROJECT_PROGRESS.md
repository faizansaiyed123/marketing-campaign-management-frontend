# Project Progress — Marketing Campaign Management Frontend

## Status — October 20, 2026
The current frontend source, deployment config, and browser integration are committed on main and passed CI at revision `b9148ad6430d0e443d78f1f336a60fc38beaeed7`.
- Campaign execution treats HTTP 202 as durable queue acceptance; it does not imply SMTP has sent mail.
- Campaign reports refresh status while the worker processes queued runs and distinguish Attempts, Sent, Failed, Skipped, Opened, and Clicked. Automatic polling is bounded; a visible Refresh report action restarts polling/checks current status for long-running or stalled queues. Attempt totals include delivery rows across retries, not unique contacts.
- Editing a failed/partial campaign explicitly warns that Retry sends only failed recipients; content edits apply to the retry, and previously sent recipients are not resent.
- A recipient who unsubscribes after a campaign is queued but before the worker sends it is skipped by the backend and shown separately in reports.
- The editor documents {{first_name}}, {{last_name}}, {{full_name}}, and {{email}} merge fields.
- Empty-audience campaigns can be reused after contacts are added; failed/partial campaigns can be edited before retry without accidentally resetting retry semantics.
- The existing Vercel project path uses guarded production config (missing/unsafe API URLs fail the build), and the self-hosted Docker path remains available.
- Vite was upgraded to patched 6.4.4; the vulnerable transitive source-map-js package was upgraded to 1.2.2. CI now enforces `npm audit --audit-level=high`.
- No Vercel CLI or app/hosting integration was installed.

## Repositories and CI
- Current `main` commit: `b9148ad6430d0e443d78f1f336a60fc38beaeed7`
- Frontend: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Backend: https://github.com/faizansaiyed123/marketing-campaign-management-backend
- Frontend code/config revision verified by CI before this documentation update: `b9148ad6430d0e443d78f1f336a60fc38beaeed7`
- Passing frontend build + integration CI: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39400798946
- Backend latest verified application revision: `9db02d023a2880f3366515aa1249a201cec1869c` (passing CI: https://github.com/faizansaiyed123/marketing-campaign-management-backend/actions/runs/39401632017)
- The frontend CI checks npm ci, high/critical npm advisories, Vercel config and invalid API URL rejection, HTTPS production builds, Docker container smoke/security headers, and Playwright integration against backend main.

## Application workflows
- React/Vite workspace supports registration/login/session/logout, dashboard, audience and contact management, subscription changes, campaign creation/edit/scheduling/execution/reporting, owner-scoped templates, analytics, responsive nav, and loading/error/empty states.
- The API client normalizes trailing slashes in VITE_API_URL and sends credentialed requests for the backend HttpOnly cookie.
- Report polling is bounded and stops after the worker completes the run, or after a bounded wait when mail delivery is not configured.
- Campaign report Attempts are cumulative across retries, while latest_run_status identifies the current latest run. Skipped deliveries are not labelled sent or failed.
- Playwright tests cover audience/contact flows, template ownership, session persistence, scheduled campaigns, automatic/manual report refresh, skipped-delivery presentation, retry/empty-audience recovery, and the partial-campaign retry warning.

## Deploy choices
1. Existing Vercel project: use this repository root and main as the production branch. The checked-in vercel.json uses the Vite framework/build/output settings plus SPA rewrites. Set Production VITE_API_URL to the real public HTTPS API origin. The production build rejects missing, plain-HTTP, localhost, and example placeholder origins.
2. Fully self-hosted alternative: Node build stage plus unprivileged Nginx, with the backend repository's full Caddy overlay.
3. For session-cookie behavior, frontend and API must use HTTPS custom subdomains under the same registrable domain; backend FRONTEND_ORIGIN must match the frontend origin exactly.
4. For Vercel frontend + VPS backend, use backend docker-compose.api-production.yml plus Caddyfile.api-only. Do not start both Caddy overlays on one host because both publish ports 80/443.
5. VITE_API_URL is public and embedded at build time; never put backend credentials/secrets in any VITE_* variable. Vercel preview origins are not allowed by the production API's exact-origin CORS/CSRF settings.

## Branch review
Previous recursive comparisons inspected main, development, and chore/startup-docker-support. At the review checkpoint the non-main branches were behind main with zero commits ahead. No unrelated branch code was merged wholesale.

## Live deployment status
The code, lockfile, CI and deployment definitions are checked, but no live Vercel production site or backend host has been accessed or verified. Live launch still needs the existing Vercel project configured with a real API URL/custom frontend domain, a backend host and actual DNS, production secrets, real SMTP provider credentials/verified sender, controlled-inbox delivery verification, and a production backup/restore test.
