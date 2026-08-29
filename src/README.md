# Source

## Purpose

Contains the React frontend, Convex backend, shared educational data adapters, and application styles.

## Contents

- `components/` — reusable application and UI components.
- `convex/` — backend schema, queries, mutations, actions, and auth.
- `hooks/` — client state adapters.
- `lib/` — domain-neutral and curriculum/AI helpers.
- `pages/` — route-level screens.
- `main.tsx` — client composition and routes.
- `instrumentation.tsx` — sanitized browser error capture.
- `index.css` — global theme.

## Responsibilities

Product runtime code belongs here; CI and maintenance commands belong in `.github/` and `scripts/`.

## Important Notes

The `@` alias resolves to this folder. Generated Convex bindings under `_generated/` must be regenerated, not manually edited.
