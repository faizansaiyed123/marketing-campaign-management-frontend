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

The frontend is available at http://localhost:5173.

### Environment variables

The frontend uses the existing Vite variable:

```env
VITE_API_URL=http://localhost:8000
```

Vite injects this value at build time. Because the Docker image builds the frontend before starting the Vite preview server, rebuild the image after changing `VITE_API_URL`:

```bash
VITE_API_URL=http://localhost:8001 docker compose up --build
```

Do not commit `.env` files containing secrets.

### Backend URL

The frontend calls the backend through `VITE_API_URL`. The Docker Compose file defaults to the verified backend development port, `8000`, but the value remains configurable and is not embedded in the application source.

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

## Manual development

```bash
npm install
npm run dev
```

The frontend uses `VITE_API_URL` for the FastAPI base URL and relies on the backend's HttpOnly session cookie. Dependency versions are pinned by the committed `package-lock.json`.

## Implemented

- Registration and login states backed by the real API.
- Workspace dashboard populated from persisted counts.
- Audience and contact management, including subscribe/unsubscribe state.
- Campaign create, edit, schedule, execute and report workflows.
- Delivery and engagement analytics from backend data.
- Loading, empty and error states.
- Responsive workspace layout for desktop and mobile.
