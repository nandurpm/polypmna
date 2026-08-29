# Tests

## Purpose

Contains unit tests for pure helpers that sit outside the co-located source-test convention.

## Contents

- `authRedirect.test.ts` — safe redirect validation.
- `polyAi.scope.test.ts` — AI topic-scope and fallback behavior.

## Responsibilities

Fast deterministic tests belong here or beside their source; external-provider probes belong in `scripts/` and are opt-in.

## Important Notes

The Vitest suite runs in Node and must not require real credentials or live network access.
