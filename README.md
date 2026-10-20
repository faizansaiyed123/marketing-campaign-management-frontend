# Marketing Campaign Management — Frontend

> **Live frontend:** https://marketing-campaign-management-front.vercel.app

React 19 + Vite frontend for the campaign management platform.

## Requirements

- Node.js 22+ with npm for manual development.
- Docker Engine/Desktop with Docker Compose v2 for the Docker workflow.
- A running instance of the separately maintained backend repository for API-backed features.

## Docker

Build and start the frontend from this repository:

```bash
docker compose up --build
```

The frontend is available at http://localhost:5173. The container serves the built static assets with an unprivileged Nginx image; Vite's preview server is used only for local/test workflows.

### Environment variables

The frontend uses the existing Vite variable:

```env
VITE_API_URL=http://localhost:8000
```

Vite injects this value at build time; the API client normalizes an optional trailing slash. The Docker image embeds `VITE_API_URL` into the static assets at build time, so rebuild the image after changing the value. The local Compose file retains the development default; the production overlay switches to a guarded build that rejects missing, insecure, localhost, or example API URLs:

```bash
VITE_API_URL=http://localhost:8001 docker compose up --build
```

Do not commit `.env` files containing secrets.

### Backend URL

The frontend calls the backend through `VITE_API_URL`. The Docker Compose build defaults to the backend development port, `8000`, but the value remains configurable and is embedded into the built frontend assets rather than supplied at runtime.

For the normal local setup, run the backend independently from:

`faizansaiyed123/marketing-campaign-management-backend`

and keep the frontend pointed at `http://localhost:8000`.

### Stop

```bash
docker compose down
```

### Rebuild

```bash
docker compose up --build
```

The production image uses Nginx on container port `8080` and runs as an unprivileged user. Compose maps it to host port `5173` for a familiar local URL.

## Manual development

Create the local environment file from the checked-in example, then install and start Vite:

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL` in `.env` to the backend's URL. The frontend does not embed a backend URL in application source.

The frontend uses `VITE_API_URL` for the FastAPI base URL and relies on the backend's HttpOnly session cookie. Dependency versions are pinned by the committed `package-lock.json`.

## Production deployment

Set `VITE_API_URL` to the public HTTPS origin of the deployed backend **at build time**. With Docker, for example:

```bash
VITE_API_URL=https://api.example.com docker compose up --build
```

Because Vite embeds this variable into the generated assets, rebuild the image whenever the API URL changes. The checked-in localhost URL is for local development only. Do not put JWT secrets, SMTP credentials, or other private backend settings in any `VITE_*` variable; frontend build variables are public.

For cookie-based login to work, configure the backend's `FRONTEND_ORIGIN` to the exact HTTPS frontend origin and use `COOKIE_SECURE=true`, `COOKIE_NAME=__Host-campaign_session`, and a unique random `JWT_SECRET_KEY` in production. The backend's session cookie defaults to `SameSite=Strict`, so deploy the frontend and API on custom HTTPS domains under the same registrable domain (for example, `app.example.com` and `api.example.com`). Unrelated default provider domains may cause browsers to block the session cookie. See the backend repository README for the corresponding database, migration, and SMTP settings.

### Deploy the frontend with your existing Vercel project

The public site and authentication pages are served by Vercel. Browser requests to `/api/v1/*` are forwarded through the server-side `api/[...path].js` function. This keeps authentication cookies on the Vercel site origin; do **not** put backend credentials or server-side secrets in `VITE_*` variables.

1. In Vercel, select this repository and keep the project root at the repository root, the production branch at `main`, and the framework set to Vite. The checked-in configuration uses `npm ci`, `npm run build`, `dist`, and the SPA fallback.
2. Deploy `marketing-campaign-management-backend` to a real public HTTPS API host first. In Vercel Project Settings → Environment Variables, set **`BACKEND_API_URL`** for Production to that backend's **origin only**, for example `https://api.your-real-domain.example` (no `/api/v1` path and no trailing endpoint). This is a server-side variable: do not prefix it with `VITE_`. Redeploy after setting it.
3. In the backend's production environment, set `FRONTEND_ORIGIN=https://marketing-campaign-management-front.vercel.app` (or your verified production custom-domain origin), `COOKIE_SECURE=true`, and `COOKIE_NAME=__Host-campaign_session`. Also configure the required database, Redis, JWT secret, and SMTP values described in the backend repository README.
4. Verify the backend's `/health` endpoint directly, then test registration, sign-in, refresh/reload of an authenticated `/app` session, logout, and one owner-scoped audience action through the Vercel domain. Do not use an unrelated backend URL: all `/api/v1/*` endpoints must belong to this campaign-management backend.
5. Local Playwright/Docker development can continue to set `VITE_API_URL=http://localhost:8000`. For the Vercel site, leave `VITE_API_URL` unset so requests use the same-origin proxy. Keep production API access restricted to the configured frontend origin.

The API proxy returns a clear HTTP 503 response when `BACKEND_API_URL` is not configured, rather than silently pretending registration succeeded or serving the SPA HTML as an API response. Until the backend has a real deployed URL, the marketing homepage and login/register screens load, but registration/login cannot succeed.

### Single-host HTTPS deployment with Caddy

The optional `docker-compose.production.yml` overlay connects this frontend to the backend repository's Caddy reverse proxy through a shared Docker network. It leaves the normal local command above available without requiring this network.

On the server, create the shared network once. First confirm that `172.30.240.0/24` does not conflict with a LAN, VPN, or another Docker network; if you use a different subnet, update the backend Caddy IP and `FORWARDED_ALLOW_IPS` together:

```bash
docker network create --driver bridge --subnet 172.30.240.0/24 --gateway 172.30.240.1 campaign_proxy
```

In the frontend repository, create a local `.env` file (do not commit it) containing:

```env
VITE_API_URL=https://api.example.com
```

Replace the example domain with your API domain. After DNS for both the frontend and API custom domains points to the server, start the backend stack using the instructions in the backend README, then start this frontend:

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml up --build -d
```

The frontend container is published on loopback only; public HTTPS traffic should arrive through Caddy on ports 80/443. Configure your host firewall to expose only the required public web ports and SSH administration. Keep both domains under the same registrable domain for the session cookie to work reliably. The example domains are placeholders, not deployed addresses.

## Dependency security

Frontend dependencies are installed from the committed npm lockfile using `npm ci`. The pinned toolchain includes Vite 6.4.4 and source-map-js 1.2.2; Vite 6.4.4 addresses the published Vite 6.4.3-and-earlier issues [GHSA-rq7h-c2jc-7f22](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22) and [GHSA-9jrq-w75r-8gcw](https://github.com/vitejs/vite/security/advisories/GHSA-9jrq-w75r-8gcw). CI now runs `npm audit --audit-level=high` on every main/development push and pull request, in addition to the build and browser integration tests.

## Implemented

- Registration and login states backed by the real API.
- Workspace dashboard populated from persisted counts.
- Audience and contact management, including subscribe/unsubscribe state.
- Campaign create, edit and scheduling; execution queues durable work and the report panel automatically refreshes as the backend worker processes it. Reusable saved templates support `{{first_name}}`, `{{last_name}}`, `{{full_name}}`, and `{{email}}` merge fields in campaign subjects and HTML. Empty-audience campaigns can be reused after contacts are added, and failed/partial campaigns remain editable before retrying. Reports show skipped deliveries separately when a contact unsubscribes after queueing but before the worker sends.
- Delivery and engagement analytics from backend data.
- Loading, empty and error states.
- Responsive workspace layout for desktop and mobile.
