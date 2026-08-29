# POLY PMNA

## Overview

POLY PMNA is a student resource and study application for Kerala Polytechnic curricula. The public React site brings together revision-specific subjects, lessons, syllabi, model papers, notes, and question papers. Authenticated students can also use POLY AI and Convex-backed mock exams, while browser-local tools provide CGPA, attendance, timetable, and study-planning support.

The frontend is deployed as a static single-page application. Convex supplies authentication, persisted educational data, chat streams, provider health, request limits, and server-side AI actions. Provider credentials never belong in the browser bundle.

## What This Project Does

- Normalizes 2026, 2021, and 2015 curriculum resources from public project manifests and official SITTTR links.
- Lets students browse departments and subjects, then open revision-aware lessons, PDFs, syllabi, and model papers.
- Searches and filters a public question-paper collection.
- Provides authenticated mock exams and attempt history through Convex.
- Provides authenticated POLY AI chat with topic boundaries, streaming, provider failover, quota controls, and deterministic offline answers.
- Offers browser-local student calculators and planning tools without requiring backend storage.
- Publishes crawler metadata and installable web-app metadata for the hosted site.

## Technology Stack

| Area | Implementation |
|---|---|
| Frontend | React 19, TypeScript, React Router 8, Vite 8 |
| Styling | Tailwind CSS 4, Radix UI primitives, Framer Motion |
| Backend | Convex queries, mutations, actions, HTTP routing, and Convex Auth |
| AI | Server-side NVIDIA and OpenRouter chat-completions providers with local fallback |
| Testing | Vitest |
| Quality | ESLint, Prettier, TypeScript project builds, CodeQL, Dependabot |
| Hosting | GitHub Pages plus optional Convex production deployment |
| Package manager | Bun (the deployment workflow and `bun.lock` are authoritative) |

## Project Structure

| Path | Responsibility |
|---|---|
| [`src/`](src/README.md) | React application, Convex backend, shared libraries, hooks, and theme. |
| [`src/pages/`](src/pages/README.md) | Lazy route-level screens. |
| [`src/components/`](src/components/README.md) | Product components and reusable UI primitives. |
| [`src/convex/`](src/convex/README.md) | Trusted backend schema, auth, data APIs, chat, health, quotas, and seeding. |
| [`src/lib/`](src/lib/README.md) | Curriculum adapters, AI policy/fallback logic, storage, URLs, and redirects. |
| [`scripts/`](scripts/README.md) | Resource checks, provider monitoring, simulations, and deployment setup. |
| [`tests/`](tests/README.md) | Deterministic unit tests for redirect and AI-scope helpers. |
| [`public/`](public/README.md) | Static install, crawler, and branding files copied by Vite. |
| [`docs/`](docs/README.md) | Architecture and operations notes. |
| [`.github/`](.github/README.md) | Deployment, security, dependency, and health automation. |
| `isolate/` | Checked-in generated site snapshot; do not edit as source. |

Convex bindings under `src/convex/_generated/` and files under `isolate/` are generated artifacts. Update their source or generator instead of adding handwritten documentation to those files.

## Installation

Prerequisites:

- A current Bun runtime.
- A Convex deployment for features that require authentication or persisted backend state.

```bash
git clone https://github.com/nandurpm/polypmna.git
cd polypmna
bun install --frozen-lockfile
cp .env.example .env.local
```

Set `VITE_CONVEX_URL` in `.env.local` before starting the client. The application intentionally throws a startup error rather than silently connecting a fork to the production backend.

## Configuration

Use [`.env.example`](.env.example) as the non-secret template. Important variables are grouped by where they are safe to use.

### Browser build

| Variable | Purpose |
|---|---|
| `VITE_CONVEX_URL` | Public Convex client URL required by the React application. |
| `VITE_BASE_PATH` | Optional deployment base, such as `/polypmna/` for GitHub Pages. |

Only values safe for public exposure may use the `VITE_` prefix.

### Convex deployment

| Variable | Purpose |
|---|---|
| `CONVEX_DEPLOYMENT` | Deployment selected by local Convex tooling. |
| `CONVEX_SITE_URL` | Convex Auth issuer/site URL. |
| `SITE_URL` | Allowed application URL used by authentication. |
| `VLY_CONVEX_AUTH_ISSUER` | Federated Freebuff JWT issuer. |
| `OPENROUTER_API_KEY` | Server-only OpenRouter credential. |
| `NVIDIA_API_KEY` | Server-only NVIDIA credential. |
| `OPENROUTER_MODELS`, `NVIDIA_MODEL` | Provider model configuration. |
| `POLY_AI_*` | Server-side timeouts, output limits, cooldowns, request budgets, and site metadata. |
| `JWT_PRIVATE_KEY`, `JWKS` | Convex Auth signing material. |

### GitHub Actions

`CONVEX_DEPLOY_KEY` enables the optional Convex deployment job. Provider and Datadog credentials are read from GitHub Actions secrets. Never commit their values, place them in `VITE_` variables, or paste them into documentation.

## Running Locally

```bash
bun run dev
```

Vite listens on port `5173`. Open the URL shown by the terminal. Public curriculum screens use the remote manifests defined in `src/lib/polydata.ts`; authenticated screens additionally require a reachable Convex deployment.

For local Convex development, use the deployment selected by `CONVEX_DEPLOYMENT` and the standard Convex CLI workflow:

```bash
bunx convex dev
```

## Build

```bash
bun run build
```

The build runs TypeScript project references and then writes the static Vite application to `dist/`. GitHub Pages supplies route fallbacks and mirrors project-base assets during deployment.

## Testing and Quality Checks

```bash
bun run test:run
bun run lint
bun run build
```

Additional deterministic and opt-in checks:

```bash
bun run check:resources       # live public curriculum/resource health
bun run simulate:ai-failover  # offline provider-failure simulation
bun run monitor:ai            # live provider check; requires server-side keys
bun run report:ai             # writes a provider health report under reports/
```

The unit suite and failover simulation do not need credentials. Provider smoke/monitor commands make explicit network requests and must be run only with locally supplied environment variables.

## Authentication and Authorization

- `src/components/RequireAuth.tsx` protects authenticated routes in the browser and preserves a safe `returnTo` route.
- `src/hooks/use-auth.ts` is the client adapter for Convex authentication state and current-user data.
- Backend operations use `getAuthUserId` or equivalent checks; client authentication state is not an authorization boundary.
- Email OTP and anonymous providers are registered under `src/convex/auth.ts`.
- Federated Freebuff tokens are validated separately through `src/convex/auth.config.ts`.

## POLY AI Boundaries

`src/convex/aiChat.ts` performs provider calls on the server. It applies authenticated rate limits, OpenRouter free-tier request budgets, provider cooldowns, streaming timeouts, and provider failover. `src/lib/polyAi.ts` enforces the application’s educational scope and supplies deterministic local answers when appropriate. `src/components/PolyAiMessage.tsx` renders supported rich answers locally.

See [`ai-free-tier-monitoring.md`](ai-free-tier-monitoring.md) for quota operations and [`integrations.md`](integrations.md) for the current external-service boundaries.

## Deployment

The [deployment workflow](.github/workflows/deploy.yml) runs the unit suite and production build, prepares GitHub Pages SPA fallbacks, and publishes `dist/`. A separate credential-gated job deploys Convex functions and synchronizes server-only provider settings when `CONVEX_DEPLOY_KEY` is present.

- GitHub Pages project URL: `https://nandurpm.github.io/polypmna/`
- Custom domain configured by `CNAME`: `https://gptcperinthalmanna.dpdns.org/`

Changing the Pages base path requires coordinated changes to `VITE_BASE_PATH`, route fallbacks, public URLs, and `src/lib/siteBase.ts`.

## Important Files

- [`src/main.tsx`](src/main.tsx) — providers, routes, lazy loading, and runtime base path.
- [`src/convex/schema.ts`](src/convex/schema.ts) — backend data model and indexes.
- [`src/convex/aiChat.ts`](src/convex/aiChat.ts) — provider orchestration and streaming.
- [`src/lib/polydata.ts`](src/lib/polydata.ts) — public educational source normalization.
- [`vite.config.ts`](vite.config.ts) — build, aliases, chunks, and Pages base behavior.
- [`.env.example`](.env.example) — configuration template without secret values.
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — current release process.

## Documentation Map

- [`src/README.md`](src/README.md) — runtime source map.
- [`src/convex/README.md`](src/convex/README.md) — backend responsibilities and security boundary.
- [`scripts/README.md`](scripts/README.md) — maintenance command behavior.
- [`.github/workflows/README.md`](.github/workflows/README.md) — CI, deployment, and monitoring jobs.
- [`docs/free-first-stack.md`](docs/free-first-stack.md) — free-first infrastructure rationale.
- [`ai-free-tier-monitoring.md`](ai-free-tier-monitoring.md) — provider quota and failover operations.
- [`integrations.md`](integrations.md) — external systems and credential placement.

## Contributing

1. Keep generated files and dependency locks out of documentation-only changes.
2. Add route screens under `src/pages/`, reusable UI under `src/components/`, and trusted data operations under `src/convex/`.
3. Enforce authorization in backend operations even when the matching route is protected.
4. Keep provider keys and signing material in deployment secret stores.
5. Run the unit suite, lint, and production build before opening a pull request.

## Security and Privacy

Do not commit `.env` files, provider credentials, Convex deploy keys, JWT signing material, or exports containing student data. POLY AI drafts and recent local state may be stored in the browser; shared-device users should clear application storage when appropriate. Only monitor or test external resources and providers you are authorized to access.
