# Marketing Campaign Management — Frontend

React 19 + Vite frontend for the campaign management platform.

## Run
```bash
cp .env.example .env
npm install
npm run dev
```

The frontend uses `VITE_API_URL` for the FastAPI base URL and relies on the backend's HttpOnly session cookie.

## Implemented
- Registration and login states backed by the real API.
- Workspace dashboard populated from persisted counts.
- Audience and contact management, including subscribe/unsubscribe state.
- Campaign create, edit, schedule, execute and report workflows.
- Delivery and engagement analytics from backend data.
- Loading, empty and error states.
- Responsive workspace layout for desktop and mobile.
