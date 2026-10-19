# Project Progress — Marketing Campaign Management Frontend

## Objective and acceptance criteria
Prepare the existing frontend to work reliably with the separate backend and for production deployment. Preserve existing functionality, verify code/configuration, record actual test results, and document blockers and the exact next action.

## Repository baseline and current state
- Repository: https://github.com/faizansaiyed123/marketing-campaign-management-frontend
- Target/default branch: `main`; branch protection was reported disabled.
- Baseline inspected SHA: `8e2f4ca51609064893ae226748b5667a97ac8599`.
- Latest application-code commit made during this audit: `f17497468bcc3c577f414d44a3993615051e2417` — mobile navigation visibility/accessibility fix.
- Latest CI configuration commit: `63ddd355c12911212fd86a91d616712f873bb580`.
- GitHub connection reports admin/maintain/push permissions.
- A local clone attempt failed because the execution environment could not resolve github.com. Repository changes were made through the connected GitHub integration; no local project changes are pending.

## Branch and source audit
Branches discovered: `main`, `development`, `chore/startup-docker-support`.
- Recursive tree/blob comparison showed the non-main branches are behind `main` with zero commits ahead.
- `development` has no branch-only files. Main has Docker support files absent from that older tree and subsequent app/documentation changes.
- `chore/startup-docker-support` contains a branch-only `run.py` that attempts to locate/start the separate backend from the frontend repository. Main's removal of that cross-repository runner is intentional; it is not included in production.
- Frontend API route families were mapped against backend routers for auth, audiences, campaigns, dashboard, and analytics; major paths align.
- No branch was merged wholesale.

## Changes made
- `.github/workflows/ci.yml`: reduced workflow permission to `contents: read`, removed auto-commit/push of a generated lockfile on `development`, and changed dependency installation to `npm ci` in build and integration jobs.
- `src/main.jsx` and `src/style.css`: split navigation icons from labels, retained accessible labels, and kept icons visible at mobile widths instead of applying zero font size to the entire button.
- `tests/e2e/campaign-workflow.spec.js`: added a mobile workspace navigation regression test.
- `README.md`: documented production API URL/build behavior and the same-site cookie deployment requirement.
- This file records progress and deployment prerequisites.

## Tests and CI
- Historical baseline CI passed on 2026-10-02 at SHA `8e2f4ca51609`: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/36958335105
- On the audit CI commit `63ddd355c129`, the `build` job completed successfully, including `npm ci` and `npm run build`. The integration job had not completed at the latest status check: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39286677859
- CI triggered for the mobile-navigation commit `f17497468bcc` was queued at the latest check: https://github.com/faizansaiyed123/marketing-campaign-management-frontend/actions/runs/39287160573
- No local lint/type-check/build/E2E run was possible because github.com could not be resolved from the local execution environment. Do not mark mobile E2E as passed until the linked workflow completes.

## Deployment status and prerequisites
- No live deployment or production URL has been created or verified.
- Set `VITE_API_URL` to the public HTTPS backend origin at build time.
- Set backend `FRONTEND_ORIGIN` to the exact frontend origin; for current SameSite=Strict cookies, use frontend/API custom domains under the same registrable domain.
- Backend HTTPS, PostgreSQL, secure runtime configuration, migrations, and optional SMTP setup are required as applicable.
- No secrets are stored in this file.

## Next action
1. Verify the CI run for `f17497468bcc` and the backend production-hardening run.
2. Fix any CI regressions and record actual results.
3. If CI passes, perform a final remote-state/commit check and document any deployment infrastructure that remains external.
