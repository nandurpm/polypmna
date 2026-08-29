# Workflows

## Purpose

Automates security analysis, deployment, public-resource checks, and AI-provider health monitoring.

## Contents

- `codeql.yml` — JavaScript/TypeScript security analysis.
- `datadog-synthetics.yml` — credential-gated Datadog synthetic tests.
- `deploy.yml` — Bun tests/build, GitHub Pages publication, and optional Convex deployment.
- `provider-latency-monitor.yml` — scheduled provider latency checks.
- `resource-health.yml` — scheduled public curriculum-resource checks.
- `weekly-ai-health-report.yml` — retained provider health artifacts.

## Responsibilities

Keep CI orchestration here and reusable operational logic in `scripts/`.

## Important Notes

Server credentials are consumed only through Actions secrets and are never embedded in the static Vite bundle.
