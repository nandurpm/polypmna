#!/usr/bin/env node

const scenarios = [
  {
    name: "rate-limit then NVIDIA success",
    providers: [
      { name: "OpenRouter (cohere/north-mini-code:free)", status: 429, retryAfter: "2" },
      { name: "OpenRouter (google/gemma-4-31b-it:free)", status: 503 },
      { name: "NVIDIA (nvidia/nemotron-3.5-lightning-30b-a3b)", status: 200, content: "KVL states that the algebraic sum of voltages around a closed loop is zero." },
    ],
    expectedProvider: "NVIDIA (nvidia/nemotron-3.5-lightning-30b-a3b)",
  },
  {
    name: "all providers unavailable then offline answer",
    providers: [
      { name: "OpenRouter (cohere/north-mini-code:free)", status: 429, retryAfter: "1" },
      { name: "OpenRouter (google/gemma-4-31b-it:free)", status: 429, retryAfter: "1" },
      { name: "NVIDIA (nvidia/nemotron-3.5-lightning-30b-a3b)", status: 504 },
    ],
    expectedProvider: "OFFLINE_FALLBACK",
  },
];

async function simulatedRequest(provider) {
  await new Promise((resolve) => setTimeout(resolve, 5));
  if (provider.status === 200) return { ok: true, content: provider.content };
  const error = new Error(`${provider.name} returned HTTP ${provider.status}`);
  error.status = provider.status;
  error.retryAfter = provider.retryAfter;
  throw error;
}

async function runScenario(scenario) {
  const attempts = [];
  for (const provider of scenario.providers) {
    try {
      const result = await simulatedRequest(provider);
      attempts.push({ provider: provider.name, status: "success" });
      return { selected: provider.name, attempts, content: result.content };
    } catch (error) {
      attempts.push({
        provider: provider.name,
        status: error.status === 429 ? "rate_limited" : "failed",
        httpStatus: error.status,
        retryAfterSeconds: error.retryAfter ? Number(error.retryAfter) : null,
      });
    }
  }
  attempts.push({ provider: "OFFLINE_FALLBACK", status: "selected" });
  return {
    selected: "OFFLINE_FALLBACK",
    attempts,
    content: "Offline technical fallback answer selected after all configured providers failed.",
  };
}

for (const scenario of scenarios) {
  const result = await runScenario(scenario);
  const passed = result.selected === scenario.expectedProvider;
  console.log(JSON.stringify({ scenario: scenario.name, passed, ...result }));
  if (!passed) process.exitCode = 1;
}

console.log("Simulation complete. No network request, API key, or provider quota was used.");
