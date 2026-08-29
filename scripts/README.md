# Scripts

## Purpose

Contains explicit maintenance, provider-monitoring, resource-checking, and deployment-setup commands.

## Contents

- `check-public-resources.mjs` — verifies public curriculum sources.
- `check-openrouter-usage.mjs` — reads quota metadata.
- `monitor-ai-providers.mjs` and `test-ai-providers.mjs` — opt-in provider checks.
- `simulate-ai-failover.mjs` — offline failure simulation.
- `generate-ai-health-report.mjs` — CI report generator.
- `generate-convex-auth-keys.mjs` — deployment key material generator.

## Responsibilities

Operational command logic belongs here; runtime application behavior belongs in `src/`.

## Important Notes

Scripts that use credentials read environment variables and must never print or persist secret values.
