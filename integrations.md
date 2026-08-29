# External Integrations

## Purpose

This document records the external systems that the current POLY PMNA implementation actually uses and where their credentials belong. The repository does not currently depend on an `@vly-ai/integrations` package or implement a payment integration.

## Convex

Convex provides the application backend: authentication, persisted educational data, mock-exam attempts, chat history and streams, AI provider health, and rate-limit reservations. The public frontend receives only `VITE_CONVEX_URL`; deployment credentials and backend environment values remain in Convex or GitHub Actions secret storage.

Relevant code:

- `src/convex/schema.ts` — persisted model.
- `src/convex/auth.ts` and `src/convex/auth.config.ts` — local and federated authentication.
- `src/convex/http.ts` — authentication HTTP routes.
- `src/convex/aiChat.ts` and `src/convex/chat.ts` — provider calls, streaming, health, and quotas.

## AI Providers

POLY AI calls OpenRouter and NVIDIA through server-executed Convex actions. Provider order can change according to configuration and recent health. The browser never receives `OPENROUTER_API_KEY` or `NVIDIA_API_KEY`; when providers are unavailable, client code can provide a scope-limited deterministic fallback.

Operational scripts under `scripts/` can make explicit provider or quota requests when a maintainer supplies credentials in the current process environment. They bound output and do not print credential values.

## Email OTP Delivery

The Convex email provider in `src/convex/auth/emailOtp.ts` sends verification codes through the configured Freebuff authentication endpoint. Verification tokens expire after 15 minutes. Email delivery configuration is a server-side security boundary and must never be copied into client code or public build variables.

## Federated Authentication

`src/convex/auth.config.ts` accepts federated Freebuff JWTs in addition to the application’s own Convex Auth tokens. It reads the issuer from `VLY_CONVEX_AUTH_ISSUER` and derives the JWKS endpoint from that trusted issuer.

## Public Educational Sources

`src/lib/polydata.ts` reads public JSON manifests and content from:

- `nandurpm/poly-pmna-pdf-files` for PDF metadata and files.
- `nandurpm/diploma-notes` for curriculum and lesson manifests.
- official SITTTR Kerala routes for syllabus and model-paper resources.

These are public content sources, not credentialed APIs. Their revision and source distinctions should remain visible when adapters change.

## GitHub Pages and GitHub Actions

GitHub Pages hosts the static frontend. Actions runs tests, builds route fallbacks, deploys Pages, optionally deploys Convex, scans code, checks public resources, and monitors providers. Credentials referenced by workflows belong in repository Actions secrets; secret values must not be placed in workflow YAML.

## Datadog Synthetics

The synthetic-test workflow is optional. It runs only when `DD_API_KEY` and `DD_APP_KEY` are configured as GitHub Actions secrets. No Datadog runtime SDK is included in the application bundle.

## Credential Rules

- Never prefix server credentials with `VITE_`.
- Never commit `.env` files, deploy keys, private keys, provider tokens, or application secrets.
- Use `.env.example` only for variable names and non-secret example values.
- Treat any credential accidentally committed to Git history as compromised and rotate it in the owning service.
- Keep generated reports and diagnostic output free of secrets and personal student data.
