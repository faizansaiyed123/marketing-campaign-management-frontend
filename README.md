# Marketing Campaign Management — Frontend

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

Vite injects this value at build time; the API client normalizes an optional trailing slash. The Docker image embeds `VITE_API_URL` into the static assets at build time, so rebuild the image after changing the value:

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

The repository contains a `vercel.json` for the Vite build and SPA fallback. You do not need to install the Vercel CLI for the Git-connected dashboard workflow.

1. In your existing Vercel dashboard, import or select this frontend repository, keep the project root at the repository root, and set the production branch to `main`. The checked-in configuration sets the Vite framework preset, `npm run build`, and `dist` output.
2. In Project Settings → Environment Variables, add `VITE_API_URL=https://api.your-real-domain.example` for Production. This value is public, embedded into the frontend during build, and changing it requires a new deployment.
3. Assign a custom HTTPS domain such as `app.your-real-domain.example` to the frontend project. Configure the backend API on a sibling subdomain such as `api.your-real-domain.example`; this keeps the backend's `SameSite=Strict` session cookie same-site.
4. Deploy the backend using its API-only overlay and `Caddyfile.api-only`; the backend README contains the required DNS, TLS, database, Redis, secure cookie, CSRF-origin, and SMTP setup. Set the backend's `FRONTEND_ORIGIN` to the exact frontend custom-domain origin.
5. Test the production Vercel domain through registration/login/logout, then send a controlled-inbox test campaign. Production API CORS/CSRF rules deliberately do not allow arbitrary Vercel preview origins to use the production session.

Never put database passwords, JWT secrets, SMTP credentials, or other backend secrets into any `VITE_*` variable.

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

## Implemented

- Registration and login states backed by the real API.
- Workspace dashboard populated from persisted counts.
- Audience and contact management, including subscribe/unsubscribe state.
- Campaign create, edit and scheduling; execution queues durable work and the report panel automatically refreshes as the backend worker processes it. Reusable saved templates support `{{first_name}}`, `{{last_name}}`, `{{full_name}}`, and `{{email}}` merge fields in campaign subjects and HTML. Empty-audience campaigns can be reused after contacts are added, and failed/partial campaigns remain editable before retrying.
- Delivery and engagement analytics from backend data.
- Loading, empty and error states.
- Responsive workspace layout for desktop and mobile.
