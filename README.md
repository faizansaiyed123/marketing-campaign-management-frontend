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

Vite injects this value at build time. The Docker image embeds `VITE_API_URL` into the static assets at build time, so rebuild the image after changing the value:

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

## Implemented

- Registration and login states backed by the real API.
- Workspace dashboard populated from persisted counts.
- Audience and contact management, including subscribe/unsubscribe state.
- Campaign create, edit, schedule, execute and report workflows.
- Delivery and engagement analytics from backend data.
- Loading, empty and error states.
- Responsive workspace layout for desktop and mobile.
