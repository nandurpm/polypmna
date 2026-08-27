# POLY PMNA Free-First Stack

POLY PMNA is intentionally organized around services that have useful free allowances and do not require exposing provider credentials in the browser. The current design keeps the public React application on GitHub Pages, keeps source and curriculum assets in public GitHub repositories or official SITTTR resources, and uses Convex only for authenticated state and server-side actions.

| Capability | Free-first implementation | Why it stays |
| --- | --- | --- |
| Public website | GitHub Pages with the custom domain | Static hosting, HTTPS, custom-domain support, and public-repository Actions integration are sufficient for the current site. |
| Builds and tests | GitHub Actions | Public-repository standard runners are free; tests run before deployment. |
| Dependency security | Dependabot and CodeQL | GitHub-native maintenance and security scanning avoid another paid monitoring service. |
| Curriculum and PDFs | Public GitHub raw assets plus official SITTTR links | Avoids storing large PDFs in a metered backend and preserves direct downloads. |
| Authenticated data | Convex Free plan, monitored | Reactive queries, authentication, streaming records, and server-side actions are already integrated. |
| AI | Free OpenRouter variants first, NVIDIA fallback | Free models reduce cost; NVIDIA remains available when free providers are degraded or unavailable. All keys remain server-side. |
| Local privacy | Browser localStorage for drafts and recent chat history | Zero backend storage cost for local history and drafts. |
| Resource monitoring | Scheduled GitHub Actions checks | Validates real manifests and representative PDFs/lessons without consuming AI quota. |
| Analytics | No mandatory third-party analytics | Avoids privacy, cost, and script-failure dependencies; add only a verified free privacy-friendly option if needed later. |
| Versioned archives | GitHub Releases when a downloadable bundle is useful | Releases support large versioned assets without adding a storage vendor. |

## AI free-tier safeguards

The Convex action now defaults to free-first provider ordering through `POLY_AI_FREE_FIRST=true`. OpenRouter is configured with free model variants and provider fallback behavior. NVIDIA remains a secondary route and can be restored to first position by setting `POLY_AI_FREE_FIRST=false` if the user intentionally prefers it. The per-user sliding-window limit remains in place, and provider health records can reorder routes after failures.

OpenRouter documents a 20 requests/minute free-model limit. Its daily free-model limit is 50 requests/day when fewer than 10 credits have ever been purchased and 1,000 requests/day after at least 10 credits have been purchased. These are provider limits, not guarantees of availability; the application must still handle upstream 429, 502, 503, timeout, and empty-response cases. [1]

## Maintenance commands

Run `npm run test:run` for the unit suite, `npm run check:resources` to verify the public curriculum manifests and representative resources, and `npm run build` to validate the production bundle. The scheduled resource-health workflow is intentionally deterministic and does not call NVIDIA or OpenRouter.

## When to consider a migration

A migration to another backend should happen only after measured Convex free-plan usage becomes a real constraint. Convex’s current free limits include 0.5 GB database storage, 1,000,000 function calls/month, 20 GB-hours/month action compute, 1 GB file storage, and 1 GB/month file egress. Supabase Free is a credible SQL alternative, but its free project pausing and 5 GB egress limit make it a poor reason to migrate a live, reactive application preemptively. Cloudflare Workers Free is useful for an optional edge layer, but its 10 ms CPU limit makes it unsuitable as a direct replacement for the current AI orchestration without redesign. [2] [3] [4]

## References

[1]: https://openrouter.ai/docs/api_reference/limits "OpenRouter API limits"
[2]: https://docs.convex.dev/production/state/limits "Convex limits"
[3]: https://supabase.com/pricing "Supabase pricing"
[4]: https://developers.cloudflare.com/workers/platform/limits/ "Cloudflare Workers limits"
