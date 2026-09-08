import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { isPolyAiUtilityQuery } from "../src/lib/polyAi";

it.each([
  "comparison between android and iphone",
  "create a comparison table about android and iphone",
  "What is the capital of India?",
  "Write a birthday message for my friend",
  "Compare photosynthesis and respiration",
  "put that in a table",
])("routes general question %j to the provider instead of a canned utility", (question) => {
  expect(isPolyAiUtilityQuery(question)).toBe(false);
});

it("has no academic-only refusal branch in the actual chat page", () => {
  const page = readFileSync(new URL("../src/pages/AskAI.tsx", import.meta.url), "utf8");
  expect(page).not.toContain("isPolyAiQueryInScope");
  expect(page).not.toContain("POLY_AI_SCOPE_RESPONSE");
  expect(page).toContain("startChatStream({ messages:");
});

it("removes the contradictory academic-only instructions from both provider paths", () => {
  const backend = readFileSync(new URL("../src/convex/aiChat.ts", import.meta.url), "utf8");
  expect(backend).not.toContain("STRICTLY OUT OF SCOPE");
  expect(backend).not.toContain("You must ONLY answer");
  expect(backend).toContain("including Android versus iPhone");
  expect(backend.match(/content: SYSTEM_PROMPT/g)).toHaveLength(2);
  expect(backend).toContain("follow your safety rules");
  expect(backend).toContain("You do not have live web search");
});
