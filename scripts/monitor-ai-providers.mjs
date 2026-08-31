#!/usr/bin/env node

const requested = process.argv[2] || "both";
const configuredTimeoutMs = Number(process.env.AI_MONITOR_TIMEOUT_MS || 30_000);
const timeoutMs = Number.isFinite(configuredTimeoutMs) ? Math.min(Math.max(configuredTimeoutMs, 5_000), 120_000) : 30_000;
const query = "In two sentences, explain binary search complexity for a Kerala Polytechnic student.";
const system = "You are POLY AI. Answer accurately and concisely for Kerala Polytechnic students.";

function csvModels(value, fallback) {
  return Array.from(new Set((value || fallback).split(",").map((item) => item.trim()).filter(Boolean)));
}

const openRouterModels = csvModels(
  process.env.OPENROUTER_MODELS || process.env.OPENROUTER_MODEL,
  "cohere/north-mini-code:free,google/gemma-4-31b-it:free,nvidia/nemotron-3.5-lightning:free",
);

const providers = {
  nvidia: {
    label: "NVIDIA",
    key: process.env.NVIDIA_API_KEY || process.env.NVIDIA_API || process.env.NVDIA_API,
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    model: process.env.NVIDIA_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b",
    headers: {},
    body: (provider) => ({ model: provider.model }),
  },
  openrouter: {
    label: `OpenRouter (${openRouterModels[0]})`,
    key: process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API,
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: openRouterModels[0],
    headers: {
      "HTTP-Referer": process.env.POLY_AI_SITE_URL || "https://gptcperinthalmanna.dpdns.org/",
      "X-OpenRouter-Title": "POLY PMNA latency monitor",
      "X-Title": "POLY PMNA latency monitor",
    },
    body: (provider) => ({
      model: provider.model,
      provider: {
        allow_fallbacks: true,
        sort: { by: "latency", partition: "none" },
        preferred_max_latency: { p90: 8 },
      },
    }),
  },
};

const selected = requested === "both" ? Object.values(providers) : [providers[requested]];
if (selected.some((provider) => !provider)) {
  console.error("Usage: node scripts/monitor-ai-providers.mjs [openrouter|nvidia|both]");
  process.exit(2);
}

async function measure(provider) {
  if (!provider.key) {
    return { provider: provider.label, status: "skipped", reason: "API key is not configured" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(5_000, timeoutMs));
  const startedAt = performance.now();
  try {
    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.key}`,
        "Content-Type": "application/json",
        ...provider.headers,
      },
      signal: controller.signal,
      body: JSON.stringify({
        ...provider.body(provider),
        messages: [
          { role: "system", content: system },
          { role: "user", content: query },
        ],
        temperature: 0,
        max_tokens: 128,
        stream: false,
      }),
    });
    const durationMs = Math.round(performance.now() - startedAt);
    const payload = await response.json().catch(() => ({}));
    const answer = payload?.choices?.[0]?.message?.content;
    if (!response.ok) {
      return { provider: provider.label, model: payload?.model || provider.model || provider.models?.[0], status: "error", httpStatus: response.status, durationMs };
    }
    if (typeof answer !== "string" || !answer.trim()) {
      return { provider: provider.label, model: payload?.model || provider.model || provider.models?.[0], status: "empty", durationMs };
    }
    return { provider: provider.label, model: payload?.model || provider.model || provider.models?.[0], status: "ok", durationMs };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    return {
      provider: provider.label,
      model: provider.model || provider.models?.[0],
      status: error?.name === "AbortError" ? "timeout" : "error",
      durationMs,
    };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const provider of selected) {
  const result = await measure(provider);
  results.push(result);
  console.log(JSON.stringify(result));
}

const measured = results.filter((result) => result.status !== "skipped");
const failures = measured.filter((result) => result.status !== "ok");
console.log(JSON.stringify({
  summary: {
    measured: measured.length,
    healthy: measured.length - failures.length,
    failed: failures.length,
    timeoutMs,
    browserDeadlineMs: 100_000,
  },
}));

if (measured.length > 0 && failures.length > 0) process.exit(1);
