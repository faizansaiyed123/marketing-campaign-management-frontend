# Project Progress — Marketing Campaign Management Frontend

## Status
The core frontend workflow, production build, container checks, and Playwright integration are implemented on `main`.
- Campaign execution treats HTTP 202 as durable queue acceptance, not proof that emails were sent.
- The report panel refreshes backend delivery state while the worker processes a queue and stops after completion or a bounded wait.
- The editor lists supported personalization fields: `{{first_name}}`, `{{last_name}}`, `{{full_name}}`, and `{{email}}`.
- Completed campaigns with zero recipients can be edited and executed again after audience contacts are added. Failed/partial campaigns can be edited before retry.
- Production Docker image, Nginx smoke test/security headers, shared proxy-network configuration, and Playwright API integration have CI coverage.
- No live deployment has been performed; real host, DNS, backend secrets, and working SMTP settings have not been supplied.

## Repositories and verification
- Frontend: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Backend: https://github.com/faizansaiyed123/marketing-campaign-management-backend
- Frontend code revision verified by CI: `92c05c82d69858093df535b6480d277f22e297e6`.
- CI for this revision passed: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39372206963
- Prior full frontend production/integration CI run: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39368383616
- CI includes `npm ci`, production Vite build, Compose validation, container startup and security-header smoke test, plus full browser tests against the backend `main` branch.
- Current app revision includes a new E2E recovery case for an initially empty audience, which confirms the campaign can be executed again after a contact is added, along with assertions for edit/retry actions on completed/failed/partial campaigns.

## Product workflow
- React 19 + Vite frontend supports registration/login/session persistence, dashboard, audience/contact management, subscribe/unsubscribe state, campaign create/edit/schedule/execute/report, saved owner-scoped templates, analytics, responsive navigation, and error/empty states.
- The API client normalizes a trailing slash in `VITE_API_URL` and sends credentialed requests for the backend's HttpOnly cookie.
- Campaigns are queued in PostgreSQL and delivered by the backend worker. The UI shows queued/sent/failed reports and polls while the run is active instead of presenting the HTTP 202 as an email-delivery success.
- Supported personalization fields are shown in the editor; actual substitutions and HTML escaping are performed by the backend send service.
- The editor supports using saved templates as campaign starting points. Backend template privacy and ownership remain enforced server-side.

## Build and deployment
- Static assets are compiled in a Node build stage and served by `nginxinc/nginx-unprivileged` on container port 8080.
- Normal local Compose remains available at `http://localhost:5173`; the host port is loopback-bound.
- The optional `docker-compose.production.yml` overlay attaches the frontend to the external Docker network `campaign_proxy` as `campaign-frontend`.
- The backend Caddy overlay terminates HTTPS on 80/443 and routes to the frontend/API containers.
- Both READMEs use a custom Docker bridge example: `172.30.240.0/24`, gateway `172.30.240.1`, Caddy static IP `172.30.240.2`. Ensure this subnet does not conflict with the host LAN/VPN. If it must change, synchronize Caddy's static IP and backend `FORWARDED_ALLOW_IPS`.
- Build with `VITE_API_URL=https://<API_DOMAIN>`; the value is embedded into static assets at build time and is public. Never put API keys, SMTP credentials, or backend secrets into any `VITE_*` variable.
- Use custom HTTPS frontend/API subdomains under the same registrable domain to support the backend session cookie's `SameSite=Strict` behavior.

## Branch review
Earlier recursive tree/content comparisons inspected `main`, `development`, and `chore/startup-docker-support`; both non-main branches were behind `main` with zero commits ahead at that checkpoint. No branch was blindly merged. The old branch-only script that expected a sibling backend checkout remains excluded.

## Live deployment status
The source code and CI-checked container configuration are committed; a live production URL is not available or verified. The deployment path still needs:
1. A Linux host with Docker Engine/Compose, persistent disk, public DNS, and ports 80/443 open.
2. Real frontend and API domains pointing to the host.
3. Production DB/JWT/Redis secrets, valid SMTP provider settings, and a verified sender.
4. A controlled-inbox send test, campaign report/tracking checks, and verified off-host database backup/restore.

Detailed commands are in the backend and frontend READMEs. Production `.env` files and secrets must never be committed.
