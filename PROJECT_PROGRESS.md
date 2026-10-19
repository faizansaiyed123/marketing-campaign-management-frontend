# Project Progress — Marketing Campaign Management Frontend

## Objective and acceptance criteria
Prepare the existing frontend to work reliably with the separate backend and for production deployment. Preserve existing functionality. Verify the actual source and configuration; record test/build results truthfully; document blockers and the exact next action.

## Repository baseline
- Repository: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Default/target branch: `main`
- Baseline `main` SHA inspected: `8e2f4ca51609064893ae226748b5667a97ac8599`
- Latest baseline commit: 2026-10-02 — `Document VITE_API_URL local development`
- GitHub access: metadata read succeeded; connected account reports admin/maintain/push permissions.
- Local clone attempt: blocked because the execution environment could not resolve github.com. Repository inspection and supported file updates are being performed through the connected GitHub integration instead.
- Working tree/uncommitted local changes: no local clone was created; no local project edits are pending.

## Branches and source comparison
Branches discovered: `main`, `development`, `chore/startup-docker-support`.
Compared recursive Git tree entries and blob SHAs:
- `development`: no branch-only files; main contains Docker support files absent on development; README and `src/main.jsx` differ.
- `chore/startup-docker-support`: branch-only `run.py`; README and `src/main.jsx` differ. Main intentionally does not contain that startup runner, which was described by its commit history as backend-coupled.
- Do not merge either branch wholesale. Inspect the relevant differences before deciding whether any source change belongs in production.

## Baseline structure
- React 19 + Vite; `src/main.jsx`, `src/style.css`.
- Build script: `npm run build`.
- Browser tests: `npm run test:e2e` with Playwright.
- Dockerfile requires `VITE_API_URL` at image-build time and uses Vite preview.
- Frontend CI includes build and a frontend/backend Playwright integration job.
- .env example currently points `VITE_API_URL` to `http://localhost:8000`.

## Tests and CI at baseline
- GitHub Actions for baseline `main` SHA `8e2f4ca51609` completed successfully on 2026-10-02: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/36958335105
- This is historical baseline CI, not a new test run for this audit.
- Local lint/typecheck/build/E2E tests have not been run because no local repository clone was available.

## Audit findings and current changes
- The frontend CI workflow currently grants `contents: write` and contains a development-branch step that can auto-commit a generated lockfile. This is unnecessary write access and mutable dependency setup; plan is to use `npm ci` with read-only contents permissions.
- Frontend source visibly uses `credentials: "include"` and the existing `VITE_API_URL`; backend access must remain separately configured.
- No frontend code changes have been committed yet beyond this progress record.

## Deployment status and outstanding prerequisites
- No live frontend deployment or production URL has been established.
- Production `VITE_API_URL` must be the public HTTPS backend origin at build time.
- A compatible deployed backend, allowed CORS origin, and hosting configuration are still required.
- No credentials or secrets are recorded here.

## Next action
1. Harden `.github/workflows/ci.yml` (least privilege and reproducible `npm ci`).
2. Compare frontend source/contract expectations with backend routes and schemas.
3. Verify the resulting GitHub Actions run and record its result.
4. Update this file with the actual changed paths, CI results, current SHA, and remaining deployment prerequisites.
