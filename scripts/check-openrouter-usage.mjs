#!/usr/bin/env node

const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API;
const freeDailyLimit = Number(process.env.OPENROUTER_FREE_DAILY_LIMIT || 50);

if (!apiKey) {
  console.error(
    "OpenRouter usage check skipped: set OPENROUTER_API_KEY in the local environment.",
  );
  process.exit(2);
}

const response = await fetch("https://openrouter.ai/api/v1/key", {
  headers: { Authorization: `Bearer ${apiKey}` },
});
const payload = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(`OpenRouter usage check failed with HTTP ${response.status}.`);
  process.exit(1);
}

const data = payload.data || {};
const result = {
  provider: "OpenRouter",
  key_label: typeof data.label === "string" ? data.label : null,
  is_free_tier: data.is_free_tier ?? null,
  usage_credits: {
    daily: data.usage_daily ?? null,
    weekly: data.usage_weekly ?? null,
    monthly: data.usage_monthly ?? null,
    all_time: data.usage ?? null,
  },
  credit_limit_remaining: data.limit_remaining ?? null,
  free_model_limits: {
    requests_per_minute: 20,
    requests_per_day_assumed: freeDailyLimit,
    note: "The /api/v1/key response reports credit usage, not a free-model request counter. Use the OpenRouter Activity page for request-level history.",
  },
};

console.log(JSON.stringify(result, null, 2));
console.log("No API key value was printed.");
