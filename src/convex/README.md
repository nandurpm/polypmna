# Convex Backend

## Purpose

Contains the authenticated backend schema and server-executed queries, mutations, actions, HTTP routes, and seed operations.

## Contents

- `schema.ts` — persisted data model and indexes.
- `auth.ts`, `auth.config.ts`, and `auth/` — authentication providers.
- `aiChat.ts` and `chat.ts` — provider orchestration, streams, history, health, and quotas.
- `departments.ts`, `subjects.ts`, `materials.ts`, `questionPapers.ts`, and `mockExams.ts` — educational data APIs.
- `seed.ts` — curriculum importer.
- `users.ts` — authenticated user lookup.
- `http.ts` — backend HTTP routes.

## Responsibilities

Trusted data access and external-provider calls belong here; browser-only presentation belongs outside this folder.

## Important Notes

Never expose provider keys through `VITE_` variables. `_generated/` is machine-generated and must not be edited manually.
