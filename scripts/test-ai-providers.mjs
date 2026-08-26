#!/usr/bin/env node

const query = process.argv.slice(3).join(" ") ||
  "Explain how to count curriculum subjects by revision, department, and semester, including duplicate course codes and unavailable resources.";
const requested = process.argv[2] || "both";

const providers = {
  openrouter: {
    label: "OpenRouter",
    key: process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API,
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    headers: {
      "HTTP-Referer": process.env.POLY_AI_SITE_URL || "https://nandurpm.github.io/polypmna/",
      "X-Title": "POLY PMNA local provider test",
    },
  },
  nvidia: {
    label: "NVIDIA",
    key: process.env.NVIDIA_API_KEY || process.env.NVIDIA_API || process.env.NVDIA_API,
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    model: process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct",
    headers: {},
  },
};

const selected = requested === "both" ? Object.values(providers) : [providers[requested]];
if (selected.some((provider) => !provider)) {
  console.error("Usage: node scripts/test-ai-providers.mjs [openrouter|nvidia|both] [question]");
  process.exit(2);
}

const system = "You are POLY AI. Answer accurately and concisely for Kerala Polytechnic students. Use Markdown when helpful.";

for (const provider of selected) {
  if (!provider.key) {
    console.log(`${provider.label}: SKIPPED (set its local environment variable first)`);
    continue;
  }

  try {
    const response = await fetch(provider.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.key}`,
        "Content-Type": "application/json",
        ...provider.headers,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: query },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    const body = await response.json().catch(() => ({}));
    const answer = body?.choices?.[0]?.message?.content;
    if (!response.ok) {
      console.error(`${provider.label}: FAIL HTTP ${response.status} — ${body?.error?.message || "provider error"}`);
      continue;
    }
    if (!answer) {
      console.error(`${provider.label}: FAIL — response contained no assistant message`);
      continue;
    }
    console.log(`\n${provider.label}: PASS (${provider.model})`);
    console.log(answer.slice(0, 900));
  } catch (error) {
    console.error(`${provider.label}: FAIL — ${error instanceof Error ? error.message : "request error"}`);
  }
}
