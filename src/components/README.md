# Components

## Purpose

Contains reusable product-level React components and the shared UI primitive library.

## Contents

- `LogoDropdown.tsx` — authenticated logo navigation.
- `PolyAiMessage.tsx` — local rich-answer renderer.
- `RequireAuth.tsx` — route guard.
- `SeoHead.tsx` — route metadata synchronization.
- `ui/` — accessible reusable controls.

## Responsibilities

Cross-page UI and behavior belong here; complete route screens belong in `pages/`.

## Important Notes

Components may consume hooks and libraries but should not bypass Convex authorization rules.
