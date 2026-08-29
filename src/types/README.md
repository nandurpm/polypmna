# Types

## Purpose

Contains handwritten ambient declarations shared across the TypeScript frontend.

## Contents

- `global.d.ts` — project-specific global declarations.

## Responsibilities

Only ambient declarations belong here; module-local contracts should stay beside their implementation.

## Important Notes

`vite-env.d.ts` remains at the `src/` root because it is Vite’s conventional client declaration file.
