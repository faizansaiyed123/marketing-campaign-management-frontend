# Project Progress — Marketing Campaign Management Frontend

## Objective and acceptance criteria
Prepare the existing frontend to work reliably with the separate backend and for production deployment. Preserve existing functionality, verify source/configuration, record actual test results, and document external blockers.

## Repository baseline and current state
- Repository: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Target/default branch: `main`; branch metadata reports protection disabled.
- Initial baseline SHA inspected: `8e2f4ca51609064893ae226748b5667a97ac8599`.
- Latest application-code commit: `f17497468bcc3c577f414d44a3993615051e2417` — mobile navigation accessibility/visibility fix.
- Latest CI configuration commit: `63ddd355c12911212fd86a91d616712f873bb580`.
- Latest deployment documentation commit before this progress refresh: `57ead18ae97272cbdb3874e5dc1b5eb60e513f2b`.
- GitHub connection reports admin/maintain/push permissions.
- A local clone attempt failed because the execution environment could not resolve github.com. Repository edits were committed through the GitHub integration; there are no local uncommitted project changes.

## Branch and source audit
Branches discovered: `main`, `development`, `chore/startup-docker-support`.
- Recursive file-tree and blob-SHA comparison found both non-main branches behind main with zero commits ahead.
- `development` has no branch-only files; main contains newer Docker files, app code, and documentation.
- `chore/startup-docker-support` contains a branch-only `run.py` that tries to locate/start the separate backend from the frontend repository. The later main-branch removal of that coupled runner is intentional; it remains excluded.
- Frontend API path references were mapped to backend routers for authentication, audiences/contacts, campaigns, dashboard, and analytics. The major route families and methods align.
- No branches were merged wholesale.

## Changes committed
- `.github/workflows/ci.yml`: reduced permission from `contents: write` to `contents: read`; removed automatic lockfile commit/push on development; uses `npm ci` in build and integration jobs.
- `src/main.jsx`, `src/style.css`: rendered sidebar icons as separate elements with accessible labels; mobile widths no longer hide the icons along with their labels.
- `tests/e2e/campaign-workflow.spec.js`: added a mobile navigation regression test that checks visible icons/button accessibility and navigation at 390px viewport width.
- `Dockerfile`, `docker-compose.yml`, `nginx.conf`: replaced the Vite preview runtime with an unprivileged Nginx static server; Docker maps host port 5173 to container port 8080; Nginx adds baseline security headers and SPA fallback.
- `README.md`: documented public HTTPS `VITE_API_URL` build-time configuration, the static-server container, and SameSite=Strict cookie domain requirements.
- `.github/workflows/ci.yml`: added a production container smoke test for the built HTML and Nginx security headers.
- `PROJECT_PROGRESS.md`: retained this audit and deployment checkpoint.

## CI and test verification
- Historical baseline at SHA `8e2f4ca51609` passed CI: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/36958335105
- CI hardening commit `63ddd355c129` passed its updated CI run: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39286677859
- Mobile-navigation commit `f17497468bcc` passed both jobs: frontend production build and Playwright integration tests, including backend migrations/setup and the browser workflow: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39287160573
- For docs commit `57ead18ae972`, the build and integration jobs both reported `completed / success` at the last jobs API check. The overall run had not yet published its final conclusion: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39287610762
- The local environment did not have a usable GitHub clone, so no local test run is claimed.

## Deployment status and prerequisites
- No live deployment has been attempted; no production URL is claimed.
- Set `VITE_API_URL` to the public HTTPS backend origin at build time; rebuild the frontend image after changing this variable.
- Configure backend `FRONTEND_ORIGIN` to the exact HTTPS frontend origin.
- Since the backend session cookie uses `SameSite=Strict`, deploy frontend and API using HTTPS custom domains under the same registrable domain (for example, `app.example.com` and `api.example.com`). Unrelated default hostnames may block cookie-based sessions.
- A deployed backend, PostgreSQL/migrations, secure server-side environment configuration, and optional SMTP configuration remain external prerequisites.
- No secrets are stored here.

## Latest container hardening commit and pending verification
- The production Nginx container and image-build CI are committed on `main`; latest code commit at start of this check: `45c59afbf59d03695fdfa031e11cb918c5494363`.
- The CI workflow is being extended to run the container and verify the generated HTML plus key response headers. The result for that new workflow step must be confirmed after its run completes.

## Next action
1. Verify the production container smoke test and the full integration job on the latest `main` SHA.
2. Re-check final remote heads and deployment prerequisites.
