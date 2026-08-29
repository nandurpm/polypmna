# Hooks

## Purpose

Contains client-facing React hooks that adapt viewport and Convex authentication state.

## Contents

- `use-auth.ts` — combined user/auth/action interface.
- `use-mobile.ts` — responsive-breakpoint state.

## Responsibilities

Reusable hook state belongs here; route rendering belongs in `pages/`.

## Important Notes

Authentication identity is still enforced on the Convex backend; client hook state is not an authorization boundary.
