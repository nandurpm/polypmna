# Public Assets

## Purpose

Contains files copied unchanged into the Vite production output.

## Contents

- `logo.svg` — install and browser branding.
- `manifest.webmanifest` — progressive-web-app metadata.
- `robots.txt` and `sitemap.xml` — crawler guidance and canonical routes.

## Responsibilities

Only deployment-ready public files belong here; imported source assets belong in `src/assets/`.

## Important Notes

Paths must work under both the GitHub Pages project base and the custom domain.
