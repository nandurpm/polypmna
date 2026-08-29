# Libraries

## Purpose

Contains curriculum adapters, POLY AI policy/fallback logic, local persistence, safe redirect handling, base-path resolution, and class utilities.

## Contents

- `polydata.ts` — public curriculum/resource adapter.
- `polyAi.ts` — scope and offline answers.
- `polyAiStorage.ts` — versioned browser persistence.
- `authRedirect.ts` — safe return targets.
- `siteBase.ts` — hosting-aware URLs.
- `utils.ts` — CSS class merging.

## Responsibilities

Reusable non-component logic belongs here; privileged data operations belong in `convex/`.

## Important Notes

Public-source adapters must preserve revision and provenance distinctions; browser storage must remain non-secret.
