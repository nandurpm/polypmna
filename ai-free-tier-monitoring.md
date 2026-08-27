# AI Free-Tier Monitoring Notes

## OpenRouter

OpenRouter documents the `GET https://openrouter.ai/api/v1/key` endpoint for current key usage and credit information. The response includes `data.usage`, `usage_daily`, `usage_weekly`, `usage_monthly`, `limit_remaining`, `limit`, and `is_free_tier`. The Activity page can be filtered by model, provider, and API key. Successful inference responses do not include rate-limit headers; when OpenRouter returns a platform-level 429, inspect `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After`.

The documented free-model limits are 20 requests per minute. The daily limit is 50 free-model requests when fewer than 10 credits have been purchased and 1,000 requests per day after at least 10 credits have been purchased. These are account/platform limits and can be distinct from upstream provider capacity.

Source: https://openrouter.ai/docs/api_reference/limits
Source: https://openrouter.ai/docs/faq

## Convex

Convex provides usage visibility from the dashboard at https://dashboard.convex.dev/. The official limits documentation currently lists the Free tier at 1,000,000 function calls/month, 0.5 GB database storage, 1 GB/month database I/O, 20 GB-hours/month action compute, 1 GB file storage, 1 GB/month file egress, and 3,000 search query-GBs/month. Free-plan overages can cause function errors after the limit is exceeded for an extended period, so dashboard monitoring and alert emails should be used.

Source: https://docs.convex.dev/dashboard/overview
Source: https://docs.convex.dev/production/state/limits

## Local failover simulation

The repository script `scripts/simulate-ai-failover.mjs` uses deterministic mock responses only. It simulates an OpenRouter free-model HTTP 429, a second free-model HTTP 503, successful NVIDIA fallback, and a scenario where all configured providers fail and the offline fallback is selected. It never calls a network endpoint and never reads a real API key.

The repository script `scripts/check-openrouter-usage.mjs` calls the OpenRouter key endpoint only when the user explicitly runs it with a local `OPENROUTER_API_KEY` or `OPENROUTER_API` environment variable. It prints only non-secret usage fields and never prints the key itself.
