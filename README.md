# webmodule-playwright-tests — UI automation skeleton (Playwright + TypeScript)

This is a **reference architecture / skeleton**, not yet the real webmodule test suite. It exists to demonstrate a
project layout (Page Object Model, fixtures, environments, tagging, visual regression, CI) that scales cleanly, with
one working example spec end-to-end so the pattern can be exercised rather than just read. The example content will
be replaced with real webmodule flows once the migration plan below is resolved.

See `PLAYWRIGHT_MIGRATION_PROPOSAL.md` at the repo root for the actual migration plan for webmodule's Codeception
suite (`/tests`) to Playwright, including open questions that need answers (target environment, CI platform,
gateway test strategy) before real webmodule specs get written on top of this skeleton.

## Features

- **Playwright** and **TypeScript**
- **Page Object Model** (`page-objects/pages`, `page-objects/components`)
- Dedicated **setup** project (`tests/auth.setup.ts`): login and persisted session in `auth/storageState.json` (directory is `.gitignore`d)
- Test tags: `@REGRESSION`, `@SMOKE` (`constant/test-tags.constant.ts`)
- Environments and base URL: `configs/environments.ts`, selected with `ENV`
- Visual regression layer (`lib/visual/*`): page-stabilization before screenshots, configurable diff thresholds
- HTML report and JSON results (`playwright-report`, `reports/test-results.json`)
- GitHub Actions workflow for push/PR runs (`.github/workflows/playwright.yml`)

## Requirements

- Node.js (LTS)
- npm

## Setup

```bash
npm install
npx playwright install
```

## Environment variables

Create a `.env` file in the project root. It is loaded via `dotenv` in the Playwright config and `configs/global.ts`. In CI, the same variables are set as GitHub Actions repository secrets (see below).

| Variable            | Description                                                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ENV`               | Environment: `dev`, `qa`, `stage`, `prod`. Defaults to `prod`. Only `prod` currently has a real `baseUrl` set (the example spec's target); `dev`/`qa`/`stage` are empty placeholders in `configs/environments.ts` until a real target environment is decided. |
| `LOGIN`             | Username for login.                                                                                                                                                                                                                                           |
| `PASSWORD`          | Account password.                                                                                                                                                                                                                                             |
| `ADMIN_LOGIN`       | Admin/HQ username, used by `WebControlPanelHelper` (`lib/core/helpers/web-control-panel.helper.ts`) to log in to `Admin/HQ` before setting licensing/settings on a skin.                                                                                      |
| `ADMIN_PASSWORD`    | Admin/HQ password.                                                                                                                                                                                                                                            |
| `ADMIN_TOTP_SECRET` | Base32 TOTP secret for the Admin/HQ account's two-factor auth (shown at `Admin/HQ/Tokens/Setup`/`Show`) — used to generate a live login code, same mechanism as an authenticator app.                                                                         |

> `use.baseURL` in `playwright.config.ts` is the Playwright default. **Navigation in tests** uses `testConfig.baseUrl` from `configs/environments.ts`, not `process.env.BASE_URL`.

## Running tests

```bash
# all tests (setup authentication runs first)
npx playwright test

# by tag
npm run test:regression
npm run test:smoke

# Playwright UI mode
npm run test:ui
```

After a run, open the report with `npx playwright show-report`. **Don't open `playwright-report/index.html`
directly (double-click / `file://`)** — the report loads screenshots, videos and traces via `fetch()` from the
neighbouring `data/` folder, which browsers block under `file://`. If you only need the raw failure video without
the HTML report, it's in the `test-results` folder (and uploaded as a separate CI artifact — see below).

## CI (GitHub Actions)

`.github/workflows/playwright.yml` — runs on push/PR to `main`/`master`, and manually via "Run workflow"
(`workflow_dispatch`) in the Actions tab.

Steps: checkout → `actions/setup-node` → `npm ci` → `npx playwright install --with-deps chromium` (only the
`chromium` project is active in `playwright.config.ts`) → `npm run test`. `playwright-report` and `test-results`
are uploaded as a build artifact regardless of pass/fail, so failures can be inspected without re-running locally.

`CI=true` is set automatically by GitHub Actions on every runner — `playwright.config.ts` reads
`process.env.CI` for retries/workers/headless/`forbidOnly`, no manual env var needed.

Required repository secrets (Settings → Secrets and variables → Actions), same names as the `.env` variables above:

| Secret                                                 | Purpose                                          |
| ------------------------------------------------------ | ------------------------------------------------ |
| `LOGIN` / `PASSWORD`                                   | Login credentials                                |
| `FIRST_NAME` / `LAST_NAME`                             | Used by `authConfig` (`configs/environments.ts`) |
| `ADMIN_LOGIN` / `ADMIN_PASSWORD` / `ADMIN_TOTP_SECRET` | Admin/HQ credentials for `WebControlPanelHelper` |

Note: the runner is Linux (`ubuntu-latest`), same OS family as before — `toHaveScreenshot` baselines are
pixel-sensitive to OS/browser version, so regenerate `tests/__snapshots__` on a matching Linux environment if
they ever drift, not on macOS.

## Project layout

| Path            | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `tests/`        | Specs and `auth.setup.ts`                              |
| `page-objects/` | Pages and components                                   |
| `configs/`      | Environments and shared `testConfig`                   |
| `lib/core/`     | Extended `test` with page fixtures, utilities          |
| `lib/visual/`   | Visual regression config, page preparation, assertions |
| `constant/`     | Routes, tags, screenshot names                         |

## Practices

- Add scenarios through page objects and the shared `test` from `lib/core/page-manager.fixture.ts`.
- Keep secrets in `.env` or CI secrets, not in the repo.

---

## Example test case: login page screenshot

The one spec currently in the repo (`tests/login.spec.ts`, tagged `@REGRESSION` `@SMOKE`) opens a login page and
asserts a full-page screenshot via `lib/visual`. It exists to exercise the framework end-to-end (fixtures → page
object → visual assertions → CI artifact upload), not as coverage that matters for webmodule. Expect it to be
replaced once the migration plan's open questions are resolved.
